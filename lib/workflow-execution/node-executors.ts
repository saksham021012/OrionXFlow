import { tasks, runs } from '@trigger.dev/sdk/v3'
import { Node, Edge } from 'reactflow'
import { prisma } from '@/lib/prisma'

// Check if workflow run was cancelled
async function isRunCancelled(runId: string): Promise<boolean> {
    const run = await prisma.workflowRun.findUnique({
        where: { id: runId },
        select: { status: true }
    })
    return run?.status === 'cancelled'
}

// Helper to unwrap Trigger.dev task results
function unwrapTaskOutput(output: any): any {
    if (output && typeof output === 'object') {
        if (output.success === false) {
            throw new Error(output.error || 'Task execution failed')
        }
        if (output.success === true) {
            // For LLM/Text nodes, result is in .result
            if (output.result !== undefined) return output.result
            // For Crop node, result is in .imageUrl
            if (output.imageUrl !== undefined) return output.imageUrl
            // For Frame node, result is in .frameUrl
            if (output.frameUrl !== undefined) return output.frameUrl
        }
    }
    return output
}

// Poll for task completion with cancellation check
async function pollTaskCompletion(handleId: string, runId: string) {
    let run = await runs.retrieve(handleId)
    const pendingStatuses = ['QUEUED', 'EXECUTING', 'WAITING', 'PENDING_VERSION', 'DEQUEUED']

    while (pendingStatuses.includes(run.status)) {
        // Check for workflow cancellation
        if (await isRunCancelled(runId)) {
            console.log(`[DEBUG] Run ${runId} cancelled. Cancelling task ${handleId}`)
            try {
                await runs.cancel(handleId)
            } catch (error) {
                console.error(`Failed to cancel task ${handleId}:`, error)
            }
            throw new Error('Workflow run cancelled')
        }

        await new Promise((resolve) => setTimeout(resolve, 1000))
        run = await runs.retrieve(handleId)
    }

    if (run.status === 'COMPLETED') {
        return unwrapTaskOutput(run.output)
    } else {
        throw new Error(run.error?.message || 'Task failed')
    }
}

// Extract image URLs from various output formats
function extractImageUrl(output: any): string | null {
    if (!output) return null
    if (typeof output === 'string') return output

    // Check for direct properties
    if (output.imageUrl) return output.imageUrl
    if (output.frameUrl) return output.frameUrl
    if (output.url) return output.url

    // Check for nested result object (from node execution)
    if (output.result) {
        const result = output.result
        if (typeof result === 'string') return result

        if (result.imageUrl) return result.imageUrl
        if (result.frameUrl) return result.frameUrl
        if (result.url) return result.url
        // Handle generic result key that is a URL
        if (result.result && typeof result.result === 'string') return result.result
    }

    return null
}

// Get input from connected edge or fallback to default
function getInput(
    edges: Edge[],
    outputs: Map<string, any>,
    nodeId: string,
    handleName: string,
    fallback?: any
): any {
    const edge = edges.find((e) => e.target === nodeId && e.targetHandle === handleName)
    if (!edge) return fallback

    const output = outputs.get(edge.source)
    return output ?? fallback
}

// Execute LLM node
export async function executeLLMNode(
    node: Node,
    edges: Edge[],
    outputs: Map<string, any>,
    runId: string
) {
    const systemPrompt = getInput(edges, outputs, node.id, 'system_prompt')
    const userMessage = getInput(edges, outputs, node.id, 'user_message', node.data.value || '')

    // Get all connected images and videos
    const imageEdges = edges.filter((e) => e.target === node.id && (e.targetHandle?.startsWith('image_') || e.targetHandle === 'images'))

    // DEBUG: Log edges and extraction
    console.log(`[DEBUG LLM] Image edges found: ${imageEdges.length}`)
    imageEdges.forEach(e => {
        const sourceOutput = outputs.get(e.source)
        console.log(`[DEBUG LLM] Source ${e.source} output:`, JSON.stringify(sourceOutput, null, 2))
        console.log(`[DEBUG LLM] Extracted:`, extractImageUrl(sourceOutput))
    })

    const images = imageEdges
        .map((e) => extractImageUrl(outputs.get(e.source)))
        .filter(Boolean) as string[]

    console.log(`[DEBUG LLM] Final images array:`, images)

    const selectedModel = node.data.model || 'gemini-2.5-flash-lite'
    console.log(`[DEBUG] Triggering LLM with model: ${selectedModel}`)

    const handle = await tasks.trigger('llm-execution', {
        model: selectedModel,
        systemPrompt,
        userMessage,
        images,
    })

    let result = await pollTaskCompletion(handle.id, runId)

    return {
        result,
        inputs: {
            systemPrompt,
            userMessage,
            images,
            model: selectedModel,
        }
    }
}

// Execute crop image node
export async function executeCropImageNode(
    node: Node,
    edges: Edge[],
    outputs: Map<string, any>,
    runId: string
) {
    const imageUrl = getInput(edges, outputs, node.id, 'image_url', '')
    const xPercent = getInput(edges, outputs, node.id, 'x_percent', node.data.x_percent || 0)
    const yPercent = getInput(edges, outputs, node.id, 'y_percent', node.data.y_percent || 0)
    const widthPercent = getInput(edges, outputs, node.id, 'width_percent', node.data.width_percent || 100)
    const heightPercent = getInput(edges, outputs, node.id, 'height_percent', node.data.height_percent || 100)

    const handle = await tasks.trigger('crop-image', {
        imageUrl,
        xPercent: Number(xPercent),
        yPercent: Number(yPercent),
        widthPercent: Number(widthPercent),
        heightPercent: Number(heightPercent),
    })

    const result = await pollTaskCompletion(handle.id, runId)
    return {
        result,
        inputs: {
            imageUrl,
            xPercent: Number(xPercent),
            yPercent: Number(yPercent),
            widthPercent: Number(widthPercent),
            heightPercent: Number(heightPercent),
        }
    }
}

// Execute extract frame node
export async function extractFrameNode(
    node: Node,
    edges: Edge[],
    outputs: Map<string, any>,
    runId: string
) {
    const videoUrl = getInput(edges, outputs, node.id, 'video_url', '')
    const timestamp = getInput(edges, outputs, node.id, 'timestamp', node.data.timestamp || '50%')

    const handle = await tasks.trigger('extract-frame', {
        videoUrl,
        timestamp: String(timestamp),
    })

    const result = await pollTaskCompletion(handle.id, runId)
    return {
        result,
        inputs: {
            videoUrl,
            timestamp: String(timestamp),
        }
    }
}

// Main node executor - routes to specific executor based on type
export async function executeNodeByType(
    node: Node,
    edges: Edge[],
    outputs: Map<string, any>,
    runId: string
): Promise<any> {
    switch (node.type) {
        case 'llm':
            return await executeLLMNode(node, edges, outputs, runId)
        case 'cropImage':
            return await executeCropImageNode(node, edges, outputs, runId)
        case 'extractFrame':
            return await extractFrameNode(node, edges, outputs, runId)
        case 'text': {
            const handle = await tasks.trigger('text-execution', { value: node.data.value })
            const result = await pollTaskCompletion(handle.id, runId)
            return { result, inputs: { value: node.data.value } }
        }
        case 'uploadImage': {
            const handle = await tasks.trigger('upload-image-execution', { value: node.data.value })
            const result = await pollTaskCompletion(handle.id, runId)
            return { result, inputs: { value: node.data.value } }
        }
        case 'uploadVideo': {
            const handle = await tasks.trigger('upload-video-execution', { value: node.data.value })
            const result = await pollTaskCompletion(handle.id, runId)
            return { result, inputs: { value: node.data.value } }
        }
        default:
            // Route everything else through Trigger.dev to satisfy requirement
            const val = node.data.value
            const handle = await tasks.trigger('text-execution', { value: val })
            const result = await pollTaskCompletion(handle.id, runId)
            return {
                result,
                inputs: { value: val }
            }
    }
}

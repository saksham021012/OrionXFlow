import { Node, Edge } from 'reactflow'
import { llmExecutionTask } from '@/trigger/llm-execution'
import { cropImageTask } from '@/trigger/crop-image'
import { extractFrameTask } from '@/trigger/extract-frame'
import { textExecutionTask } from '@/trigger/text-execution'
import { uploadImageExecutionTask } from '@/trigger/upload-image-execution'
import { uploadVideoExecutionTask } from '@/trigger/upload-video-execution'

// Extract image URLs from various output formats
function extractImageUrl(output: any): string | null {
    if (!output) return null
    if (typeof output === 'string') return output

    if (output.imageUrl) return output.imageUrl
    if (output.frameUrl) return output.frameUrl
    if (output.url) return output.url

    if (output.result) {
        const result = output.result
        if (typeof result === 'string') return result
        if (result.imageUrl) return result.imageUrl
        if (result.frameUrl) return result.frameUrl
        if (result.url) return result.url
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

// Execute LLM node using triggerAndWait (checkpoint-resume — no idle compute)
export async function executeLLMNode(
    node: Node,
    edges: Edge[],
    outputs: Map<string, any>
) {
    const systemPrompt = getInput(edges, outputs, node.id, 'system_prompt')
    const userMessage = getInput(edges, outputs, node.id, 'user_message', node.data.value || '')

    const imageEdges = edges.filter(
        (e) => e.target === node.id && (e.targetHandle?.startsWith('image_') || e.targetHandle === 'images')
    )

    console.log(`[LLM Node] Image edges found: ${imageEdges.length}`)
    imageEdges.forEach((e) => {
        const sourceOutput = outputs.get(e.source)
        console.log(`[LLM Node] Source ${e.source} output:`, JSON.stringify(sourceOutput, null, 2))
        console.log(`[LLM Node] Extracted URL:`, extractImageUrl(sourceOutput))
    })

    const images = imageEdges
        .map((e) => extractImageUrl(outputs.get(e.source)))
        .filter(Boolean) as string[]

    console.log(`[LLM Node] Final images array:`, images)

    const selectedModel = node.data.model || 'gemini-2.5-flash-lite'
    console.log(`[LLM Node] Triggering with model: ${selectedModel}`)

    // triggerAndWait checkpoints this task until the child completes — zero polling
    const result = await llmExecutionTask.triggerAndWait({
        model: selectedModel,
        systemPrompt,
        userMessage,
        images,
    }).unwrap()

    return {
        result: result.result,
        inputs: { systemPrompt, userMessage, images, model: selectedModel },
    }
}

// Execute crop image node using triggerAndWait
export async function executeCropImageNode(
    node: Node,
    edges: Edge[],
    outputs: Map<string, any>
) {
    const imageUrl = getInput(edges, outputs, node.id, 'image_url', '')
    const xPercent = getInput(edges, outputs, node.id, 'x_percent', node.data.x_percent || 0)
    const yPercent = getInput(edges, outputs, node.id, 'y_percent', node.data.y_percent || 0)
    const widthPercent = getInput(edges, outputs, node.id, 'width_percent', node.data.width_percent || 100)
    const heightPercent = getInput(edges, outputs, node.id, 'height_percent', node.data.height_percent || 100)

    const result = await cropImageTask.triggerAndWait({
        imageUrl,
        xPercent: Number(xPercent),
        yPercent: Number(yPercent),
        widthPercent: Number(widthPercent),
        heightPercent: Number(heightPercent),
    }).unwrap()

    return {
        result: result.imageUrl,
        inputs: {
            imageUrl,
            xPercent: Number(xPercent),
            yPercent: Number(yPercent),
            widthPercent: Number(widthPercent),
            heightPercent: Number(heightPercent),
        },
    }
}

// Execute extract frame node using triggerAndWait
export async function extractFrameNode(
    node: Node,
    edges: Edge[],
    outputs: Map<string, any>
) {
    const videoUrl = getInput(edges, outputs, node.id, 'video_url', '')
    const timestamp = getInput(edges, outputs, node.id, 'timestamp', node.data.timestamp || '50%')

    const result = await extractFrameTask.triggerAndWait({
        videoUrl,
        timestamp: String(timestamp),
    }).unwrap()

    return {
        result: result.frameUrl,
        inputs: { videoUrl, timestamp: String(timestamp) },
    }
}

// Main node executor — routes to specific executor based on type
// Note: runId is no longer needed here; cancellation is handled at orchestrator level
export async function executeNodeByType(
    node: Node,
    edges: Edge[],
    outputs: Map<string, any>
): Promise<any> {
    switch (node.type) {
        case 'llm':
            return await executeLLMNode(node, edges, outputs)

        case 'cropImage':
            return await executeCropImageNode(node, edges, outputs)

        case 'extractFrame':
            return await extractFrameNode(node, edges, outputs)

        case 'text': {
            const taskResult = await textExecutionTask.triggerAndWait({
                value: node.data.value,
            }).unwrap()
            return { result: taskResult.result, inputs: { value: node.data.value } }
        }

        case 'uploadImage': {
            const taskResult = await uploadImageExecutionTask.triggerAndWait({
                value: node.data.value,
            }).unwrap()
            return { result: taskResult.result, inputs: { value: node.data.value } }
        }

        case 'uploadVideo': {
            const taskResult = await uploadVideoExecutionTask.triggerAndWait({
                value: node.data.value,
            }).unwrap()
            return { result: taskResult.result, inputs: { value: node.data.value } }
        }

        default: {
            const taskResult = await textExecutionTask.triggerAndWait({
                value: node.data.value,
            }).unwrap()
            return { result: taskResult.result, inputs: { value: node.data.value } }
        }
    }
}

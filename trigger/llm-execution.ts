import { task } from '@trigger.dev/sdk/v3'
import { generateContent } from '@/lib/gemini'
import { NodeExecutionPayload, handleNodeExecution } from './utils/graph-traversal'

export const llmExecutionTask = task({
    id: 'llm-execution',
    run: async (payload: NodeExecutionPayload) => {
        return handleNodeExecution(payload, 'llm', async (inputs: {
            model: string
            systemPrompt?: string
            userMessage: string
            images?: string[]
        }) => {
            try {
                const result = await generateContent(
                    inputs.userMessage,
                    inputs.systemPrompt,
                    inputs.images,
                    inputs.model
                )

                return {
                    success: true,
                    result,
                }
            } catch (error: any) {
                console.error('LLM Execution Error:', error)
                return {
                    success: false,
                    error: error.message || 'LLM execution failed',
                }
            }
        })
    },
})

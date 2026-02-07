import { task } from '@trigger.dev/sdk/v3'
import { generateContent } from '@/lib/gemini'

export const llmExecutionTask = task({
    id: 'llm-execution',
    run: async (payload: {
        model: string
        systemPrompt?: string
        userMessage: string
        images?: string[]
    }) => {
        try {
            const result = await generateContent(
                payload.userMessage,
                payload.systemPrompt,
                payload.images,
                payload.model
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
    },
})

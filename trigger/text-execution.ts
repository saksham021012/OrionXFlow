import { task } from '@trigger.dev/sdk/v3'
import { NodeExecutionPayload, handleNodeExecution } from './utils/graph-traversal'

export const textExecutionTask = task({
    id: 'text-execution',
    run: async (payload: NodeExecutionPayload) => {
        return handleNodeExecution(payload, 'text', async (inputs: { value: string }) => {
            return {
                success: true,
                result: inputs.value,
            }
        })
    },
})

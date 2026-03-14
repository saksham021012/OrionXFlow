import { task } from '@trigger.dev/sdk/v3'
import { NodeExecutionPayload, handleNodeExecution } from './utils/graph-traversal'

export const uploadVideoExecutionTask = task({
    id: 'upload-video-execution',
    run: async (payload: NodeExecutionPayload) => {
        return handleNodeExecution(payload, 'uploadVideo', async (inputs: { value: string }) => {
            return {
                success: true,
                result: inputs.value,
            }
        })
    },
})

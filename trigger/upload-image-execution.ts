import { task } from '@trigger.dev/sdk/v3'
import { NodeExecutionPayload, handleNodeExecution } from './utils/graph-traversal'

export const uploadImageExecutionTask = task({
    id: 'upload-image-execution',
    run: async (payload: NodeExecutionPayload) => {
        return handleNodeExecution(payload, 'uploadImage', async (inputs: { value: string }) => {
            return {
                success: true,
                result: inputs.value,
            }
        })
    },
})

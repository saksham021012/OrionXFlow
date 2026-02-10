import { task } from '@trigger.dev/sdk/v3'

export const uploadImageExecutionTask = task({
    id: 'upload-image-execution',
    run: async (payload: {
        value: string
    }) => {
        return {
            success: true,
            result: payload.value,
        }
    },
})

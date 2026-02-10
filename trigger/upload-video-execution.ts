import { task } from '@trigger.dev/sdk/v3'

export const uploadVideoExecutionTask = task({
    id: 'upload-video-execution',
    run: async (payload: {
        value: string
    }) => {
        return {
            success: true,
            result: payload.value,
        }
    },
})

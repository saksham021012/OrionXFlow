import { task } from '@trigger.dev/sdk/v3'

export const textExecutionTask = task({
    id: 'text-execution',
    run: async (payload: {
        value: string
    }) => {
        return {
            success: true,
            result: payload.value,
        }
    },
})

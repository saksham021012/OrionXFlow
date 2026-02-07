
import { Edge, Node } from 'reactflow'

export const SAMPLE_WORKFLOW = {
    name: 'Product Marketing Kit Generator',
    description: 'Demonstrates all 6 node types with parallel execution and convergence. Two branches run simultaneously then merge.',
    nodes: [
        // ========== BRANCH A: Image Processing + Product Description ==========

        // 1. Upload Image Node
        {
            id: 'upload-image',
            type: 'uploadImage',
            position: { x: 0, y: 0 },
            data: {
                label: 'Product Photo',
                type: 'uploadImage',
                value: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
            },
        },

        // 2. Crop Image Node
        {
            id: 'crop-image',
            type: 'cropImage',
            position: { x: 500, y: 0 },
            data: {
                label: 'Crop Image',
                type: 'cropImage',
                x_percent: 10,
                y_percent: 10,
                width_percent: 80,
                height_percent: 80,
            },
        },

        // 3. Text Node #1 (System Prompt)
        {
            id: 'text-system-prompt-1',
            type: 'text',
            position: { x: 0, y: 400 },
            data: {
                label: 'System Prompt',
                type: 'text',
                value: 'You are a professional marketing copywriter. Generate a compelling one-paragraph product description.',
            },
        },

        // 4. Text Node #2 (Product Details)
        {
            id: 'text-product-details',
            type: 'text',
            position: { x: 0, y: 700 },
            data: {
                label: 'Product Details',
                type: 'text',
                value: 'Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.',
            },
        },

        // 5. LLM Node #1
        {
            id: 'llm-product-description',
            type: 'llm',
            position: { x: 1000, y: 300 },
            data: {
                label: 'AI Description Generator',
                type: 'llm',
                model: 'gemini-2.5-flash-lite',
                imageInputCount: 1,
            },
        },

        // ========== BRANCH B: Video Frame Extraction ==========

        // 6. Upload Video Node
        {
            id: 'upload-video',
            type: 'uploadVideo',
            position: { x: 0, y: 1100 },
            data: {
                label: 'Product Demo Video',
                type: 'uploadVideo',
                value: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            },
        },

        // 7. Extract Frame Node
        {
            id: 'extract-frame',
            type: 'extractFrame',
            position: { x: 500, y: 1100 },
            data: {
                label: 'Extract Frame (50%)',
                type: 'extractFrame',
                timestamp: '50%',
            },
        },

        // ========== CONVERGENCE: Final Marketing Summary ==========

        // 8. Text Node #3 (Marketing Prompt)
        {
            id: 'text-marketing-prompt',
            type: 'text',
            position: { x: 1000, y: 800 },
            data: {
                label: 'Marketing Prompt',
                type: 'text',
                value: 'You are a social media manager. Create a tweet-length marketing post based on the product image and video frame.',
            },
        },

        // 9. LLM Node #2 (Convergence)
        {
            id: 'llm-marketing-tweet',
            type: 'llm',
            position: { x: 1600, y: 500 },
            data: {
                label: 'Final Marketing Post',
                type: 'llm',
                model: 'gemini-2.5-flash-lite',
                imageInputCount: 2, // Needs 2 image inputs
            },
        },

        // 10. Crop Config - Param Demo
        {
            id: 'text-crop-width',
            type: 'text',
            position: { x: 500, y: -200 },
            data: {
                label: 'Crop Width %',
                type: 'text',
                value: '80',
            },
        },
        {
            id: 'text-crop-x',
            type: 'text',
            position: { x: 750, y: -200 },
            data: {
                label: 'Crop X %',
                type: 'text',
                value: '10',
            },
        },
    ] as Node[],
    edges: [
        { id: 'e1', source: 'upload-image', target: 'crop-image', targetHandle: 'image_url', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 } },
        { id: 'e2', source: 'text-crop-width', target: 'crop-image', targetHandle: 'width_percent', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 } },
        { id: 'e3', source: 'text-crop-x', target: 'crop-image', targetHandle: 'x_percent', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 } },
        { id: 'e4', source: 'text-system-prompt-1', target: 'llm-product-description', targetHandle: 'system_prompt', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 } },
        { id: 'e5', source: 'text-product-details', target: 'llm-product-description', targetHandle: 'user_message', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 } },
        { id: 'e6', source: 'crop-image', target: 'llm-product-description', targetHandle: 'image_1', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 } },
        { id: 'e7', source: 'upload-video', target: 'extract-frame', targetHandle: 'video_url', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 } },
        { id: 'e8', source: 'text-marketing-prompt', target: 'llm-marketing-tweet', targetHandle: 'system_prompt', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 } },
        { id: 'e9', source: 'llm-product-description', target: 'llm-marketing-tweet', targetHandle: 'user_message', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 } },
        { id: 'e10', source: 'crop-image', target: 'llm-marketing-tweet', targetHandle: 'image_1', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 } },
        { id: 'e11', source: 'extract-frame', target: 'llm-marketing-tweet', targetHandle: 'image_2', animated: true, style: { stroke: '#c084fc', strokeWidth: 2 } },
    ] as Edge[]
}

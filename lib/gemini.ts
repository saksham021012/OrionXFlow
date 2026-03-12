import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)

export const getGeminiModel = (modelName: string = 'gemini-2.5-flash-lite') => {
    return genAI.getGenerativeModel({ model: modelName })
}

export const generateContent = async (
    prompt: string,
    systemInstruction?: string,
    images?: string[],
    modelName?: string
) => {
    const model = getGeminiModel(modelName)

    const parts: any[] = []

    const promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt || '')

    if (promptText && promptText.trim().length > 0) {
        parts.push({ text: promptText })
    }

    // If no prompt and no images, throw an error to avoid 400 from API
    if (parts.length === 0 && (!images || images.length === 0)) {
        throw new Error('generateContent requires at least a text prompt or an image')
    }

    // Add images if provided
    if (images && images.length > 0) {
        for (const imageUrl of images) {
            // Fetch image and convert to base64
            const response = await fetch(imageUrl)
            const buffer = await response.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            const mimeType = response.headers.get('content-type') || 'image/jpeg'

            parts.push({
                inlineData: {
                    data: base64,
                    mimeType,
                },
            })
        }
    }

    const sysInstText = systemInstruction 
        ? (typeof systemInstruction === 'string' ? systemInstruction : JSON.stringify(systemInstruction))
        : undefined

    const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        systemInstruction: sysInstText
            ? { role: 'system', parts: [{ text: sysInstText }] }
            : undefined,
    })

    const response = result.response
    return response.text()
}

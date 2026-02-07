import { z } from 'zod'

// Node type enum
export const NodeTypeSchema = z.enum([
    'text',
    'uploadImage',
    'uploadVideo',
    'llm',
    'cropImage',
    'extractFrame',
])

// Workflow schemas
export const CreateWorkflowSchema = z.object({
    name: z.string().min(1, 'Workflow name is required'),
    description: z.string().optional(),
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
})

export const UpdateWorkflowSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    nodes: z.array(z.any()).optional(),
    edges: z.array(z.any()).optional(),
})

// Workflow execution schemas
export const ExecuteWorkflowSchema = z.object({
    executionType: z.enum(['full', 'selected', 'single']),
    selectedNodeIds: z.array(z.string()).optional(),
})

// LLM node schemas
export const LLMNodeInputSchema = z.object({
    model: z.string(),
    systemPrompt: z.string().optional(),
    userMessage: z.string(),
    images: z.array(z.string()).optional(),
})

// Crop image node schemas
export const CropImageInputSchema = z.object({
    imageUrl: z.string().url(),
    xPercent: z.number().min(0).max(100).default(0),
    yPercent: z.number().min(0).max(100).default(0),
    widthPercent: z.number().min(0).max(100).default(100),
    heightPercent: z.number().min(0).max(100).default(100),
})

// Extract frame node schemas
export const ExtractFrameInputSchema = z.object({
    videoUrl: z.string().url(),
    timestamp: z.union([z.number(), z.string()]), // Can be seconds (number) or percentage (string like "50%")
})

// Upload schemas
export const UploadResponseSchema = z.object({
    url: z.string().url(),
    fileType: z.string(),
    fileName: z.string(),
})

export type NodeType = z.infer<typeof NodeTypeSchema>
export type CreateWorkflowInput = z.infer<typeof CreateWorkflowSchema>
export type UpdateWorkflowInput = z.infer<typeof UpdateWorkflowSchema>
export type ExecuteWorkflowInput = z.infer<typeof ExecuteWorkflowSchema>
export type LLMNodeInput = z.infer<typeof LLMNodeInputSchema>
export type CropImageInput = z.infer<typeof CropImageInputSchema>
export type ExtractFrameInput = z.infer<typeof ExtractFrameInputSchema>
export type UploadResponse = z.infer<typeof UploadResponseSchema>

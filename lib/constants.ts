import {
    Type,
    Image as ImageIcon,
    Video,
    Sparkles,
    Crop,
    Film
} from 'lucide-react'

export const NODE_TYPES = [
    { type: 'text', label: 'Text', icon: Type },
    { type: 'uploadImage', label: 'Image', icon: ImageIcon },
    { type: 'uploadVideo', label: 'Video', icon: Video },
    { type: 'llm', label: 'Run Any LLM', icon: Sparkles, fullWidth: true },
    { type: 'cropImage', label: 'Crop Image', icon: Crop },
    { type: 'extractFrame', label: 'Extract Frame', icon: Film },
]

# OrionXFlow - AI-Powered Video & Image Workflow Engine

OrionXFlow is a modern, full-stack workflow automation platform designed for AI-driven media processing. Built with Next.js 15, it allows users to construct complex AI pipelines using a visual canvas, integrating Gemini LLMs with powerful media tools like Transloadit and Trigger.dev.

## ✨ Features

### 🎯 Core Functionality
- **Visual Workflow Canvas**: Build and visualize your AI pipelines using a highly interactive React Flow canvas.
- **Specialized AI Nodes**:
    - **LLM Node**: Deep integration with Gemini (2.0/2.5 Pro & Flash) for intelligent text and image analysis.
    - **Media Nodes**: Dedicated nodes for Image and Video uploads powered by Transloadit.
    - **Processing Tools**: Built-in nodes for Image Cropping and Video Frame Extraction.
    - **Utility Nodes**: Text inputs and Frame containers for structured data flow.
- **Background Execution**: Reliable, long-running workflow processing powered by Trigger.dev v3.
- **Real-time Progress tracking**: Watch your workflows execute in real-time with pulsating visual feedback on active nodes.
- **Workflow History**: Path-perfect tracking of previous runs with detailed input/output logs.

### 🎨 User Experience
- **Pixel-Perfect UI**: Inspired by modern collaborative tools, featuring a sleek, dark-themed interface.
- **Dynamic Sidebar**: Collapsible navigation with quick-access workflow management and dashboard tools.
- **Undo/Redo Canvas**: Full state management for clinical workflow design with keyboard shortcut support (Ctrl+Z / Ctrl+Y).
- **Smooth Animations**: Powered by Framer Motion for a premium, responsive feel.
- **Intelligent Validation**: Real-time connection validation ensuring data type compatibility between nodes.

### 🔐 Authentication & Security
- **Clerk Integration**: Enterprise-grade authentication and user management.
- **Protected Routes**: Secure dashboard and workflow environments accessible only to authenticated users.

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - App Router & Server Actions
- **React 19** - UI Library
- **React Flow** - Workflow Canvas Engine
- **Tailwind CSS** - Modern styling
- **Zustand** - Global state management
- **Framer Motion** - High-performance animations
- **Lucide React** - Iconography

### Backend & Infrastructure
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Relational database
- **Clerk** - Authentication & Identity
- **Trigger.dev v3** - Background task orchestration
- **Transloadit** - Media processing and file uploading
- **Gemini API** - State-of-the-art AI models

## 📋 Prerequisites

- Node.js (v20 or higher)
- PostgreSQL Database
- Clerk Account ([clerk.com](https://clerk.com))
- Trigger.dev Account ([trigger.dev](https://trigger.dev))
- Transloadit Account ([transloadit.com](https://transloadit.com))
- Google AI (Gemini) API Key

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd orionxflow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your-postgresql-url"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key

# Trigger.dev
TRIGGER_SECRET_KEY=tr_dev_...

# Transloadit
NEXT_PUBLIC_TRANSLOADIT_KEY=your-key
TRANSLOADIT_SECRET=your-secret
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the application
```bash
# Terminal 1 - Next.js Development Server
npm run dev

# Terminal 2 - Trigger.dev Worker
npx trigger.dev@latest dev
```

The application will be available at: [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
orionxflow/
├── app/                  # Next.js App Router (Pages & API)
├── components/           # UI Component Library
│   ├── canvas/          # Workflow Canvas components
│   ├── nodes/           # Custom React Flow nodes
│   └── layout/          # Sidebar and navigation
├── lib/                  # Shared utilities and logic
│   ├── workflow-execution/ # Execution engine & node logic
│   └── prisma.ts        # Database client
├── store/                # Zustand state management
├── trigger/              # Trigger.dev background tasks
├── types/                # TypeScript interfaces
└── prisma/               # Database schema
```

## 🔧 Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma studio` - Open database GUI

import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'

import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Add weights you need
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OrionXFlow - LLM Workflow Builder',
  description: 'Build and execute LLM workflows with visual node-based interface',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}


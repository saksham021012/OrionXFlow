import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)'])
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
    const { isAuthenticated } = await auth()

    // When logged in, redirect away from sign-in/sign-up to dashboard
    if (isAuthenticated && isAuthRoute(request)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!isPublicRoute(request)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|avif|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
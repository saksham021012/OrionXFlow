import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto w-full max-w-md',
            card: 'bg-secondary border border-border shadow-xl',
          },
        }}
      />
    </div>
  )
}
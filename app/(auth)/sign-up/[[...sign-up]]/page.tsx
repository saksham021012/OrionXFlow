import { SignUp } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/AuthLayout'

export default function SignUpPage() {
  return (
    <AuthLayout type="signup">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full flex justify-center',
            card: 'bg-transparent border-none shadow-none p-0 w-full max-w-none ml-0',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'bg-white hover:bg-white/90 border-none transition-all duration-200 h-11 rounded-xl',
            socialButtonsBlockButtonText: 'text-black font-semibold text-sm',
            socialButtonsBlockButtonArrow: 'hidden',
            dividerRow: 'my-6',
            dividerLine: 'bg-[#1f1f1f]',
            dividerText: 'text-[#666] text-[10px] uppercase tracking-widest font-bold',
            formFieldLabel: 'text-[#666] text-xs font-semibold mb-1.5 ml-1',
            formFieldInput: 'bg-black border-[#1f1f1f] focus:border-[#444] text-white h-11 rounded-xl selection:bg-primary/30',
            formButtonPrimary: 'bg-white hover:bg-white/90 text-black border-none h-11 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-[0.98] mt-2',
            footer: 'hidden',
            formFieldErrorText: 'text-red-400 text-[10px] mt-1 ml-1 font-medium',
          },
        }}
      />
    </AuthLayout>
  )
}
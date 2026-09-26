import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import AuthLayout from './AuthLayout'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validation/auth'

type UIState = 'idle' | 'submitting' | 'success'

export default function ForgotPasswordPage() {
  const [uiState, setUiState] = useState<UIState>('idle')

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (_data: ForgotPasswordFormValues) => {
    setUiState('submitting')
    await new Promise((r) => setTimeout(r, 800))
    setUiState('success')
  }

  if (uiState === 'success') {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We have sent password reset instructions."
      >
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
            <MailCheck className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-foreground">
              An email was sent to <span className="font-semibold">{getValues('emailOrLoginId')}</span>.
            </p>
            <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border mt-2">
              🔒 <strong>Demo only</strong>: No real email was sent.
            </p>
          </div>
          <Button asChild className="mt-4 w-full">
            <Link to="/reset-password" id="forgot-goto-reset">
              Simulate clicking reset link
            </Link>
          </Button>
          <Link
            to="/login"
            className="text-sm font-medium text-primary hover:underline mt-2"
          >
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your Email or Login ID and we will send you instructions to reset your password."
    >
      <form
        id="forgot-password-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        {/* ── Email or Login ID ─────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="forgot-email">Email or Login ID</Label>
          <Input
            id="forgot-email"
            type="text"
            autoComplete="username"
            placeholder="you@example.com or 6-12 char ID"
            aria-invalid={!!errors.emailOrLoginId}
            aria-describedby={errors.emailOrLoginId ? 'forgot-email-error' : undefined}
            className={cn(errors.emailOrLoginId && 'border-[--danger,#B91C1C] focus-visible:ring-[--danger,#B91C1C]')}
            {...register('emailOrLoginId')}
          />
          {errors.emailOrLoginId && (
            <p id="forgot-email-error" role="alert" className="text-xs text-[--danger,#B91C1C]">
              {errors.emailOrLoginId.message}
            </p>
          )}
        </div>

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <Button
          id="forgot-submit"
          type="submit"
          className="w-full"
          disabled={uiState === 'submitting'}
        >
          {uiState === 'submitting' && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          Send reset instructions
        </Button>
      </form>

      {/* ── Login link ────────────────────────────────────────────────── */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link
          to="/login"
          id="forgot-back-to-login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}

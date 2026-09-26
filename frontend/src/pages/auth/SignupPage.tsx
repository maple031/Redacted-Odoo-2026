import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import AuthLayout from './AuthLayout'
import { signupSchema, type SignupFormValues } from '@/lib/validation/auth'

type UIState = 'idle' | 'submitting' | 'success'

export default function SignupPage() {
  const [uiState, setUiState] = useState<UIState>('idle')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (_data: SignupFormValues) => {
    setUiState('submitting')
    await new Promise((r) => setTimeout(r, 800))
    setUiState('success')
  }

  if (uiState === 'success') {
    return (
      <AuthLayout
        title="Account created"
        subtitle="Your StockSense account is ready."
      >
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[--success-bg,#F0FDF4] border border-[--success-border,#BBF7D0] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-[--success,#15803D]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-foreground font-medium">Demo only</p>
            <p className="text-sm text-muted-foreground">
              Account creation is not connected to a backend database in this environment.
            </p>
          </div>
          <Button asChild className="mt-4 w-full">
            <Link to="/login" id="signup-goto-login">
              Return to sign in
            </Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Fill in the details below to get started."
    >
      <form
        id="signup-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        {/* ── Login ID ──────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-id">Login ID</Label>
          <Input
            id="signup-id"
            type="text"
            autoComplete="username"
            placeholder="6–12 characters"
            aria-invalid={!!errors.loginId}
            aria-describedby={errors.loginId ? 'signup-id-error' : undefined}
            className={cn(errors.loginId && 'border-[--danger,#B91C1C] focus-visible:ring-[--danger,#B91C1C]')}
            {...register('loginId')}
          />
          {errors.loginId && (
            <p id="signup-id-error" role="alert" className="text-xs text-[--danger,#B91C1C]">
              {errors.loginId.message}
            </p>
          )}
        </div>

        {/* ── Email ─────────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-email">Email address</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
            className={cn(errors.email && 'border-[--danger,#B91C1C] focus-visible:ring-[--danger,#B91C1C]')}
            {...register('email')}
          />
          {errors.email && (
            <p id="signup-email-error" role="alert" className="text-xs text-[--danger,#B91C1C]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* ── Password ──────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min 9 chars, upper, lower, special"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'signup-password-error' : undefined}
              className={cn(
                'pr-10',
                errors.password && 'border-[--danger,#B91C1C] focus-visible:ring-[--danger,#B91C1C]',
              )}
              {...register('password')}
            />
            <button
              type="button"
              id="signup-toggle-password"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword
                ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          {errors.password && (
            <p id="signup-password-error" role="alert" className="text-xs text-[--danger,#B91C1C]">
              {errors.password.message}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            More than 8 characters, 1 uppercase, 1 lowercase, 1 special character.
          </p>
        </div>

        {/* ── Confirm Password ──────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-confirm">Re-enter password</Label>
          <div className="relative">
            <Input
              id="signup-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Must exactly match password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
              className={cn(
                'pr-10',
                errors.confirmPassword && 'border-[--danger,#B91C1C] focus-visible:ring-[--danger,#B91C1C]',
              )}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              id="signup-toggle-confirm"
              onClick={() => setShowConfirm((p) => !p)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm
                ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="signup-confirm-error" role="alert" className="text-xs text-[--danger,#B91C1C]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* ── Terms ─────────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <input
              id="signup-terms"
              type="checkbox"
              className={cn(
                "mt-0.5 h-4 w-4 rounded border-border accent-primary",
                errors.terms && "border-[--danger,#B91C1C]"
              )}
              {...register('terms')}
            />
            <span className="leading-snug">
              I agree to the StockSense Terms of Service and Privacy Policy
            </span>
          </label>
          {errors.terms && (
            <p id="signup-terms-error" role="alert" className="text-xs text-[--danger,#B91C1C]">
              {errors.terms.message}
            </p>
          )}
        </div>

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <Button
          id="signup-submit"
          type="submit"
          className="w-full mt-2"
          disabled={uiState === 'submitting'}
        >
          {uiState === 'submitting' && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          Create account
        </Button>
      </form>

      {/* ── Login link ────────────────────────────────────────────────── */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          to="/login"
          id="signup-signin-link"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}

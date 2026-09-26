import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import AuthLayout from './AuthLayout'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validation/auth'
import { resetPasswordApi } from '@/lib/api/auth'

type UIState = 'idle' | 'submitting' | 'success' | 'error'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const initialIdentifier = searchParams.get('identifier') || ''

  const [uiState, setUiState] = useState<UIState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [emailOrLoginId, setEmailOrLoginId] = useState<string>(initialIdentifier)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!emailOrLoginId.trim()) {
      setErrorMessage('Please enter your Email or Login ID.')
      setUiState('error')
      return
    }

    setUiState('submitting')
    setErrorMessage('')
    try {
      await resetPasswordApi({
        ...data,
        emailOrLoginId: emailOrLoginId.trim(),
      })
      setUiState('success')
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired reset code')
      setUiState('error')
    }
  }

  if (uiState === 'success') {
    return (
      <AuthLayout
        title="Password reset successful"
        subtitle="Your password has been changed successfully in the database."
      >
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[--success-bg,#F0FDF4] border border-[--success-border,#BBF7D0] flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-[--success,#15803D]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-foreground font-medium">Password updated!</p>
            <p className="text-sm text-muted-foreground">
              You may now sign in with your new password.
            </p>
          </div>
          <Button asChild className="mt-4 w-full">
            <Link to="/login" id="reset-goto-login">
              Continue to sign in
            </Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter a new password for your account."
    >
      <form
        id="reset-password-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        {/* ── Error notice ─────────────────────────────────── */}
        {uiState === 'error' && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2.5 rounded-md border border-[--danger-border,#FECACA] bg-[--danger-bg,#FEF2F2] px-3.5 py-3"
          >
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[--danger,#B91C1C]"
              aria-hidden="true"
            />
            <p className="text-sm text-[--danger,#B91C1C]">
              {errorMessage}
            </p>
          </div>
        )}

        {/* ── Email or Login ID ──────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="reset-identifier">Email or Login ID</Label>
          <Input
            id="reset-identifier"
            type="text"
            placeholder="Enter your Email or Login ID"
            value={emailOrLoginId}
            onChange={(e) => setEmailOrLoginId(e.target.value)}
          />
        </div>

        {/* ── Reset Code ────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="reset-code">Reset Code</Label>
          <Input
            id="reset-code"
            type="text"
            autoComplete="off"
            placeholder="Enter the reset code from your email"
            aria-invalid={!!errors.resetCode}
            aria-describedby={errors.resetCode ? 'reset-code-error' : undefined}
            className={cn(errors.resetCode && 'border-[--danger,#B91C1C] focus-visible:ring-[--danger,#B91C1C]')}
            {...register('resetCode')}
          />
          {errors.resetCode && (
            <p id="reset-code-error" role="alert" className="text-xs text-[--danger,#B91C1C]">
              {errors.resetCode.message}
            </p>
          )}
        </div>

        {/* ── New Password ──────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="reset-new">New Password</Label>
          <div className="relative">
            <Input
              id="reset-new"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min 9 chars, upper, lower, special"
              aria-invalid={!!errors.newPassword}
              aria-describedby={errors.newPassword ? 'reset-new-error' : undefined}
              className={cn(
                'pr-10',
                errors.newPassword && 'border-[--danger,#B91C1C] focus-visible:ring-[--danger,#B91C1C]',
              )}
              {...register('newPassword')}
            />
            <button
              type="button"
              id="reset-toggle-new"
              onClick={() => setShowNew((p) => !p)}
              aria-label={showNew ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNew
                ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          {errors.newPassword && (
            <p id="reset-new-error" role="alert" className="text-xs text-[--danger,#B91C1C]">
              {errors.newPassword.message}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            More than 8 characters, 1 uppercase, 1 lowercase, 1 special character.
          </p>
        </div>

        {/* ── Confirm New Password ──────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="reset-confirm">Re-enter new password</Label>
          <div className="relative">
            <Input
              id="reset-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Must exactly match new password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'reset-confirm-error' : undefined}
              className={cn(
                'pr-10',
                errors.confirmPassword && 'border-[--danger,#B91C1C] focus-visible:ring-[--danger,#B91C1C]',
              )}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              id="reset-toggle-confirm"
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
            <p id="reset-confirm-error" role="alert" className="text-xs text-[--danger,#B91C1C]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <Button
          id="reset-submit"
          type="submit"
          className="w-full mt-2"
          disabled={uiState === 'submitting'}
        >
          {uiState === 'submitting' && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          Reset password
        </Button>
      </form>

      {/* ── Login link ────────────────────────────────────────────────── */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          to="/login"
          id="reset-back-to-login"
          className="font-medium text-primary hover:underline"
        >
          &larr; Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}

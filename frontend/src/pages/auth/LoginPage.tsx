import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import AuthLayout from './AuthLayout'
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth'
import { loginApi } from '@/lib/api/auth'

type UIState = 'idle' | 'submitting' | 'invalid'

export default function LoginPage() {
  const navigate = useNavigate()
  const [uiState, setUiState] = useState<UIState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('Invalid Login Id or Password')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormValues) => {
    setUiState('submitting')
    try {
      await loginApi(data)
      navigate('/')
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid Login Id or Password')
      setUiState('invalid')
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your StockSense account."
    >
      <form
        id="login-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        {/* ── Invalid credentials notice ─────────────────────────────────── */}
        {uiState === 'invalid' && (
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

        {/* ── Login ID ──────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="login-id">Login ID</Label>
          <Input
            id="login-id"
            type="text"
            autoComplete="username"
            placeholder="Enter your login ID"
            aria-invalid={!!errors.loginId}
            aria-describedby={errors.loginId ? 'login-id-error' : undefined}
            className={cn(errors.loginId && 'border-[--danger,#B91C1C] focus-visible:ring-[--danger,#B91C1C]')}
            {...register('loginId')}
          />
          {errors.loginId && (
            <p id="login-id-error" role="alert" className="text-xs text-[--danger,#B91C1C]">
              {errors.loginId.message}
            </p>
          )}
        </div>

        {/* ── Password ──────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              className={cn(
                'pr-10',
                errors.password && 'border-[--danger,#B91C1C] focus-visible:ring-[--danger,#B91C1C]',
              )}
              {...register('password')}
            />
            <button
              type="button"
              id="login-toggle-password"
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
            <p id="login-password-error" role="alert" className="text-xs text-[--danger,#B91C1C]">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* ── Remember me + Forgot ──────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <input
              id="login-remember"
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            id="login-forgot-link"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <Button
          id="login-submit"
          type="submit"
          className="w-full"
          disabled={uiState === 'submitting'}
        >
          {uiState === 'submitting' && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          Sign in
        </Button>

        {/* ── Static demo notice ────────────────────────────────────────── */}
        <p className="text-xs text-center text-muted-foreground border border-border rounded px-3 py-2 bg-muted/30">
          🔒 <strong>Demo only</strong> — authentication is not connected in this build.
        </p>
      </form>

      {/* ── Sign up link ──────────────────────────────────────────────── */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          id="login-signup-link"
          className="font-medium text-primary hover:underline"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  )
}

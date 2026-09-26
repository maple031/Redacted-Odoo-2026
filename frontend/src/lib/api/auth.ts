import type {
  LoginFormValues,
  SignupFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from '@/lib/validation/auth'

export interface UserSummary {
  id: string
  loginId: string
  email: string
  role: string
  active: boolean
}

export interface ApiError {
  error?: string
  message?: string
}

/**
 * Perform a user login.
 */
export async function loginApi(data: LoginFormValues): Promise<UserSummary> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'Invalid login ID or password')
  }

  return res.json()
}

/**
 * Register a new user account.
 */
export async function signupApi(data: SignupFormValues): Promise<UserSummary> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'Signup failed')
  }

  return res.json()
}

/**
 * Fetch the currently authenticated user from session.
 * Returns null if not authenticated (401).
 */
export async function getCurrentUserApi(): Promise<UserSummary | null> {
  const res = await fetch('/api/auth/me')

  if (res.status === 401) {
    return null
  }

  if (!res.ok) {
    throw new Error('Failed to fetch session user')
  }

  return res.json()
}

/**
 * End the user session.
 */
export async function logoutApi(): Promise<void> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
  })

  if (!res.ok) {
    throw new Error('Logout failed')
  }
}

/**
 * Request a password reset code.
 */
export async function forgotPasswordApi(
  data: ForgotPasswordFormValues
): Promise<{ message: string }> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'Forgot password request failed')
  }

  return res.json()
}

/**
 * Submit reset code and new password.
 */
export async function resetPasswordApi(
  data: ResetPasswordFormValues & { emailOrLoginId: string }
): Promise<{ message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'Reset password failed')
  }

  return res.json()
}

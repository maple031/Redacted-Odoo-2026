import { z } from 'zod'

// ── Shared password complexity rule ──────────────────────────────────────────
export const passwordSchema = z
  .string()
  .min(9, 'Password must be more than 8 characters')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character')

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  loginId: z.string().min(1, 'Login ID is required'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

// ── Sign Up ───────────────────────────────────────────────────────────────────
export const signupSchema = z
  .object({
    loginId: z
      .string()
      .min(6, 'Login ID must be at least 6 characters')
      .max(12, 'Login ID must be at most 12 characters'),
    email: z.string().email('Enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please re-enter your password'),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms to continue' }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
export type SignupFormValues = z.infer<typeof signupSchema>

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please re-enter your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

import apiClient from './client'
import ENDPOINTS from './endpoints'

export type AuthUser = {
  id: number
  full_name: string
  email: string
  phone_code: string
  phone_number: string
  role: string
  avatar_url: string | null
}

export type AuthResponse = {
  success: true
  message: string
  data: {
    token: string
    user: AuthUser
  }
}

export type MessageResponse = {
  success: boolean
  message: string
}

const authApi = {
  register: (body: Record<string, unknown>) =>
    apiClient.apiPost<AuthResponse>(ENDPOINTS.auth.register, body),

  login: (body: Record<string, unknown>) =>
    apiClient.apiPost<AuthResponse>(ENDPOINTS.auth.login, body),

  googleLogin: (body: {
    google_id: string
    email: string
    full_name: string
    avatar_url: string
    user_type: 'user' | 'dietitian'
  }) => apiClient.apiPost<AuthResponse>(ENDPOINTS.auth.google, body),

  // Sends a password-reset link to the email if an account exists.
  forgotPassword: (body: { email: string }) =>
    apiClient.apiPost<MessageResponse>(ENDPOINTS.auth.forgotPassword, body),

  // Sets a new password using the single-use token from the reset email link.
  resetPassword: (body: { token: string; password: string; confirm_password: string }) =>
    apiClient.apiPost<MessageResponse>(ENDPOINTS.auth.resetPassword, body),
}

export default authApi

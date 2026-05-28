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

const authApi = {
  register: (body: Record<string, unknown>) =>
    apiClient.apiPost<AuthResponse>(ENDPOINTS.auth.register, body),

  login: (body: Record<string, unknown>) =>
    apiClient.apiPost<AuthResponse>(ENDPOINTS.auth.login, body),
}

export default authApi

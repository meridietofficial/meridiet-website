import apiClient from './client'
import ENDPOINTS from './endpoints'
import type { AuthUser } from './auth'

export type ProfileResponse = {
  success: true
  message: string
  data: AuthUser
}

export type PasswordChangeResponse = {
  success: true
  message: string
  data: null
}

const userApi = {
  getProfile: () =>
    apiClient.apiGet<ProfileResponse>(ENDPOINTS.user.profile),

  updateProfile: (body: Partial<Pick<AuthUser, 'full_name' | 'email' | 'phone_code' | 'phone_number' | 'avatar_url'>>) =>
    apiClient.apiPut<ProfileResponse>(ENDPOINTS.user.profile, body),

  updateAvatar: (formData: FormData) =>
    apiClient.apiPostForm<ProfileResponse>(ENDPOINTS.user.updateAvatar, formData),

  changePassword: (body: { current_password: string; new_password: string }) =>
    apiClient.apiPut<PasswordChangeResponse>(ENDPOINTS.user.changePassword, body),
}

export default userApi

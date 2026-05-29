import apiClient from './client'
import ENDPOINTS from './endpoints'
import type { AuthUser } from './auth'

export type ProfileResponse = {
  success: true
  message: string
  data: { user: AuthUser }
}

export type PasswordChangeResponse = {
  success: true
  message: string
}

const userApi = {
  getProfile: () =>
    apiClient.apiGet<ProfileResponse>(ENDPOINTS.user.profile),

  updateProfile: (body: Partial<Pick<AuthUser, 'full_name' | 'email' | 'phone_code' | 'phone_number'>>) =>
    apiClient.apiPut<ProfileResponse>(ENDPOINTS.user.profile, body),

  updateAvatar: (formData: FormData) =>
    apiClient.apiPostForm<ProfileResponse>(ENDPOINTS.user.updateAvatar, formData),

  changePassword: (body: { current_password: string; new_password: string }) =>
    apiClient.apiPost<PasswordChangeResponse>(ENDPOINTS.user.changePassword, body),
}

export default userApi

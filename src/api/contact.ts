import apiClient from './client'
import ENDPOINTS from './endpoints'

// name + message are required; email, phone, subject are optional/nullable
export type ContactBody = {
  name: string
  message: string
  email?: string
  phone?: string
  subject?: string
}

export type ContactResult = {
  id: number
  name: string
  email: string | null
  subject: string | null
  created_at: string
}

type ContactResponse = {
  success: boolean
  message: string
  data: ContactResult
}

const contactApi = {
  async submit(body: ContactBody): Promise<ContactResult> {
    const res = await apiClient.apiPost<ContactResponse>(ENDPOINTS.contact.submit, body)
    return res.data
  },
}

export default contactApi

import apiClient from './client'
import ENDPOINTS from './endpoints'

export type Bank = {
  id: number
  name: string
  ifsc_prefix: string | null
  logo_url: string | null
}

const banksApi = {
  async getBanks(search?: string): Promise<Bank[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : ''
    const res = await apiClient.apiGet<{ success: boolean; data: { banks: Bank[] } }>(
      `${ENDPOINTS.banks.list}${qs}`
    )
    return res.data.banks
  },
}

export default banksApi

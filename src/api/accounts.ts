import apiClient from './client'
import ENDPOINTS from './endpoints'

export type LinkedAccount = {
  id: number
  type: 'upi' | 'bank'
  is_primary: boolean
  upi_id: string | null
  account_holder: string | null
  account_number: string | null
  ifsc_code: string | null
  bank_name: string | null
}

export type AddUpiPayload = {
  type: 'upi'
  upi_id: string
  set_primary?: boolean
}

export type AddBankPayload = {
  type: 'bank'
  account_holder: string
  account_number: string
  ifsc_code: string
  bank_name: string
  set_primary?: boolean
}

export type AddAccountResult =
  | { type: 'upi';  upi_verified: boolean;  upi_verified_note: string }
  | { type: 'bank'; ifsc_verified: boolean; verified_bank_name: string }

const accountsApi = {
  async getAccounts(): Promise<LinkedAccount[]> {
    const res = await apiClient.apiGet<{ success: boolean; data: { accounts: LinkedAccount[] } }>(
      ENDPOINTS.accounts.list
    )
    return res.data.accounts
  },

  async addAccount(payload: AddUpiPayload | AddBankPayload): Promise<AddAccountResult> {
    const res = await apiClient.apiPost<{ success: boolean } & AddAccountResult>(
      ENDPOINTS.accounts.list,
      payload
    )
    return res
  },

  async setPrimary(id: number): Promise<void> {
    await apiClient.apiPatch<{ success: boolean }>(
      `${ENDPOINTS.accounts.list}/${id}/set-primary`,
      {}
    )
  },

  async deleteAccount(id: number): Promise<void> {
    await apiClient.apiDelete<{ success: boolean }>(
      `${ENDPOINTS.accounts.list}/${id}`
    )
  },
}

export default accountsApi

import apiClient from './client'
import ENDPOINTS from './endpoints'

export type WalletBalanceResponse = {
  success: true
  data: {
    wallet_balance: number
  }
}

export type WalletTransaction = {
  id: number
  type: 'credit' | 'debit'
  source: 'reward' | 'subscription' | 'purchase'
  amount: number
  balance_after: number
  description: string
  created_at: string
}

export type WalletTransactionsResponse = {
  success: true
  data: {
    total: number
    page: number
    limit: number
    transactions: WalletTransaction[]
  }
}

const walletApi = {
  balance: () =>
    apiClient.apiGet<WalletBalanceResponse>(ENDPOINTS.wallet.balance),

  transactions: (page = 1, limit = 10) =>
    apiClient.apiGet<WalletTransactionsResponse>(
      `${ENDPOINTS.wallet.transactions}?page=${page}&limit=${limit}`,
    ),
}

export default walletApi

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

export type TopupOrderResponse = {
  success: true
  data: {
    order_id: string
    key_id: string
    amount: number
    currency: string
  }
}

export type TopupVerifyResponse = {
  success: true
  message: string
  data: { new_balance: number }
}

const walletApi = {
  balance: () =>
    apiClient.apiGet<WalletBalanceResponse>(ENDPOINTS.wallet.balance),

  transactions: (page = 1, limit = 10) =>
    apiClient.apiGet<WalletTransactionsResponse>(
      `${ENDPOINTS.wallet.transactions}?page=${page}&limit=${limit}`,
    ),

  topupCreateOrder: (amount: number) =>
    apiClient.apiPost<TopupOrderResponse>(ENDPOINTS.walletTopup.createOrder, { amount }),

  topupVerify: (data: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => apiClient.apiPost<TopupVerifyResponse>(ENDPOINTS.walletTopup.verify, data),

  topupFailed: (orderId: string) =>
    apiClient.apiPost<{ success: boolean }>(ENDPOINTS.walletTopup.failed, {
      razorpay_order_id: orderId,
    }),
}

export default walletApi

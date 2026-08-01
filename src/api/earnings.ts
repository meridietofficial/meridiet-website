import apiClient from './client'
import ENDPOINTS from './endpoints'

export type EarningsPeriod = 'week' | 'month' | 'quarter' | 'year'

export type EarningsSummary = {
  period: EarningsPeriod
  platform_commission_pct: number
  gross_earnings: number
  platform_commission: number
  net_earnings: number
  earnings_change_pct: number | null
  completed_sessions: number
  completed_sessions_change_pct: number | null
  pending_booking_gross: number
  pending_booking_commission: number
  pending_booking_net: number
  earnings_balance: number
}

export type MonthlyRevenueItem = {
  year: number
  month: number
  label: string
  gross_revenue: number
  platform_commission: number
  net_revenue: number
}

export type MonthlyRevenueData = {
  platform_commission_pct: number
  months: MonthlyRevenueItem[]
  total_gross: number
  total_commission: number
  total_net: number
}

export type EarningsByPlanItem = {
  plan_name: string
  gross_revenue: number
  platform_commission: number
  net_revenue: number
  percentage: number
}

export type EarningsByPlanData = {
  platform_commission_pct: number
  plans: EarningsByPlanItem[]
}

export type TransactionItem = {
  id: number
  invoice_number: string
  client_name: string
  client_avatar: string | null
  plan_name: string | null
  date: string
  payment_status: 'paid' | 'pending' | 'refunded'
  gross_amount: number
  platform_commission: number
  net_amount: number
  currency: string
}

export type TxSummaryCount = {
  all: number
  paid: number
  pending: number
  refunded: number
}

export type TransactionsResponse = {
  data: {
    platform_commission_pct: number
    summary: TxSummaryCount
    transactions: TransactionItem[]
    total: number
  }
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type PayoutData = {
  platform_commission_pct: number
  next_payout_date: string
  payout_upi: string | null
  gross_paid_this_month: number
  platform_commission_this_month: number
  net_paid_this_month: number
  pending_booking_gross: number
  pending_booking_net: number
}

export type WalletOverview = {
  available_balance: number
  plan_credits: number
  platform_commission_pct: number
  pending_payout: number
  earned_this_month: number
  earned_this_month_change_pct: number | null
  total_withdrawn: number
  withdrawn_ytd_label: string
}

export type WalletTransaction = {
  id: number
  dietitian_id: number
  type: 'credit' | 'debit'
  wallet: 'plan' | 'earnings'
  source: string
  gross_amount: number
  commission: number
  net_amount: number
  balance_after: number
  description: string
  reference_id?: string | null
  appointment_id: number | null
  created_at: string
}

export type WalletTransactionsResponse = {
  data: {
    transactions: WalletTransaction[]
    total: number
  }
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type RechargeOrderResponse = {
  success: true
  message: string
  data: {
    order_id: string
    amount: number
    currency: string
    key_id: string
  }
}

export type RechargeVerifyResponse = {
  success: true
  message: string
  data: {
    amount_added: number
    plan_credits: number
    transaction_id: number
  }
}

const earningsApi = {
  async getMonthlyRevenue(months = 6): Promise<MonthlyRevenueData> {
    const res = await apiClient.apiGet<{ success: boolean; data: MonthlyRevenueData }>(
      `${ENDPOINTS.earnings.monthlyRevenue}?months=${months}`
    )
    return res.data
  },

  async getPayout(): Promise<PayoutData> {
    const res = await apiClient.apiGet<{ success: boolean; data: PayoutData }>(
      ENDPOINTS.earnings.payout
    )
    return res.data
  },

  async getTransactions(params: {
    status?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<TransactionsResponse> {
    const qs = new URLSearchParams()
    if (params.status && params.status !== 'all') qs.set('status', params.status)
    if (params.search) qs.set('search', params.search)
    qs.set('page', String(params.page ?? 1))
    qs.set('limit', String(params.limit ?? 10))
    const res = await apiClient.apiGet<TransactionsResponse & { success: boolean }>(
      `${ENDPOINTS.earnings.transactions}?${qs}`
    )
    return res
  },

  async getByPlan(): Promise<EarningsByPlanData> {
    const res = await apiClient.apiGet<{ success: boolean; data: EarningsByPlanData }>(
      ENDPOINTS.earnings.byPlan
    )
    return res.data
  },

  async getWalletOverview(): Promise<WalletOverview> {
    const res = await apiClient.apiGet<{ success: boolean; data: WalletOverview }>(
      ENDPOINTS.earnings.wallet
    )
    return res.data
  },

  async getWalletTransactions(params: { page?: number; limit?: number; wallet?: 'plan' | 'earnings' } = {}): Promise<WalletTransactionsResponse> {
    const qs = new URLSearchParams()
    qs.set('page', String(params.page ?? 1))
    qs.set('limit', String(params.limit ?? 10))
    if (params.wallet) qs.set('wallet', params.wallet)
    const res = await apiClient.apiGet<WalletTransactionsResponse & { success: boolean }>(
      `${ENDPOINTS.earnings.walletTransactions}?${qs}`
    )
    return res
  },

  rechargeCreateOrder: (amount: number) =>
    apiClient.apiPost<RechargeOrderResponse>(ENDPOINTS.dietitianWalletRecharge.createOrder, { amount }),

  rechargeVerify: (data: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => apiClient.apiPost<RechargeVerifyResponse>(ENDPOINTS.dietitianWalletRecharge.verify, data),

  rechargeFailed: (orderId: string) =>
    apiClient.apiPost<{ success: boolean }>(ENDPOINTS.dietitianWalletRecharge.failed, {
      razorpay_order_id: orderId,
    }),

  async getSummary(period: EarningsPeriod): Promise<EarningsSummary> {
    const res = await apiClient.apiGet<{ success: boolean; data: EarningsSummary }>(
      `${ENDPOINTS.earnings.summary}?period=${period}`
    )
    return res.data
  },
}

export default earningsApi

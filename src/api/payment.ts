import apiClient from './client'
import ENDPOINTS from './endpoints'

const PLAN_SLUG: Record<string, string> = {
  '1 Week':   '1_week',
  '1 Month':  '1_month',
  '3 Months': '3_months',
}

export type CreateOrderResponse = {
  success: true
  data: {
    order_id: string
    key_id: string
    amount: number
    currency: string
  }
}

export type VerifyResponse = {
  success: true
  message: string
}

export type FailedResponse = {
  success: true
  message: string
}

const paymentApi = {
  createOrder: (planType: string, formId: number) =>
    apiClient.apiPost<CreateOrderResponse>(ENDPOINTS.payment.createOrder, {
      plan:         PLAN_SLUG[planType] ?? '1_month',
      diet_form_id: formId,
    }),

  verify: (razorpayData: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) =>
    apiClient.apiPost<VerifyResponse>(ENDPOINTS.payment.verify, razorpayData),

  failed: (orderId: string) =>
    apiClient.apiPost<FailedResponse>(ENDPOINTS.payment.failed, {
      razorpay_order_id: orderId,
    }),
}

export default paymentApi

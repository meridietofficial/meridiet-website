import apiClient from './client'
import ENDPOINTS from './endpoints'

const PLAN_SLUG: Record<string, string> = {
  '1 Week':   '1_week',
  '1 Month':  '1_month',
  '3 Months': '3_months',
}

const PLAN_PRICE: Record<string, number> = {
  '1 Week':   199,
  '1 Month':  499,
  '3 Months': 999,
}

export type CouponData = {
  coupon_id: number
  code: string
  discount_type: string
  discount_value: number
  original_amount: number
  discount_applied: number
  final_amount: number
}

export type ValidateCouponResponse = {
  success: true
  message: string
  data: CouponData
}

export type CreateOrderResponse = {
  success: true
  data: {
    order_id: string
    key_id: string
    amount: number
    final_amount: number
    discount_applied: number
    currency: string
    plan: string
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
  validateCoupon: (code: string, planType: string) =>
    apiClient.apiPost<ValidateCouponResponse>(ENDPOINTS.coupons.validate, {
      code,
      applicable_type: 'diet_plan',
      amount: PLAN_PRICE[planType] ?? 499,
      plan:   PLAN_SLUG[planType]  ?? '1_month',
    }),

  createOrder: (planType: string, formId: number, couponCode?: string) =>
    apiClient.apiPost<CreateOrderResponse>(ENDPOINTS.payment.createOrder, {
      plan:         PLAN_SLUG[planType] ?? '1_month',
      diet_form_id: formId,
      ...(couponCode ? { coupon_code: couponCode } : {}),
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

export const dietitianRegOtpApi = {
  sendOtp: (phone: string) =>
    apiClient.apiPost<{ success: true; message: string }>(
      ENDPOINTS.dietitianRegistrationOtp.sendOtp, { phone }
    ),

  verifyOtp: (phone: string, otp: string) =>
    apiClient.apiPost<{ success: true; message: string; data: { phone_verified: true } }>(
      ENDPOINTS.dietitianRegistrationOtp.verifyOtp, { phone, otp }
    ),
}

export type RegistrationFeeOrderResponse = {
  success: true
  data: {
    order_id: string
    amount: number
    currency: string
    key_id: string
  }
}

export type RegistrationFeeVerifyResponse = {
  success: true
  data: {
    dietitian_id: number
    subscription_status: string
  }
}

export const dietitianRegistrationFeeApi = {
  createOrder: () =>
    apiClient.apiPost<RegistrationFeeOrderResponse>(ENDPOINTS.dietitianRegistrationFee.createOrder),

  verify: (data: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) =>
    apiClient.apiPost<RegistrationFeeVerifyResponse>(ENDPOINTS.dietitianRegistrationFee.verify, data),

  failed: (orderId: string) =>
    apiClient.apiPost<FailedResponse>(ENDPOINTS.dietitianRegistrationFee.failed, {
      razorpay_order_id: orderId,
    }),
}

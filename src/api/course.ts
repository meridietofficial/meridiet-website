import apiClient from './client'
import ENDPOINTS from './endpoints'

// ── Request bodies ──────────────────────────────────────────────
export type SendOtpBody       = { phone: string }
export type EnquiryBody       = { name: string; email: string; phone: string; otp: string; qualification?: string; message?: string }
export type EnrollBody        = { name: string; email: string; phone: string; otp: string; payment_plan?: 'full' | 'emi' }
export type CreateOrderBody   = { enrollment_id: number; coupon_code?: string }
export type VerifyPaymentBody = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
export type FailedPaymentBody = { razorpay_order_id: string }
export type ValidateCouponBody = { code: string; amount: number }

// ── Response shapes ─────────────────────────────────────────────
type Ok<T> = { success: true; message: string; data: T }

export type EnquiryData = { id: number; name: string; email: string; created_at: string }

export type EnrollData = {
  id: number
  name: string
  email: string
  course_fee: number
  created_at: string
}

export type CourseOrderData = {
  order_id: string
  amount: number           // final amount in rupees (after discount)
  original_amount: number  // pre-discount fee
  discount_applied: number
  coupon_code: string | null
  payment_plan: 'full' | 'emi'
  installment_number: number | null
  total_installments: number | null
  currency: string
  key_id: string
  enrollment_id: number
  name: string
  email: string
  phone: string
}

export type CouponValidateData = {
  coupon_id: number
  code: string
  discount_type: 'percentage' | 'flat'
  discount_value: number
  original_amount: number
  discount_applied: number
  final_amount: number
}

export type VerifyData = {
  enrollment_id: number
  name: string
  amount_paid: number
  payment_id: string
  payment_plan?: 'full' | 'emi'
  emi_installments_paid?: number
  emi_total_installments?: number
}

// ── API ─────────────────────────────────────────────────────────
const courseApi = {
  sendOtp: (body: SendOtpBody) =>
    apiClient.apiPost<Ok<null>>(ENDPOINTS.course.sendOtp, body),

  submitEnquiry: (body: EnquiryBody) =>
    apiClient.apiPost<Ok<EnquiryData>>(ENDPOINTS.course.enquiry, body),

  registerEnrollment: (body: EnrollBody) =>
    apiClient.apiPost<Ok<EnrollData>>(ENDPOINTS.course.enroll, body),

  createOrder: (body: CreateOrderBody) =>
    apiClient.apiPost<Ok<CourseOrderData>>(ENDPOINTS.course.createOrder, body),

  validateCoupon: (body: ValidateCouponBody) =>
    apiClient.apiPost<Ok<CouponValidateData>>(ENDPOINTS.coupons.validate, { ...body, applicable_type: 'course' }),

  verifyPayment: (body: VerifyPaymentBody) =>
    apiClient.apiPost<Ok<VerifyData>>(ENDPOINTS.course.verifyPayment, body),

  failedPayment: (body: FailedPaymentBody) =>
    apiClient.apiPost<Ok<null>>(ENDPOINTS.course.failedPayment, body),
}

export default courseApi

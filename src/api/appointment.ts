import apiClient from './client'
import ENDPOINTS from './endpoints'

export type AppointmentSlot = {
  date: string   // "2026-06-09"
  day: string    // "Tuesday"
  slots: string[] // ["09:00", "10:00", "11:00"]
}

export type CreateOrderBody = {
  dietitian_id: number
  appointment_date: string
  slot: string
  name: string
  email?: string
  phone?: string
  fee?: number
  notes?: string
}

export type CreateOrderResult = {
  appointment_id: number
  order_id: string
  amount: number
  currency: string
  key_id: string
}

export type VerifyBody = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export type ConfirmedAppointment = {
  appointment_id: number
  status: string
  payment_status: string
  appointment_date: string
  slot: string
}

export type MyAppointment = {
  id: number
  appointment_date: string
  slot: string
  duration: number
  session_type: string
  status: string
  payment_status: string
  fee: number
  currency: string
  notes: string | null
  missed_reason: string | null
  user_rating: number | null
  user_review: string | null
  user_reviewed_at: string | null
  dietitian_rating: number | null
  dietitian_review: string | null
  dietitian_reviewed_at: string | null
  is_follow_up: 0 | 1
  parent_appointment_id: number | null
  follow_up_type: 'paid' | 'free' | null
  agora_channel_name: string | null
  video_call_status: string | null
  recording_url: string | null
  call_started_at: string | null
  call_ended_at: string | null
  call_duration_seconds: number | null
  dietitian: {
    id: number
    full_name: string
    avatar_url: string | null
    city: string
    state: string
  }
  diet_plan: {
    id: number
    status: string
    pdf_url: string | null
  } | null
}

export type MyAppointmentsMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type DietitianClient = {
  user_id: number | null
  name: string
  avatar_url: string | null
  total_appointments: number
  last_appointment_date: string
  pending: number
  confirmed: number
  completed: number
  cancelled: number
}

export type DietitianAppointment = {
  id: number
  dietitian_id: number
  user_id: number
  name: string
  avatar_url: string | null
  appointment_date: string
  slot: string
  fee: string
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'missed'
  payment_status: string
  payment_id: string | null
  order_id: string
  notes: string | null
  missed_reason: string | null
  dietitian_notes: string | null
  created_at: string
  updated_at: string
  is_follow_up: boolean
  parent_appointment_id: number | null
  follow_up: { id: number; date: string; slot: string; status: string } | null
  user_review_done: boolean
  dietitian_review_done: boolean
  user_rating: number | null
  user_review: string | null
  user_reviewed_at: string | null
  dietitian_rating: number | null
  dietitian_review: string | null
  dietitian_reviewed_at: string | null
  diet_plan: DietPlanRef | null
}

export type DietitianReviewItem = {
  appointment_id: number
  appointment_date: string
  user_rating: number
  user_review: string | null
  user_reviewed_at: string
  client_name: string
  client_avatar: string | null
}

export type DietitianReviewsSummary = {
  average_rating: number
  total_reviews: number
  breakdown: Record<string, number>
}

export type DietitianReviewsResponse = {
  summary: DietitianReviewsSummary
  reviews: DietitianReviewItem[]
}

export type AppointmentReviews = {
  user_review_done: boolean
  dietitian_review_done: boolean
  reviews: {
    user: { rating: number; review: string; reviewed_at: string } | null
    dietitian: { rating: number; review: string; reviewed_at: string } | null
  }
}

export type RescheduleHistory = {
  id: number
  appointment_id: number
  rescheduled_by: number
  rescheduled_by_name: string
  previous_date: string
  previous_slot: string
  new_date: string
  new_slot: string
  reason: string | null
  created_at: string
}

export type RescheduleSlots = {
  current: { date: string; slot: string }
  available_slots: AppointmentSlot[]
  booked_slots: AppointmentSlot[]
}

export type FollowUpSlots = {
  available_slots: { date: string; day: string; slots: string[] }[]
  booked_slots:    { date: string; day: string; slots: string[] }[]
}

export type CreateFollowUpBody = {
  appointment_date: string
  slot: string
  duration?: number
  fee?: number
  session_type?: 'video_call' | 'in_person'
  notes?: string
}

export type FollowUpAppointment = {
  id: number
  dietitian_id: number
  user_id: number
  name: string
  appointment_date: string
  slot: string
  duration: number
  session_type: string
  fee: number | string
  currency: string
  status: string
  payment_status: string
  is_follow_up: boolean
  parent_appointment_id: number
  notes: string | null
  dietitian_notes?: string | null
}

export type DietPlanRef = {
  id: number
  form_id: number | null
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'archived'
  pdf_url?: string | null
}

export type AppointmentDietForm = {
  id: number
  user_id: number
  plan_type: number | null
  full_name: string
  age: number | null
  gender: string | null
  dob: string | null
  height_unit: 'cm' | 'ft_in'
  height: string | null
  weight_unit: 'kg' | 'lbs'
  weight: number | null
  goals: string[]
  activity_level: string | null
  work_type: string | null
  workout_type: string | null
  diet_type: string | null
  cuisine_preference: string[]
  food_allergies: string[]
  foods_dislike: string | null
  favorite_foods: string | null
  medical_conditions: string[]
  other_condition: string | null
  on_medication: string | null
  medications: string | null
  digestive_health: string | null
  smoke_alcohol: string | null
  health_notes: string | null
  contact_name: string | null
  whatsapp: string | null
  email: string | null
  delivery_method: string | null
  city: string | null
  state: string | null
  created_at: string
  updated_at: string
}

export type DietitianSession = {
  id: number
  time: string
  slot: string
  duration: number
  session_type: string
  status: string
  payment_status: string
  notes: string | null
  session_number: number
  is_follow_up: boolean
  parent_appointment_id: number | null
  diet_plan: DietPlanRef | null
  client: {
    user_id: number
    name: string
    initials: string
    avatar_url: string | null
  }
  dietitian_review_done?: boolean
  dietitian_rating?: number | null
  dietitian_review?: string | null
  user_review_done?: boolean
  user_rating?: number | null
}

export type DietitianSessionGroup = {
  date: string
  label: string
  count: number
  sessions: DietitianSession[]
}

export type DietitianSessionsSummary = {
  all: number
  upcoming: number
  completed: number
  cancelled: number
  pending: number
  missed: number
}

export type JoinCallData = {
  channel_name: string
  token: string
  uid: number
  app_id: string
  expires_at: number
  max_duration_seconds: number
  call_started_at?: string | null
}

export type LeaveCallData = {
  call_ended_at: string
  call_duration_seconds: number
  status: string
}

export type DashboardStats = {
  today_consultations: {
    count: number
    change_percent: number
    change_direction: 'up' | 'down' | 'flat'
  }
  pending_requests: {
    count: number
  }
  upcoming_appointments: {
    count: number
    next_slot: string | null
    next_date: string | null
  }
  monthly_earnings: {
    amount: number
    currency: string
    change_percent: number
    change_direction: 'up' | 'down' | 'flat'
  }
}

export type RecordingData = {
  video_call_status: string
  recording_url: string | null
  call_started_at: string | null
  call_ended_at: string | null
  call_duration_seconds: number
}

const appointmentApi = {
  async getSlots(dietitianId: number, days = 14): Promise<AppointmentSlot[]> {
    const res = await apiClient.apiGet<{ success: boolean; data: AppointmentSlot[] }>(
      `${ENDPOINTS.appointment.slots}/${dietitianId}?days=${days}`
    )
    return res.data
  },

  async createOrder(body: CreateOrderBody): Promise<CreateOrderResult> {
    const res = await apiClient.apiPost<{ success: boolean; data: CreateOrderResult }>(
      ENDPOINTS.appointment.createOrder,
      body
    )
    return res.data
  },

  async verify(body: VerifyBody): Promise<ConfirmedAppointment> {
    const res = await apiClient.apiPost<{ success: boolean; data: ConfirmedAppointment }>(
      ENDPOINTS.appointment.verify,
      body
    )
    return res.data
  },

  async failed(orderId: string): Promise<void> {
    await apiClient.apiPost(ENDPOINTS.appointment.failed, { razorpay_order_id: orderId })
  },

  async myAppointments(page = 1, limit = 10): Promise<{ data: MyAppointment[]; meta: MyAppointmentsMeta }> {
    const res = await apiClient.apiGet<{ success: boolean; data: MyAppointment[]; meta: MyAppointmentsMeta }>(
      `${ENDPOINTS.appointment.my}?page=${page}&limit=${limit}`
    )
    return { data: res.data, meta: res.meta }
  },

  async getDietitianAppointments(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{ data: DietitianAppointment[]; meta: MyAppointmentsMeta }> {
    const q = new URLSearchParams()
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.limit)  q.set('limit',  String(params.limit))
    if (params?.status) q.set('status', params.status)
    const qs = q.toString()
    const res = await apiClient.apiGet<{ success: boolean; data: DietitianAppointment[]; meta: MyAppointmentsMeta }>(
      `${ENDPOINTS.appointment.dietitianList}${qs ? '?' + qs : ''}`
    )
    return { data: res.data, meta: res.meta }
  },

  async getClients(params?: {
    page?: number
    limit?: number
  }): Promise<{ data: DietitianClient[]; meta: MyAppointmentsMeta }> {
    const q = new URLSearchParams()
    if (params?.page)  q.set('page',  String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    const qs = q.toString()
    const res = await apiClient.apiGet<{ success: boolean; data: DietitianClient[]; meta: MyAppointmentsMeta }>(
      `${ENDPOINTS.appointment.clientsList}${qs ? '?' + qs : ''}`
    )
    return { data: res.data, meta: res.meta }
  },

  async getDietitianSessions(params?: {
    tab?: 'all' | 'upcoming' | 'completed' | 'cancelled' | 'missed'
    search?: string
    page?: number
    limit?: number
  }): Promise<{ data: { summary: DietitianSessionsSummary; grouped: DietitianSessionGroup[] }; meta: MyAppointmentsMeta }> {
    const q = new URLSearchParams()
    if (params?.tab)    q.set('tab',    params.tab)
    if (params?.search) q.set('search', params.search)
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.limit)  q.set('limit',  String(params.limit))
    q.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
    const qs = q.toString()
    const res = await apiClient.apiGet<{
      success: boolean
      data: { summary: DietitianSessionsSummary; grouped: DietitianSessionGroup[] }
      meta: MyAppointmentsMeta
    }>(`${ENDPOINTS.appointment.dietitianSessions}${qs ? '?' + qs : ''}`)
    return { data: res.data, meta: res.meta }
  },

  async joinCall(id: number): Promise<JoinCallData> {
    const res = await apiClient.apiPost<{ success: boolean; data: JoinCallData }>(
      `${ENDPOINTS.appointment.joinCall}/${id}/join-call`,
      {}
    )
    return res.data
  },

  async leaveCall(id: number): Promise<LeaveCallData> {
    const res = await apiClient.apiPost<{ success: boolean; data: LeaveCallData }>(
      `${ENDPOINTS.appointment.leaveCall}/${id}/leave-call`,
      {}
    )
    return res.data
  },

  async getRecording(id: number): Promise<RecordingData> {
    const res = await apiClient.apiGet<{ success: boolean; data: RecordingData }>(
      `${ENDPOINTS.appointment.recording}/${id}/recording`
    )
    return res.data
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await apiClient.apiGet<{ success: boolean; data: DashboardStats }>(
      ENDPOINTS.appointment.dashboardStats
    )
    return res.data
  },

  async getById(id: number): Promise<DietitianAppointment> {
    const res = await apiClient.apiGet<{ success: boolean; data: DietitianAppointment }>(
      `${ENDPOINTS.appointment.single}/${id}`
    )
    return res.data
  },

  async saveDietitianNotes(id: number, notes: string): Promise<void> {
    await apiClient.apiPut(
      `${ENDPOINTS.appointment.single}/${id}/dietitian-notes`,
      { notes }
    )
  },

  async updateAppointmentStatus(
    id: number,
    status: 'confirmed' | 'completed' | 'cancelled' | 'missed'
  ): Promise<void> {
    await apiClient.apiPatch(
      `${ENDPOINTS.appointment.updateStatus}/${id}/status`,
      { status }
    )
  },

  async rescheduleAppointment(
    id: number,
    body: { appointment_date: string; slot: string; reason?: string }
  ): Promise<void> {
    await apiClient.apiPatch(
      `${ENDPOINTS.appointment.single}/${id}/reschedule`,
      body
    )
  },

  async getRescheduleHistory(id: number): Promise<RescheduleHistory[]> {
    const res = await apiClient.apiGet<{ success: boolean; data: RescheduleHistory[] }>(
      `${ENDPOINTS.appointment.single}/${id}/reschedule-history`
    )
    return res.data
  },

  async getRescheduleSlots(id: number, days = 30): Promise<RescheduleSlots> {
    const res = await apiClient.apiGet<{ success: boolean; data: RescheduleSlots }>(
      `${ENDPOINTS.appointment.single}/${id}/reschedule-slots?days=${days}`
    )
    return res.data
  },

  async getFollowUpSlots(id: number, days = 30): Promise<FollowUpSlots> {
    const res = await apiClient.apiGet<{ success: boolean; data: FollowUpSlots }>(
      `${ENDPOINTS.appointment.single}/${id}/follow-up-slots?days=${days}`
    )
    return res.data
  },

  async getReviews(id: number): Promise<AppointmentReviews> {
    const res = await apiClient.apiGet<{ success: boolean; data: AppointmentReviews }>(
      `${ENDPOINTS.appointment.single}/${id}/reviews`
    )
    return res.data
  },

  async getDietitianReviews(params?: {
    rating?: number
    search?: string
    page?: number
    limit?: number
  }): Promise<{ data: DietitianReviewsResponse; meta: MyAppointmentsMeta }> {
    const q = new URLSearchParams()
    if (params?.rating) q.set('rating', String(params.rating))
    if (params?.search) q.set('search', params.search)
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.limit)  q.set('limit',  String(params.limit))
    const qs = q.toString()
    const res = await apiClient.apiGet<{ success: boolean; data: DietitianReviewsResponse; meta: MyAppointmentsMeta }>(
      `${ENDPOINTS.appointment.dietitianReviews}${qs ? '?' + qs : ''}`
    )
    return { data: res.data, meta: res.meta }
  },

  async submitReview(id: number, body: { rating: number; review: string }): Promise<void> {
    await apiClient.apiPost(
      `${ENDPOINTS.appointment.single}/${id}/review`,
      body
    )
  },

  async getDietFormForAppointment(appointmentId: number): Promise<AppointmentDietForm> {
    const res = await apiClient.apiGet<{ success: boolean; data: AppointmentDietForm }>(
      `${ENDPOINTS.appointment.single}/${appointmentId}/diet-form`
    )
    return res.data
  },

  async scheduleFollowUp(id: number, body: CreateFollowUpBody): Promise<FollowUpAppointment> {
    const res = await apiClient.apiPost<{ success: boolean; data: FollowUpAppointment }>(
      `${ENDPOINTS.appointment.single}/${id}/follow-up`,
      body
    )
    return res.data
  },

  async getFollowUps(id: number): Promise<FollowUpAppointment[]> {
    const res = await apiClient.apiGet<{ success: boolean; data: FollowUpAppointment[] }>(
      `${ENDPOINTS.appointment.single}/${id}/follow-ups`
    )
    return res.data
  },
}

export default appointmentApi

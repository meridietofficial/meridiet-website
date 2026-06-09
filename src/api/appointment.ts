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
  slot: string            // "HH:MM" start time, e.g. "09:30"
  status: string
  payment_status: string
  fee: string | number    // API returns string e.g. "1234.00"
  currency: string
  notes: string | null
  dietitian: {
    id: number
    full_name: string
    avatar_url: string | null
    city: string
    state: string
  }
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
  email: string | null
  phone: string | null
  appointment_date: string
  slot: string
  fee: string
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: string
  payment_id: string | null
  order_id: string
  notes: string | null
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
  client: {
    user_id: number
    name: string
    initials: string
    avatar_url: string | null
  }
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
    tab?: 'all' | 'upcoming' | 'completed' | 'cancelled'
    search?: string
    page?: number
    limit?: number
  }): Promise<{ data: { summary: DietitianSessionsSummary; grouped: DietitianSessionGroup[] }; meta: MyAppointmentsMeta }> {
    const q = new URLSearchParams()
    if (params?.tab)    q.set('tab',    params.tab)
    if (params?.search) q.set('search', params.search)
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.limit)  q.set('limit',  String(params.limit))
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

  async updateAppointmentStatus(
    id: number,
    status: 'confirmed' | 'completed' | 'cancelled'
  ): Promise<void> {
    await apiClient.apiPatch(
      `${ENDPOINTS.appointment.updateStatus}/${id}/status`,
      { status }
    )
  },
}

export default appointmentApi

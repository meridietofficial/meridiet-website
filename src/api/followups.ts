import apiClient from './client'
import ENDPOINTS from './endpoints'

export type FollowUpSummary = {
  due_today: number
  upcoming: number
  completed: number
  missed: number
}

export type FollowUpItem = {
  id: number
  parent_appointment_id: number
  client_name: string
  client_avatar: string | null
  follow_up_type: string
  goal: string
  appointment_date: string
  slot: string
  status: string
  display_status: 'due_today' | 'upcoming' | 'completed' | 'missed'
  notes: string
}

export type FollowUpsMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

const followUpsApi = {
  async getList(params?: {
    tab?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ data: { summary: FollowUpSummary; follow_ups: FollowUpItem[] }; meta: FollowUpsMeta }> {
    const q = new URLSearchParams()
    if (params?.tab)    q.set('tab',    params.tab)
    if (params?.search) q.set('search', params.search)
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.limit)  q.set('limit',  String(params.limit))
    const qs = q.toString()
    return apiClient.apiGet(
      `${ENDPOINTS.followUps.list}${qs ? '?' + qs : ''}`
    )
  },
}

export default followUpsApi

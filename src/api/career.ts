import apiClient from './client'

const BASE = '/career'

export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship'

export type Job = {
  id: number
  title: string
  department: string
  location: string
  job_type: JobType
  experience_required: string
  description: string
  responsibilities: string[]
  requirements: string[]
  salary_range: string
  deadline: string
  created_at: string
}

export type ApplyBody = {
  full_name: string
  email: string
  phone: string
  current_location: string
  total_experience: string
  resume_url: string
  current_company?: string
  current_ctc?: string
  expected_ctc?: string
  notice_period?: string
  cover_letter?: string
  linkedin_url?: string
}

type JobListResponse = { success: boolean; message: string; data: Job[] }
type JobResponse     = { success: boolean; message: string; data: Job }
type ApplyResponse   = { success: boolean; message: string; data: { id: number } }

const careerApi = {
  async listJobs(params?: { department?: string; job_type?: string }): Promise<Job[]> {
    const qs = new URLSearchParams()
    if (params?.department) qs.append('department', params.department)
    if (params?.job_type)   qs.append('job_type',   params.job_type)
    const q   = qs.toString()
    const res = await apiClient.apiGet<JobListResponse>(`${BASE}${q ? `?${q}` : ''}`)
    return res.data
  },

  async getJob(id: number): Promise<Job> {
    const res = await apiClient.apiGet<JobResponse>(`${BASE}/${id}`)
    return res.data
  },

  async apply(id: number, body: ApplyBody): Promise<{ id: number }> {
    const res = await apiClient.apiPost<ApplyResponse>(`${BASE}/${id}/apply`, body)
    return res.data
  },
}

export default careerApi

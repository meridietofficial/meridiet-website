const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function getHeaders(extra?: HeadersInit): HeadersInit {
  const token = localStorage.getItem('meri_diet_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  }
}

async function request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, options)
  const data = await res.json()
  if (!data.success) {
    throw new ApiError(data.message ?? 'Something went wrong. Please try again.')
  }
  return data as T
}

const apiClient = {
  apiGet<T>(endpoint: string, headers?: HeadersInit) {
    return request<T>(endpoint, { method: 'GET', headers: getHeaders(headers) })
  },

  apiPost<T>(endpoint: string, body?: unknown, headers?: HeadersInit) {
    return request<T>(endpoint, {
      method: 'POST',
      headers: getHeaders(headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  },

  apiPut<T>(endpoint: string, body?: unknown, headers?: HeadersInit) {
    return request<T>(endpoint, {
      method: 'PUT',
      headers: getHeaders(headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  },

  apiDelete<T>(endpoint: string, headers?: HeadersInit) {
    return request<T>(endpoint, { method: 'DELETE', headers: getHeaders(headers) })
  },
}

export default apiClient

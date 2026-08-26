const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://api.meridiet.com/api/v1'
console.log('[API] Base URL:', BASE_URL)

export class ApiError extends Error {
  errorCode?: string
  constructor(message: string, errorCode?: string) {
    super(message)
    this.name = 'ApiError'
    this.errorCode = errorCode
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

function clearAuthAndRedirect() {
  localStorage.removeItem('meri_diet_token')
  localStorage.removeItem('meri_diet_user')
  sessionStorage.removeItem('meri_diet_dietitian_setup_skipped')
  window.location.href = '/'
}

async function request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, options)
  const data = await res.json()
  if (!data.success) {
    const msg: string = data.message ?? 'Something went wrong. Please try again.'
    const errorCode: string | undefined = data.error_code
    // Only treat 401 as a session expiry when a token is already stored.
    // A plain login failure also returns 401 (wrong credentials) — no redirect there.
    const hasSession = !!localStorage.getItem('meri_diet_token')
    if (/invalid or expired token/i.test(msg) || (res.status === 401 && hasSession)) {
      clearAuthAndRedirect()
      throw new ApiError('Session expired. Please log in again.')
    }
    if (res.status === 403 && errorCode) {
      window.dispatchEvent(new CustomEvent('dietitian-access-blocked', { detail: { errorCode } }))
    }
    throw new ApiError(msg, errorCode)
  }
  return data as T
}

function getAuthOnlyHeaders(extra?: HeadersInit): HeadersInit {
  const token = localStorage.getItem('meri_diet_token')
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  }
}

const apiClient = {
  apiGet<T>(endpoint: string, headers?: HeadersInit) {
    return request<T>(endpoint, { method: 'GET', headers: getHeaders(headers) })
  },

  apiPostForm<T>(endpoint: string, formData: FormData, headers?: HeadersInit) {
    return request<T>(endpoint, {
      method: 'POST',
      headers: getAuthOnlyHeaders(headers),
      body: formData,
    })
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

  apiPatch<T>(endpoint: string, body?: unknown, headers?: HeadersInit) {
    return request<T>(endpoint, {
      method: 'PATCH',
      headers: getHeaders(headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  },

  apiDelete<T>(endpoint: string, headers?: HeadersInit) {
    return request<T>(endpoint, { method: 'DELETE', headers: getHeaders(headers) })
  },

  apiDeleteWithBody<T>(endpoint: string, body: unknown, headers?: HeadersInit) {
    return request<T>(endpoint, {
      method: 'DELETE',
      headers: getHeaders(headers),
      body: JSON.stringify(body),
    })
  },
}

export default apiClient

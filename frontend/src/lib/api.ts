const BASE = process.env.NEXT_PUBLIC_API_URL || (
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'http://localhost:8000'
)

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('cityv-admin-token')
}

async function apiFetch(path: string, useAuth = false): Promise<any> {
  const headers: Record<string, string> = {}
  if (useAuth) {
    const token = getAuthToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store', headers })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

async function apiPost(path: string, body: unknown, useAuth = false): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (useAuth) {
    const token = getAuthToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

async function apiPut(path: string, body: unknown, useAuth = false): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (useAuth) {
    const token = getAuthToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export const api = {
  dashboard: {
    summary: () => apiFetch('/api/dashboard/summary'),
  },
  traffic: {
    live: ()                       => apiFetch('/api/traffic/live'),
    summary: ()                    => apiFetch('/api/traffic/summary'),
    ai: ()                         => apiFetch('/api/traffic/ai-analysis'),
    aiAnalysis: ()                 => apiFetch('/api/traffic/ai-analysis'),
    history: (limit?: number)      => apiFetch(`/api/traffic/history${limit ? `?limit=${limit}` : ''}`),
  },
  energy: {
    live: ()                       => apiFetch('/api/energy/live'),
    summary: ()                    => apiFetch('/api/energy/summary'),
    ai: ()                         => apiFetch('/api/energy/ai-analysis'),
    aiAnalysis: ()                 => apiFetch('/api/energy/ai-analysis'),
    history: (limit?: number)      => apiFetch(`/api/energy/history${limit ? `?limit=${limit}` : ''}`),
  },
  waste: {
    live: ()                       => apiFetch('/api/waste/live'),
    summary: ()                    => apiFetch('/api/waste/summary'),
    ai: ()                         => apiFetch('/api/waste/ai-analysis'),
    routes: ()                     => apiFetch('/api/waste/optimize-routes'),
    optimizeRoutes: ()             => apiFetch('/api/waste/optimize-routes'),
  },
  safety: {
    incidents: (limitOrStatus?: string | number) => {
      if (typeof limitOrStatus === 'number') return apiFetch(`/api/safety/incidents?limit=${limitOrStatus}`)
      if (limitOrStatus) return apiFetch(`/api/safety/incidents?status=${limitOrStatus}`)
      return apiFetch('/api/safety/incidents')
    },
    riskMap: ()                    => apiFetch('/api/safety/risk-map'),
    ai: ()                         => apiFetch('/api/safety/ai-analysis'),
    aiAnalysis: ()                 => apiFetch('/api/safety/ai-analysis'),
    summary: ()                    => apiFetch('/api/safety/summary'),
  },
  air: {
    live: ()                       => apiFetch('/api/air-quality/live'),
    summary: ()                    => apiFetch('/api/air-quality/summary'),
    ai: ()                         => apiFetch('/api/air-quality/ai-analysis'),
    aiAnalysis: ()                 => apiFetch('/api/air-quality/ai-analysis'),
    history: (limit?: number)      => apiFetch(`/api/air-quality/history${limit ? `?limit=${limit}` : ''}`),
  },
  get airQuality() { return this.air },
  citizens: {
    reports: (limitOrStatus?: string | number, category?: string) => {
      const params = new URLSearchParams()
      if (typeof limitOrStatus === 'number') params.set('limit', String(limitOrStatus))
      else if (limitOrStatus) params.set('status', limitOrStatus)
      if (category) params.set('category', category)
      const q = params.toString()
      return apiFetch(`/api/citizens/reports${q ? `?${q}` : ''}`)
    },
    submit: (body: unknown)        => apiPost('/api/citizens/report', body),
    summary: ()                    => apiFetch('/api/citizens/summary'),
    upvote: (id: string)           => apiPost(`/api/citizens/reports/${id}/upvote`, {}),
  },
  venues: {
    live: ()                       => apiFetch('/api/venues/live'),
    summary: ()                    => apiFetch('/api/venues/summary'),
    ai: ()                         => apiFetch('/api/venues/ai-analysis'),
    byCategory: (cat: string)      => apiFetch(`/api/venues/by-category/${cat}`),
    heatmap: ()                    => apiFetch('/api/venues/heatmap'),
  },
  admin: {
    login: (body: unknown)         => apiPost('/api/admin/auth/login', body),
    me: ()                         => apiFetch('/api/admin/auth/me', true),
    tenants: ()                    => apiFetch('/api/admin/tenants', true),
    createTenant: (body: unknown)  => apiPost('/api/admin/tenants', body, true),
    tenant: (id: string)           => apiFetch(`/api/admin/tenants/${id}`, true),
    resolveTenant: (host: string)  => apiFetch(`/api/admin/resolve?host=${encodeURIComponent(host)}`),
    updateTenant: (id: string, body: unknown) => apiPut(`/api/admin/tenants/${id}`, body, true),
    users: ()                      => apiFetch('/api/admin/users', true),
    createUser: (body: unknown)    => apiPost('/api/admin/users', body, true),
  },
}

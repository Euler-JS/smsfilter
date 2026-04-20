import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '../store/uiStore'

const BASE_URL = 'https://api.optimusguard.jaaziel.co.mz/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor – attach JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor – handle 401 / 500
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const addToast = useUiStore.getState().addToast
    const lang = useUiStore.getState().language

    if (status === 401) {
      useAuthStore.getState().logout()
      addToast('error', lang === 'pt' ? 'Sessão expirada. Por favor inicie sessão novamente.' : 'Session expired. Please sign in again.')
      window.location.href = '/login'
    } else if (status >= 500) {
      addToast('error', lang === 'pt' ? 'Erro interno do servidor. Tente novamente.' : 'Internal server error. Please try again.')
    }
    return Promise.reject(error)
  }
)

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: { id: string; name: string; email: string; role: string } }>('/auth/login', { email, password }),
}

// ---- Overview ----
export const overviewApi = {
  getStats: () => api.get('/overview/stats'),
  getBlocksPerDay: (days = 30) => api.get(`/overview/blocks-per-day?days=${days}`),
  getBlocksByPlatform: () => api.get('/overview/blocks-by-platform'),
  getTopPatterns: (limit = 5) => api.get(`/overview/top-patterns?limit=${limit}`),
  getRecentBlocked: (limit = 10) => api.get(`/overview/recent-blocked?limit=${limit}`),
}

// ---- Patterns ----
export const patternsApi = {
  list: (params: Record<string, string | number>) =>
    api.get('/patterns', { params }),
  create: (data: Record<string, unknown>) => api.post('/patterns', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/patterns/${id}`, data),
  delete: (id: string) => api.delete(`/patterns/${id}`),
  toggleStatus: (id: string, status: string) => api.patch(`/patterns/${id}/status`, { status }),
}

// ---- Statistics ----
export const statisticsApi = {
  getBlocksOverTime: (params: Record<string, string>) => api.get('/statistics/blocks-over-time', { params }),
  getBlocksByPlatform: (params: Record<string, string>) => api.get('/statistics/blocks-by-platform', { params }),
  getBlocksBySeverity: (params: Record<string, string>) => api.get('/statistics/blocks-by-severity', { params }),
  getBlocksByLanguage: (params: Record<string, string>) => api.get('/statistics/blocks-by-language', { params }),
  getTopPatterns: (params: Record<string, string>) => api.get('/statistics/top-patterns', { params }),
}

// ---- Messages ----
export const messagesApi = {
  list: (params: Record<string, string | number>) => api.get('/messages', { params }),
  getById: (id: string) => api.get(`/messages/${id}`),
}

// ---- Devices ----
export const devicesApi = {
  list: (params: Record<string, string | number>) => api.get('/devices', { params }),
}

// ---- Settings ----
export const settingsApi = {
  getProfile: () => api.get('/settings/profile'),
  updateProfile: (data: Record<string, string>) => api.put('/settings/profile', data),
  getApiConfig: () => api.get('/settings/api-config'),
  updateApiConfig: (data: Record<string, string | number>) => api.put('/settings/api-config', data),
  clearStatistics: () => api.delete('/settings/statistics'),
  resetPatterns: () => api.post('/settings/reset-patterns'),
}

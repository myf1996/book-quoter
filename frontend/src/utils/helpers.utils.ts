import axios from 'axios'

/** Base axios instance — all requests go through /api which Vite proxies to port 5000 */
export const api = axios.create({ baseURL: '/api' })

// Attach JWT Bearer token from localStorage on every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '@/utils/helpers.utils'

/** Authenticated user shape returned by the backend */
export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'customer'
}

interface AuthApiResponse {
  accessToken: string
  user: AuthUser
}

/**
 * Manages authentication state — JWT token storage, user info, and auth actions.
 * Token is persisted in localStorage so the user stays logged in on page refresh.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  /**
   * Authenticates with the backend and stores the resulting JWT.
   * @param email - User's email address
   * @param password - User's plaintext password
   */
  async function login(email: string, password: string): Promise<void> {
    const { data } = await api.post<AuthApiResponse>('/auth/login', { email, password })
    _applyAuth(data)
  }

  /**
   * Registers a new account and stores the resulting JWT.
   * @param email - New user's email address
   * @param password - New user's plaintext password (min 8 chars)
   */
  async function register(name: string, email: string, password: string): Promise<void> {
    const { data } = await api.post<AuthApiResponse>('/auth/register', { name, email, password })
    _applyAuth(data)
  }

  /**
   * Fetches the current user's profile using the stored token.
   * Called on app startup when a token already exists in localStorage.
   */
  async function fetchCurrentUser(): Promise<void> {
    if (!token.value) return
    try {
      const { data } = await api.get<AuthUser>('/auth/me')
      user.value = data
    } catch {
      // Token is expired or invalid — clear it
      logout()
    }
  }

  /**
   * Updates the authenticated user's display name via the backend.
   * @param name - New display name (min 2 chars)
   */
  async function updateProfile(name: string): Promise<void> {
    const { data } = await api.patch<{ id: string; name: string; email: string }>('/auth/profile', { name })
    if (user.value) user.value = { ...user.value, name: data.name }
  }

  /** Clears auth state and removes the token from localStorage */
  function logout(): void {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
  }

  /** Applies a successful auth response — sets token, user, and persists to localStorage */
  function _applyAuth(data: AuthApiResponse): void {
    token.value = data.accessToken
    user.value = data.user
    localStorage.setItem('auth_token', data.accessToken)
  }

  return { user, token, isAuthenticated, login, register, fetchCurrentUser, logout, updateProfile }
})

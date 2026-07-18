import { api } from '@/utils/helpers.utils'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AppConfig {
  phases: {
    phase1CoreQuoter: boolean
    phase2PricingEngine: boolean
    phase3Authentication: boolean
    phase4AdminPanel: boolean
  }
  features: Record<string, { enabled: boolean }>
}

/**
 * Stores the global feature-flag config fetched from GET /api/config.
 * Consumed by components to show/hide phase-specific UI.
 */
export const useConfigStore = defineStore('config', () => {
  const globalConfig = ref<AppConfig | null>(null)
  const isLoading = ref(false)

  /** Fetches config from backend — called once on app mount */
  async function fetchConfig(): Promise<void> {
    isLoading.value = true
    try {
      const { data } = await api.get<AppConfig>('/config')
      globalConfig.value = data
    } catch (err) {
      console.error('Failed to fetch config:', err)
    } finally {
      isLoading.value = false
    }
  }

  return { globalConfig, isLoading, fetchConfig }
})

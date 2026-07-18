import { api } from '@/utils/helpers.utils'
import { onMounted, ref } from 'vue'

export interface ProductOption {
  id: number
  name: string
  [key: string]: unknown
}

/**
 * Fetches a product list from the given endpoint on mount.
 * Used by each step component to load its options.
 *
 * @param endpoint - API path e.g. '/products/trim-sizes'
 */
export function useProductOptions(endpoint: string) {
  const options = ref<ProductOption[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  onMounted(async () => {
    isLoading.value = true
    try {
      const { data } = await api.get<ProductOption[]>(endpoint)
      options.value = data
    } catch (err) {
      error.value = 'Failed to load options. Please refresh.'
      console.error(`Failed to load ${endpoint}:`, err)
    } finally {
      isLoading.value = false
    }
  })

  return { options, isLoading, error }
}

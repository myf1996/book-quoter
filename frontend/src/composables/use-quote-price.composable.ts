import { api } from '@/utils/helpers.utils'
import { ref, watch } from 'vue'
import { useQuoteStore } from '@/stores/quote.store'

/** Full price breakdown returned by POST /api/quoter/calculate */
export interface PriceBreakdown {
  pageCost: number
  coverCost: number
  bindingCost: number
  subtotal: number
  tax: number
  total: number
}

/**
 * Watches the quote state and automatically requests a price calculation
 * from the backend whenever all 8 required fields are filled in.
 *
 * @returns Reactive refs for the price breakdown, loading state, and any error message
 */
export function useQuotePrice() {
  const quoteStore = useQuoteStore()

  const priceBreakdown = ref<PriceBreakdown | null>(null)
  const isCalculating = ref(false)
  const priceError = ref<string | null>(null)

  /** Returns true when all required fields in the quote state are non-null */
  function allFieldsFilled(): boolean {
    const s = quoteStore.quoteState
    return (
      s.trimSizeId !== null &&
      s.coverStyleId !== null &&
      s.coverFinishId !== null &&
      s.printTypeId !== null &&
      s.paperStockId !== null &&
      s.bindingTypeId !== null &&
      s.pageCount !== null &&
      s.quantity !== null
    )
  }

  async function fetchPrice(): Promise<void> {
    if (!allFieldsFilled()) {
      priceBreakdown.value = null
      return
    }

    isCalculating.value = true
    priceError.value = null

    try {
      const s = quoteStore.quoteState
      const { data } = await api.post<PriceBreakdown>('/quoter/calculate', {
        trimSizeId: s.trimSizeId,
        coverStyleId: s.coverStyleId,
        coverFinishId: s.coverFinishId,
        printTypeId: s.printTypeId,
        paperStockId: s.paperStockId,
        bindingTypeId: s.bindingTypeId,
        pageCount: s.pageCount,
        quantity: s.quantity,
      })
      priceBreakdown.value = data
    } catch (err) {
      console.error('Price calculation failed:', err)
      priceError.value = 'Unable to calculate price. Please try again.'
      priceBreakdown.value = null
    } finally {
      isCalculating.value = false
    }
  }

  watch(
    () => ({ ...quoteStore.quoteState }),
    () => {
      void fetchPrice()
    },
    { deep: true },
  )

  return { priceBreakdown, isCalculating, priceError }
}

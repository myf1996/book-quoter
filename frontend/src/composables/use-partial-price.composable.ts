import { ref, computed } from 'vue'
import { useQuoteStore } from '@/stores/quote.store'
import { api } from '@/utils/helpers.utils'

interface PageRateEntry { printTypeId: string; paperStockId: string; ratePerPage: number }
interface CoverRateEntry { coverStyleId: string; coverFinishId: string; basePrice: number }
interface BindingRateEntry { bindingTypeId: string; surcharge: number }

interface RatesResponse {
  pageRates: PageRateEntry[]
  coverRates: CoverRateEntry[]
  bindingRates: BindingRateEntry[]
}

/**
 * Fetches all rate tables once and computes partial per-copy costs client-side.
 * Each cost line becomes available independently as the user selects options —
 * no need to wait for all 8 fields before showing any estimate.
 */
export function usePartialPrice() {
  const quoteStore = useQuoteStore()

  const pageRates = ref<PageRateEntry[]>([])
  const coverRates = ref<CoverRateEntry[]>([])
  const bindingRates = ref<BindingRateEntry[]>([])
  const ratesLoaded = ref(false)

  async function loadRates(): Promise<void> {
    try {
      const { data } = await api.get<RatesResponse>('/products/rates')
      pageRates.value = data.pageRates
      coverRates.value = data.coverRates
      bindingRates.value = data.bindingRates
      ratesLoaded.value = true
    } catch (err) {
      console.error('[usePartialPrice] Failed to load rates:', err)
    }
  }

  loadRates()

  /** Per-copy page printing cost — available once print type, paper stock, and page count are set */
  const pageRatePerCopy = computed((): number | null => {
    const { printTypeId, paperStockId, pageCount } = quoteStore.quoteState
    if (!ratesLoaded.value || !printTypeId || !paperStockId || !pageCount) return null
    const entry = pageRates.value.find(
      (r) => r.printTypeId === printTypeId && r.paperStockId === paperStockId,
    )
    return entry != null ? entry.ratePerPage * pageCount : null
  })

  /** Per-copy cover cost — available once cover style and finish are both set */
  const coverBasePrice = computed((): number | null => {
    const { coverStyleId, coverFinishId } = quoteStore.quoteState
    if (!ratesLoaded.value || !coverStyleId || !coverFinishId) return null
    const entry = coverRates.value.find(
      (r) => r.coverStyleId === coverStyleId && r.coverFinishId === coverFinishId,
    )
    return entry?.basePrice ?? null
  })

  /** Per-copy binding surcharge — available once binding type is set */
  const bindingSurcharge = computed((): number | null => {
    const { bindingTypeId } = quoteStore.quoteState
    if (!ratesLoaded.value || !bindingTypeId) return null
    const entry = bindingRates.value.find((r) => r.bindingTypeId === bindingTypeId)
    return entry?.surcharge ?? null
  })

  /** Sum of whichever per-copy costs are known so far */
  const estimatedPerCopy = computed((): number | null => {
    const page = pageRatePerCopy.value
    const cover = coverBasePrice.value
    const binding = bindingSurcharge.value
    if (page === null && cover === null && binding === null) return null
    return (page ?? 0) + (cover ?? 0) + (binding ?? 0)
  })

  /** Estimated total (with 8% tax) — available once quantity is set and at least one cost is known */
  const estimatedTotal = computed((): number | null => {
    const { quantity } = quoteStore.quoteState
    if (estimatedPerCopy.value === null || !quantity) return null
    return Math.round(estimatedPerCopy.value * quantity * 1.08 * 100) / 100
  })

  /** True when at least one cost line is available to display */
  const hasAnyEstimate = computed(
    () => pageRatePerCopy.value !== null || coverBasePrice.value !== null || bindingSurcharge.value !== null,
  )

  /** True when all 8 required fields are filled (full API calc will take over) */
  const allFilled = computed(() => {
    const s = quoteStore.quoteState
    return !!(
      s.trimSizeId && s.coverStyleId && s.coverFinishId &&
      s.printTypeId && s.paperStockId && s.bindingTypeId &&
      s.pageCount && s.quantity
    )
  })

  return {
    pageRatePerCopy,
    coverBasePrice,
    bindingSurcharge,
    estimatedPerCopy,
    estimatedTotal,
    hasAnyEstimate,
    allFilled,
    ratesLoaded,
  }
}

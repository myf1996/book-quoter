import { ref, computed } from 'vue'
import { useQuoteStore } from '@/stores/quote.store'
import { api } from '@/utils/helpers.utils'

interface TrimMultiplierEntry { trimSizeId: string; pricingMultiplier: number }
interface PageRateEntry { printTypeId: string; paperStockId: string; ratePerPage: number }
interface CoverStyleRateEntry { coverStyleId: string; basePrice: number }
interface CoverFinishRateEntry { coverFinishId: string; addOnPrice: number }
interface BindingRateEntry { bindingTypeId: string; surcharge: number }

interface RatesResponse {
  trimSizeMultipliers: TrimMultiplierEntry[]
  pageRates: PageRateEntry[]
  coverStyleRates: CoverStyleRateEntry[]
  coverFinishRates: CoverFinishRateEntry[]
  bindingRates: BindingRateEntry[]
}

/**
 * Fetches all rate tables once and computes partial per-copy costs client-side.
 * Each cost line becomes available independently as the user selects options —
 * no need to wait for all fields before showing any estimate.
 */
export function usePartialPrice() {
  const quoteStore = useQuoteStore()

  const trimMultipliers = ref<TrimMultiplierEntry[]>([])
  const pageRates = ref<PageRateEntry[]>([])
  const coverStyleRates = ref<CoverStyleRateEntry[]>([])
  const coverFinishRates = ref<CoverFinishRateEntry[]>([])
  const bindingRates = ref<BindingRateEntry[]>([])
  const ratesLoaded = ref(false)

  async function loadRates(): Promise<void> {
    try {
      const { data } = await api.get<RatesResponse>('/products/rates')
      trimMultipliers.value = data.trimSizeMultipliers
      pageRates.value = data.pageRates
      coverStyleRates.value = data.coverStyleRates
      coverFinishRates.value = data.coverFinishRates
      bindingRates.value = data.bindingRates
      ratesLoaded.value = true
    } catch (err) {
      console.error('[usePartialPrice] Failed to load rates:', err)
    }
  }

  loadRates()

  /** Trim size multiplier for the selected trim (default 1.0 if not found) */
  const trimMultiplier = computed((): number => {
    const { trimSizeId } = quoteStore.quoteState
    if (!ratesLoaded.value || !trimSizeId) return 1
    const entry = trimMultipliers.value.find((t) => t.trimSizeId === trimSizeId)
    return entry?.pricingMultiplier ?? 1
  })

  /**
   * Effective $/page rate (with trim multiplier) — shown on Print Type row.
   * Available once both print type AND paper stock are selected.
   */
  const pageRatePerPage = computed((): number | null => {
    const { printTypeId, paperStockId } = quoteStore.quoteState
    if (!ratesLoaded.value || !printTypeId || !paperStockId) return null
    const entry = pageRates.value.find(
      (r) => r.printTypeId === printTypeId && r.paperStockId === paperStockId,
    )
    return entry != null ? Math.round(entry.ratePerPage * trimMultiplier.value * 10000) / 10000 : null
  })

  /** Total per-copy interior printing cost (rate × page count) */
  const pageRatePerCopy = computed((): number | null => {
    const { pageCount } = quoteStore.quoteState
    if (pageRatePerPage.value === null || !pageCount) return null
    return Math.round(pageRatePerPage.value * pageCount * 100) / 100
  })

  /** Per-copy cover style base price — shown on Cover Style row */
  const coverStylePrice = computed((): number | null => {
    const { coverStyleId } = quoteStore.quoteState
    if (!ratesLoaded.value || !coverStyleId) return null
    const entry = coverStyleRates.value.find((r) => r.coverStyleId === coverStyleId)
    return entry?.basePrice ?? null
  })

  /** Per-copy cover finish add-on price — shown on Cover Finish row */
  const coverFinishPrice = computed((): number | null => {
    const { coverFinishId } = quoteStore.quoteState
    if (!ratesLoaded.value || !coverFinishId) return null
    const entry = coverFinishRates.value.find((r) => r.coverFinishId === coverFinishId)
    return entry?.addOnPrice ?? null
  })

  /** Per-copy binding surcharge — shown on Binding row */
  const bindingSurcharge = computed((): number | null => {
    const { bindingTypeId } = quoteStore.quoteState
    if (!ratesLoaded.value || !bindingTypeId) return null
    const entry = bindingRates.value.find((r) => r.bindingTypeId === bindingTypeId)
    return entry?.surcharge ?? null
  })

  /** Sum of all known per-copy costs so far */
  const estimatedPerCopy = computed((): number | null => {
    const page = pageRatePerCopy.value
    const style = coverStylePrice.value
    const finish = coverFinishPrice.value
    const binding = bindingSurcharge.value
    if (page === null && style === null && finish === null && binding === null) return null
    return Math.round(((page ?? 0) + (style ?? 0) + (finish ?? 0) + (binding ?? 0)) * 100) / 100
  })

  /** Estimated total (with 8% tax) — available once quantity is set and at least one cost is known */
  const estimatedTotal = computed((): number | null => {
    const { quantity } = quoteStore.quoteState
    if (estimatedPerCopy.value === null || !quantity) return null
    return Math.round(estimatedPerCopy.value * quantity * 1.08 * 100) / 100
  })

  /** True when at least one cost line is available */
  const hasAnyEstimate = computed(
    () =>
      pageRatePerCopy.value !== null ||
      coverStylePrice.value !== null ||
      coverFinishPrice.value !== null ||
      bindingSurcharge.value !== null,
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
    trimMultiplier,
    pageRatePerPage,
    pageRatePerCopy,
    coverStylePrice,
    coverFinishPrice,
    bindingSurcharge,
    estimatedPerCopy,
    estimatedTotal,
    hasAnyEstimate,
    allFilled,
    ratesLoaded,
  }
}

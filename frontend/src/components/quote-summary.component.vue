<script setup lang="ts">
/**
 * QuoteSummary — right-panel display of all current selections plus live pricing.
 * Each selection row is clickable to navigate back to that step.
 * Includes production time / ship date and a coupon input section.
 */
import { ref, computed } from 'vue'
import { useQuoteStore } from '@/stores/quote.store'
import { useAuthStore } from '@/stores/auth.store'
import { useQuotePrice } from '@/composables/use-quote-price.composable'
import { usePartialPrice } from '@/composables/use-partial-price.composable'
import { api } from '@/utils/helpers.utils'

const quoteStore = useQuoteStore()
const authStore = useAuthStore()
const { priceBreakdown, isCalculating, priceError } = useQuotePrice()
const {
  pageRatePerCopy,
  coverBasePrice,
  bindingSurcharge,
  estimatedPerCopy,
  estimatedTotal,
  hasAnyEstimate,
  allFilled,
} = usePartialPrice()

interface LabelMap {
  [id: string]: string
}

const labels = ref<Record<string, LabelMap>>({
  trimSize: {},
  coverStyle: {},
  coverFinish: {},
  printType: {},
  paperStock: {},
  bindingType: {},
})

async function loadLabels(): Promise<void> {
  try {
    const [trimSizes, coverStyles, coverFinishes, printTypes, paperStocks, bindingTypes] =
      await Promise.all([
        api.get('/products/trim-sizes'),
        api.get('/products/cover-styles'),
        api.get('/products/cover-finishes'),
        api.get('/products/print-types'),
        api.get('/products/paper-stocks'),
        api.get('/products/binding-types'),
      ])

    const toMap = (items: { id: string; name: string }[]): LabelMap =>
      Object.fromEntries(items.map((i) => [i.id, i.name]))

    labels.value = {
      trimSize: toMap(trimSizes.data),
      coverStyle: toMap(coverStyles.data),
      coverFinish: toMap(coverFinishes.data),
      printType: toMap(printTypes.data),
      paperStock: toMap(paperStocks.data),
      bindingType: toMap(bindingTypes.data),
    }
  } catch (err) {
    console.error('Failed to load summary labels:', err)
  }
}

loadLabels()

const summaryRows = [
  { label: 'Trim Size',   key: 'trimSizeId'    as const, map: 'trimSize',   step: 1 },
  { label: 'Cover Style', key: 'coverStyleId'  as const, map: 'coverStyle', step: 2 },
  { label: 'Cover Finish',key: 'coverFinishId' as const, map: 'coverFinish',step: 3 },
  { label: 'Print Type',  key: 'printTypeId'   as const, map: 'printType',  step: 4 },
  { label: 'Paper Stock', key: 'paperStockId'  as const, map: 'paperStock', step: 5 },
  { label: 'Binding',     key: 'bindingTypeId' as const, map: 'bindingType',step: 6 },
]

// ─── Ship date ────────────────────────────────────────────────────────────────

const productionDaysMap: Record<string, number> = {
  standard: 10,
  expedited: 5,
  rush: 2,
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const dow = result.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return result
}

const estimatedShipDate = computed((): string => {
  const days = productionDaysMap[quoteStore.productionTime] ?? 10
  const ship = addBusinessDays(new Date(), days + 2)
  return ship.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
})

const productionLabel = computed((): string => {
  const map: Record<string, string> = { standard: 'Standard (10 days)', expedited: 'Expedited (5 days)', rush: 'Rush (2 days)' }
  return map[quoteStore.productionTime] ?? 'Standard (10 days)'
})

// ─── Coupon ────────────────────────────────────────────────────────────────────

const couponInput = ref('')
const couponLoading = ref(false)
const couponError = ref<string | null>(null)

const discountAmount = computed((): number => {
  if (!quoteStore.appliedCoupon || !priceBreakdown.value) return 0
  const { discountType, discountValue } = quoteStore.appliedCoupon
  const base = priceBreakdown.value.total
  if (discountType === 'percentage') {
    return Math.round((base * discountValue) / 100 * 100) / 100
  }
  return Math.min(discountValue, base)
})

const finalTotal = computed((): number => {
  if (!priceBreakdown.value) return 0
  return Math.round((priceBreakdown.value.total - discountAmount.value) * 100) / 100
})

async function applyCoupon(): Promise<void> {
  const code = couponInput.value.trim()
  if (!code) return
  couponLoading.value = true
  couponError.value = null
  try {
    const { data } = await api.post('/quoter/validate-coupon', { code })
    quoteStore.setAppliedCoupon(data)
    couponInput.value = ''
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    couponError.value = typeof msg === 'string' ? msg : 'Invalid or expired coupon code.'
    quoteStore.setAppliedCoupon(null)
  } finally {
    couponLoading.value = false
  }
}

function removeCoupon(): void {
  quoteStore.setAppliedCoupon(null)
  couponError.value = null
}

function formatPrice(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
</script>

<template>
  <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>

    <!-- Selections — each row navigates to its step on click -->
    <div class="space-y-1">
      <button
        v-for="row in summaryRows"
        :key="row.key"
        class="w-full flex items-center justify-between gap-2 text-sm py-1.5 px-2 rounded-lg -mx-2 transition-colors group"
        :class="quoteStore.quoteState[row.key]
          ? 'hover:bg-white cursor-pointer'
          : 'cursor-default'"
        :title="quoteStore.quoteState[row.key] ? `Edit ${row.label}` : ''"
        @click="quoteStore.quoteState[row.key] ? quoteStore.goToStep(row.step) : undefined"
      >
        <span class="text-gray-500 flex items-center gap-1 flex-shrink-0">
          {{ row.label }}
          <svg
            v-if="quoteStore.quoteState[row.key]"
            class="w-3 h-3 text-gray-300 group-hover:text-indigo-400 transition-colors"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"/>
          </svg>
        </span>
        <span
          v-if="quoteStore.quoteState[row.key]"
          class="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors text-right"
        >
          {{ labels[row.map][quoteStore.quoteState[row.key]!] }}
        </span>
        <span v-else class="text-gray-300 italic whitespace-nowrap">Not selected</span>
      </button>

      <!-- Page count row -->
      <button
        class="w-full flex items-center justify-between gap-2 text-sm py-1.5 px-2 rounded-lg -mx-2 transition-colors group"
        :class="quoteStore.quoteState.pageCount !== null ? 'hover:bg-white cursor-pointer' : 'cursor-default'"
        @click="quoteStore.quoteState.pageCount !== null ? quoteStore.goToStep(1) : undefined"
      >
        <span class="text-gray-500 flex items-center gap-1 flex-shrink-0">
          Pages
          <svg v-if="quoteStore.quoteState.pageCount !== null" class="w-3 h-3 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"/>
          </svg>
        </span>
        <span v-if="quoteStore.quoteState.pageCount !== null" class="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors text-right">
          {{ quoteStore.quoteState.pageCount }}
        </span>
        <span v-else class="text-gray-300 italic whitespace-nowrap">Not entered</span>
      </button>

      <!-- Quantity row -->
      <button
        class="w-full flex items-center justify-between gap-2 text-sm py-1.5 px-2 rounded-lg -mx-2 transition-colors group"
        :class="quoteStore.quoteState.quantity !== null ? 'hover:bg-white cursor-pointer' : 'cursor-default'"
        @click="quoteStore.quoteState.quantity !== null ? quoteStore.goToStep(7) : undefined"
      >
        <span class="text-gray-500 flex items-center gap-1 flex-shrink-0">
          Quantity
          <svg v-if="quoteStore.quoteState.quantity !== null" class="w-3 h-3 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"/>
          </svg>
        </span>
        <span v-if="quoteStore.quoteState.quantity !== null" class="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors text-right">
          {{ quoteStore.quoteState.quantity.toLocaleString() }}
        </span>
        <span v-else class="text-gray-300 italic whitespace-nowrap">Not selected</span>
      </button>

      <!-- Production time row (always shown after quantity step) -->
      <div v-if="quoteStore.quoteState.quantity !== null" class="border-t border-gray-100 pt-1 mt-1">
        <button
          class="w-full flex items-center justify-between gap-2 text-sm py-1.5 px-2 rounded-lg -mx-2 hover:bg-white transition-colors group cursor-pointer"
          @click="quoteStore.goToStep(7)"
        >
          <span class="text-gray-500 flex items-center gap-1 flex-shrink-0">
            Production
            <svg class="w-3 h-3 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"/>
            </svg>
          </span>
          <span class="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors text-right">{{ productionLabel }}</span>
        </button>

        <!-- Ship date banner -->
        <div class="mt-2 flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
          <svg class="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <div>
            <p class="text-xs text-indigo-500">Est. delivery</p>
            <p class="text-xs font-semibold text-indigo-800">{{ estimatedShipDate }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing section -->
    <div class="mt-6 pt-5 border-t border-gray-200">
      <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Price Breakdown</h4>

      <!-- Full breakdown — exact, from API, shown when all fields filled -->
      <template v-if="allFilled">
        <p v-if="isCalculating" class="text-sm text-indigo-500 animate-pulse">Calculating…</p>
        <p v-else-if="priceError" class="text-sm text-red-500">{{ priceError }}</p>
        <div v-else-if="priceBreakdown" class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">Page Printing</span>
            <span class="text-gray-800">{{ formatPrice(priceBreakdown.pageCost) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Cover</span>
            <span class="text-gray-800">{{ formatPrice(priceBreakdown.coverCost) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Binding</span>
            <span class="text-gray-800">{{ formatPrice(priceBreakdown.bindingCost) }}</span>
          </div>
          <div class="flex justify-between border-t border-gray-100 pt-2">
            <span class="text-gray-500">Subtotal</span>
            <span class="text-gray-800">{{ formatPrice(priceBreakdown.subtotal) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Tax (8%)</span>
            <span class="text-gray-800">{{ formatPrice(priceBreakdown.tax) }}</span>
          </div>
          <div v-if="quoteStore.appliedCoupon" class="flex justify-between text-green-600 font-medium">
            <span>
              Coupon ({{ quoteStore.appliedCoupon.code }})
              <button
                class="ml-1 text-green-400 hover:text-red-500 transition-colors text-xs"
                title="Remove coupon"
                @click="removeCoupon"
              >×</button>
            </span>
            <span>−{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-gray-300 font-semibold">
            <span class="text-gray-900">Total</span>
            <span class="text-indigo-700 text-base">{{ formatPrice(finalTotal) }}</span>
          </div>
          <p v-if="quoteStore.quoteState.quantity" class="text-xs text-gray-400 text-right">
            {{ formatPrice(finalTotal / quoteStore.quoteState.quantity) }} per copy
          </p>
        </div>
      </template>

      <!-- Partial estimate — live, client-side, shown while steps are in progress -->
      <template v-else-if="hasAnyEstimate">
        <div class="space-y-2 text-sm">
          <!-- Per-copy page cost -->
          <div v-if="pageRatePerCopy !== null" class="flex justify-between">
            <span class="text-gray-500">Page Printing</span>
            <span class="text-gray-700">{{ formatPrice(pageRatePerCopy) }} / copy</span>
          </div>
          <div v-else class="flex justify-between opacity-40">
            <span class="text-gray-400">Page Printing</span>
            <span class="text-gray-400 italic text-xs">select print type + paper</span>
          </div>

          <!-- Per-copy cover cost -->
          <div v-if="coverBasePrice !== null" class="flex justify-between">
            <span class="text-gray-500">Cover</span>
            <span class="text-gray-700">{{ formatPrice(coverBasePrice) }} / copy</span>
          </div>
          <div v-else class="flex justify-between opacity-40">
            <span class="text-gray-400">Cover</span>
            <span class="text-gray-400 italic text-xs">select style + finish</span>
          </div>

          <!-- Per-copy binding cost -->
          <div v-if="bindingSurcharge !== null" class="flex justify-between">
            <span class="text-gray-500">Binding</span>
            <span class="text-gray-700">{{ formatPrice(bindingSurcharge) }} / copy</span>
          </div>
          <div v-else class="flex justify-between opacity-40">
            <span class="text-gray-400">Binding</span>
            <span class="text-gray-400 italic text-xs">select binding type</span>
          </div>

          <!-- Running per-copy total -->
          <div v-if="estimatedPerCopy !== null" class="flex justify-between border-t border-gray-100 pt-2 font-medium">
            <span class="text-gray-600">Est. per copy</span>
            <span class="text-gray-800">~{{ formatPrice(estimatedPerCopy) }}</span>
          </div>

          <!-- Estimated total (qty × per-copy × tax) -->
          <div v-if="estimatedTotal !== null" class="flex justify-between font-semibold">
            <span class="text-gray-700">
              Est. total
              <span class="font-normal text-xs text-gray-400">({{ quoteStore.quoteState.quantity?.toLocaleString() }} copies + tax)</span>
            </span>
            <span class="text-indigo-600 text-base">~{{ formatPrice(estimatedTotal) }}</span>
          </div>
          <p v-else-if="estimatedPerCopy !== null" class="text-xs text-gray-400 italic text-right">
            Select quantity for total estimate
          </p>
        </div>

        <p class="text-xs text-gray-400 mt-3 text-center">
          ~ Estimate — exact price confirmed on last step
        </p>
      </template>

      <!-- Nothing selected yet -->
      <template v-else>
        <p class="text-xs text-gray-400 italic text-center py-2">
          Select options to see a live price estimate
        </p>
      </template>
    </div>

    <!-- Coupon input -->
    <div v-if="allFilled && priceBreakdown && !isCalculating" class="mt-5 pt-4 border-t border-gray-200">
      <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Coupon Code</h4>

      <div v-if="quoteStore.appliedCoupon" class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <svg class="h-4 w-4 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-sm text-green-700 font-medium flex-1">{{ quoteStore.appliedCoupon.code }} applied</span>
        <button class="text-xs text-green-500 hover:text-red-500 transition-colors" @click="removeCoupon">Remove</button>
      </div>

      <p v-else-if="!authStore.isAuthenticated" class="text-xs text-gray-400 italic">
        Sign in to apply a coupon.
      </p>

      <div v-else class="space-y-2">
        <div class="flex gap-2">
          <input
            v-model="couponInput"
            type="text"
            placeholder="Enter code"
            class="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-1.5 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :disabled="couponLoading"
            @keyup.enter="applyCoupon"
          />
          <button
            :disabled="couponLoading || !couponInput.trim()"
            class="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 whitespace-nowrap"
            @click="applyCoupon"
          >
            {{ couponLoading ? '…' : 'Apply' }}
          </button>
        </div>
        <p v-if="couponError" class="text-xs text-red-500">{{ couponError }}</p>
      </div>
    </div>
  </div>
</template>

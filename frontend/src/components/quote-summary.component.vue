<script setup lang="ts">
/**
 * QuoteSummary — right-panel display of all current selections plus live pricing.
 * Includes a coupon input section when all fields are filled and the user is signed in.
 */
import { ref, computed } from 'vue'
import { useQuoteStore } from '@/stores/quote.store'
import { useAuthStore } from '@/stores/auth.store'
import { useQuotePrice } from '@/composables/use-quote-price.composable'
import { api } from '@/utils/helpers.utils'

const quoteStore = useQuoteStore()
const authStore = useAuthStore()
const { priceBreakdown, isCalculating, priceError } = useQuotePrice()

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
  { label: 'Trim Size', key: 'trimSizeId' as const, map: 'trimSize' },
  { label: 'Cover Style', key: 'coverStyleId' as const, map: 'coverStyle' },
  { label: 'Cover Finish', key: 'coverFinishId' as const, map: 'coverFinish' },
  { label: 'Print Type', key: 'printTypeId' as const, map: 'printType' },
  { label: 'Paper Stock', key: 'paperStockId' as const, map: 'paperStock' },
  { label: 'Binding', key: 'bindingTypeId' as const, map: 'bindingType' },
]

// ─── Coupon ────────────────────────────────────────────────────────────────────

const couponInput = ref('')
const couponLoading = ref(false)
const couponError = ref<string | null>(null)

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

/** Format a number as a USD price string */
function formatPrice(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
</script>

<template>
  <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>

    <!-- Selections -->
    <div class="space-y-3">
      <div
        v-for="row in summaryRows"
        :key="row.key"
        class="flex justify-between text-sm"
      >
        <span class="text-gray-500">{{ row.label }}</span>
        <span
          v-if="quoteStore.quoteState[row.key]"
          class="font-medium text-gray-900"
        >
          {{ labels[row.map][quoteStore.quoteState[row.key]!] }}
        </span>
        <span v-else class="text-gray-300 italic">Not selected</span>
      </div>

      <!-- Page count row -->
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Pages</span>
        <span v-if="quoteStore.quoteState.pageCount !== null" class="font-medium text-gray-900">
          {{ quoteStore.quoteState.pageCount }}
        </span>
        <span v-else class="text-gray-300 italic">Not entered</span>
      </div>

      <!-- Quantity row -->
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Quantity</span>
        <span v-if="quoteStore.quoteState.quantity !== null" class="font-medium text-gray-900">
          {{ quoteStore.quoteState.quantity.toLocaleString() }}
        </span>
        <span v-else class="text-gray-300 italic">Not selected</span>
      </div>
    </div>

    <!-- Pricing section -->
    <div class="mt-6 pt-5 border-t border-gray-200">
      <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Price Breakdown</h4>

      <!-- Loading -->
      <p v-if="isCalculating" class="text-sm text-indigo-500 animate-pulse">Calculating…</p>

      <!-- Error -->
      <p v-else-if="priceError" class="text-sm text-red-500">{{ priceError }}</p>

      <!-- Incomplete -->
      <p v-else-if="!allFieldsFilled()" class="text-xs text-gray-400 italic text-center">
        Complete all steps to see price
      </p>

      <!-- Breakdown -->
      <div v-else-if="priceBreakdown" class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">Page Cost</span>
          <span class="text-gray-800">{{ formatPrice(priceBreakdown.pageCost) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Cover Cost</span>
          <span class="text-gray-800">{{ formatPrice(priceBreakdown.coverCost) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Binding Cost</span>
          <span class="text-gray-800">{{ formatPrice(priceBreakdown.bindingCost) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Subtotal</span>
          <span class="text-gray-800">{{ formatPrice(priceBreakdown.subtotal) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Tax (8%)</span>
          <span class="text-gray-800">{{ formatPrice(priceBreakdown.tax) }}</span>
        </div>

        <!-- Coupon discount line -->
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
      </div>
    </div>

    <!-- Coupon input — only when price is showing and user is signed in -->
    <div v-if="allFieldsFilled() && priceBreakdown && !isCalculating" class="mt-5 pt-4 border-t border-gray-200">
      <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Coupon Code</h4>

      <!-- Applied state -->
      <div v-if="quoteStore.appliedCoupon" class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <svg class="h-4 w-4 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-sm text-green-700 font-medium flex-1">{{ quoteStore.appliedCoupon.code }} applied</span>
        <button class="text-xs text-green-500 hover:text-red-500 transition-colors" @click="removeCoupon">Remove</button>
      </div>

      <!-- Not signed in -->
      <p v-else-if="!authStore.isAuthenticated" class="text-xs text-gray-400 italic">
        Sign in to apply a coupon.
      </p>

      <!-- Input -->
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

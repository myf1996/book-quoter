<script setup lang="ts">
/**
 * QuoteSummary — right-panel display of all current selections plus live pricing.
 * Pricing is fetched automatically once all 8 fields are filled.
 */
import { useQuoteStore } from '@/stores/quote.store'
import { useQuotePrice } from '@/composables/use-quote-price.composable'
import { api } from '@/utils/helpers.utils'
import { ref } from 'vue'

const quoteStore = useQuoteStore()
const { priceBreakdown, isCalculating, priceError } = useQuotePrice()

interface LabelMap {
  [id: number]: string
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

    const toMap = (items: { id: number; name: string }[]): LabelMap =>
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

/** Format a number as a USD price string */
function formatPrice(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

/** Returns true when all 8 fields are filled */
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
        <div class="flex justify-between pt-2 border-t border-gray-300 font-semibold">
          <span class="text-gray-900">Total</span>
          <span class="text-indigo-700 text-base">{{ formatPrice(priceBreakdown.total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

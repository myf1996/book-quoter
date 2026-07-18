<script setup lang="ts">
/**
 * QuoteSummary — right-panel display of all current selections.
 * Pricing is not shown in Phase 1.
 */
import { useQuoteStore } from '@/stores/quote.store'
import { api } from '@/utils/helpers.utils'
import { ref, watch } from 'vue'

const quoteStore = useQuoteStore()

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
</script>

<template>
  <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>
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
    </div>
    <p class="mt-6 text-xs text-gray-400 text-center">Pricing available in Phase 2</p>
  </div>
</template>

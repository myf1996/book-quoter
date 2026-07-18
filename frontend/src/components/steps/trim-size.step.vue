<script setup lang="ts">
/**
 * TrimSizeStep — Step 1: user selects a book trim size and enters page count
 */
import { computed, watch } from 'vue'
import { useProductOptions } from '@/composables/use-quote-state.composable'
import { useQuoteStore } from '@/stores/quote.store'

const quoteStore = useQuoteStore()
const { options, isLoading, error } = useProductOptions('/products/trim-sizes')

/** The currently selected trim size option (for min/max page lookup) */
const selectedOption = computed(() =>
  options.value.find((o) => o.id === quoteStore.quoteState.trimSizeId) ?? null,
)

const minPages = computed(() =>
  typeof selectedOption.value?.minPages === 'number' ? (selectedOption.value.minPages as number) : 24,
)
const maxPages = computed(() =>
  typeof selectedOption.value?.maxPages === 'number' ? (selectedOption.value.maxPages as number) : 840,
)

const pageCountValue = computed(() => quoteStore.quoteState.pageCount)

const pageCountOutOfRange = computed(() => {
  const pc = pageCountValue.value
  if (pc === null) return false
  return pc < minPages.value || pc > maxPages.value
})

/** When the selected trim size changes, sync bounds into the store and clear any invalid page count */
watch(selectedOption, (next) => {
  if (next) {
    const min = typeof next.minPages === 'number' ? (next.minPages as number) : 24
    const max = typeof next.maxPages === 'number' ? (next.maxPages as number) : 840
    quoteStore.setPageCountBounds({ minPages: min, maxPages: max })
    // Reset page count if it falls outside the new size's range
    const pc = quoteStore.quoteState.pageCount
    if (pc !== null && (pc < min || pc > max)) {
      quoteStore.updateQuoteState({ pageCount: null })
    }
  }
})

function onPageCountInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value
  const parsed = parseInt(raw, 10)
  quoteStore.updateQuoteState({ pageCount: isNaN(parsed) ? null : parsed })
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-1">Select Trim Size</h2>
    <p class="text-sm text-gray-500 mb-6">Choose the dimensions for your book.</p>

    <div v-if="isLoading" class="text-gray-400 text-sm">Loading options…</div>
    <p v-else-if="error" class="text-red-500 text-sm">{{ error }}</p>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="option in options"
        :key="option.id"
        class="p-4 border-2 rounded-lg text-left transition-all"
        :class="quoteStore.quoteState.trimSizeId === option.id
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-300'"
        @click="quoteStore.updateQuoteState({ trimSizeId: option.id })"
      >
        <p class="font-medium text-gray-900">{{ option.name }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ option.width }}" × {{ option.height }}"</p>
      </button>
    </div>

    <!-- Page count input — shown only after a trim size is selected -->
    <div v-if="quoteStore.quoteState.trimSizeId !== null" class="mt-6">
      <label class="block text-sm font-medium text-gray-700 mb-1" for="page-count">
        Number of Pages
      </label>
      <input
        id="page-count"
        type="number"
        class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all"
        :class="pageCountOutOfRange
          ? 'border-red-400 focus:ring-red-300'
          : 'border-gray-300 focus:ring-indigo-300'"
        :min="minPages"
        :max="maxPages"
        :value="quoteStore.quoteState.pageCount ?? ''"
        placeholder="e.g. 200"
        @input="onPageCountInput"
      />
      <p class="mt-1 text-xs text-gray-400">
        Min {{ minPages }} – Max {{ maxPages }} pages for this size
      </p>
      <p v-if="pageCountOutOfRange" class="mt-1 text-xs text-red-500">
        Page count must be between {{ minPages }} and {{ maxPages }}.
      </p>
    </div>
  </div>
</template>

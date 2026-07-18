<script setup lang="ts">
/**
 * PrintTypeStep — Step 4: user selects print type
 */
import { useProductOptions } from '@/composables/use-quote-state.composable'
import { useQuoteStore } from '@/stores/quote.store'

const quoteStore = useQuoteStore()
const { options, isLoading, error } = useProductOptions('/products/print-types')
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-1">Select Print Type</h2>
    <p class="text-sm text-gray-500 mb-6">Choose between black & white or full color printing.</p>

    <div v-if="isLoading" class="text-gray-400 text-sm">Loading options…</div>
    <p v-else-if="error" class="text-red-500 text-sm">{{ error }}</p>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="option in options"
        :key="option.id"
        class="p-4 border-2 rounded-lg text-left transition-all"
        :class="quoteStore.quoteState.printTypeId === option.id
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-300'"
        @click="quoteStore.updateQuoteState({ printTypeId: option.id })"
      >
        <p class="font-medium text-gray-900">{{ option.name }}</p>
      </button>
    </div>
  </div>
</template>

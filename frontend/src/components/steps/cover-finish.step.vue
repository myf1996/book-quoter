<script setup lang="ts">
/**
 * CoverFinishStep — Step 3: user selects a cover finish
 */
import { useProductOptions } from '@/composables/use-quote-state.composable'
import { useQuoteStore } from '@/stores/quote.store'

const quoteStore = useQuoteStore()
const { options, isLoading, error } = useProductOptions('/products/cover-finishes')
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-1">Select Cover Finish</h2>
    <p class="text-sm text-gray-500 mb-6">Choose the surface finish for your cover.</p>

    <div v-if="isLoading" class="text-gray-400 text-sm">Loading options…</div>
    <p v-else-if="error" class="text-red-500 text-sm">{{ error }}</p>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="option in options"
        :key="option.id"
        class="p-4 border-2 rounded-lg text-left transition-all"
        :class="quoteStore.quoteState.coverFinishId === option.id
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-300'"
        @click="quoteStore.updateQuoteState({ coverFinishId: option.id })"
      >
        <p class="font-medium text-gray-900">{{ option.name }}</p>
      </button>
    </div>
  </div>
</template>

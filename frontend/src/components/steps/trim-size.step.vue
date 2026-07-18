<script setup lang="ts">
/**
 * TrimSizeStep — Step 1: user selects a book trim size
 */
import { useProductOptions } from '@/composables/use-quote-state.composable'
import { useQuoteStore } from '@/stores/quote.store'

const quoteStore = useQuoteStore()
const { options, isLoading, error } = useProductOptions('/products/trim-sizes')
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
  </div>
</template>

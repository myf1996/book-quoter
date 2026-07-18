<script setup lang="ts">
/**
 * QuantityStep — Step 7: user selects the print run quantity
 */
import { useQuoteStore } from '@/stores/quote.store'

const quoteStore = useQuoteStore()

const quantityOptions: number[] = [25, 50, 100, 250, 500, 1000]
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-1">Select Quantity</h2>
    <p class="text-sm text-gray-500 mb-6">How many copies do you need?</p>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <button
        v-for="qty in quantityOptions"
        :key="qty"
        class="p-4 border-2 rounded-lg text-center font-semibold transition-all"
        :class="quoteStore.quoteState.quantity === qty
          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
          : 'border-gray-200 text-gray-800 hover:border-indigo-300'"
        @click="quoteStore.updateQuoteState({ quantity: qty })"
      >
        {{ qty.toLocaleString() }}
      </button>
    </div>
  </div>
</template>

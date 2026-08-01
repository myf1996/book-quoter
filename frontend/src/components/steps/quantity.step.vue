<script setup lang="ts">
/**
 * QuantityStep — Step 7: user selects print run quantity and production time
 */
import { computed, ref } from 'vue'
import { useQuoteStore } from '@/stores/quote.store'
import type { ProductionTime } from '@/stores/quote.store'

const quoteStore = useQuoteStore()

const quantityOptions: number[] = [25, 50, 100, 250, 500, 1000]

const customQty = ref('')

function selectPreset(qty: number): void {
  customQty.value = ''
  quoteStore.updateQuoteState({ quantity: qty })
}

function onCustomQtyInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value
  customQty.value = raw
  if (!raw) return
  const parsed = parseInt(raw, 10)
  if (!isNaN(parsed) && parsed >= 1) {
    quoteStore.updateQuoteState({ quantity: parsed })
  }
}

function isPresetActive(qty: number): boolean {
  return quoteStore.quoteState.quantity === qty && customQty.value === ''
}

interface ProductionOption {
  value: ProductionTime
  label: string
  days: number
  description: string
  badge?: string
}

const productionOptions: ProductionOption[] = [
  { value: 'standard',  label: 'Standard',  days: 10, description: '10 business days' },
  { value: 'expedited', label: 'Expedited', days: 5,  description: '5 business days', badge: 'Popular' },
  { value: 'rush',      label: 'Rush',      days: 2,  description: '2 business days',  badge: 'Fastest' },
]

/** Add business days to today, skipping weekends */
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
  const option = productionOptions.find((o) => o.value === quoteStore.productionTime)
  const days = option?.days ?? 10
  const ship = addBusinessDays(new Date(), days + 2) // +2 for transit
  return ship.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
})

const productionDays = computed((): number =>
  productionOptions.find((o) => o.value === quoteStore.productionTime)?.days ?? 10
)
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-1">Select Quantity</h2>
    <p class="text-sm text-gray-500 mb-6">How many copies do you need?</p>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <button
        v-for="qty in quantityOptions"
        :key="qty"
        class="p-4 border-2 rounded-xl text-center font-semibold transition-all"
        :class="isPresetActive(qty)
          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
          : 'border-gray-200 text-gray-800 hover:border-indigo-300 bg-white'"
        @click="selectPreset(qty)"
      >
        <span class="block text-lg">{{ qty.toLocaleString() }}</span>
        <span class="text-xs font-normal text-gray-400 mt-0.5 block">copies</span>
      </button>
    </div>

    <!-- Custom quantity -->
    <div class="mt-4">
      <label class="block text-sm font-medium text-gray-700 mb-1.5" for="custom-qty">
        Or enter a custom quantity
      </label>
      <div class="flex items-center gap-2">
        <input
          id="custom-qty"
          type="number"
          min="1"
          placeholder="e.g. 175"
          :value="customQty"
          class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all"
          :class="customQty && quoteStore.quoteState.quantity && !quantityOptions.includes(quoteStore.quoteState.quantity)
            ? 'border-indigo-500 ring-2 ring-indigo-200'
            : 'border-gray-300 focus:ring-indigo-300'"
          @input="onCustomQtyInput"
        />
        <span class="text-sm text-gray-500 whitespace-nowrap">copies</span>
      </div>
    </div>

    <div class="mb-8" />

    <!-- Production Time -->
    <div class="border-t border-gray-100 pt-6">
      <h3 class="text-base font-semibold text-gray-900 mb-1">Production Time</h3>
      <p class="text-sm text-gray-500 mb-4">How quickly do you need your order?</p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          v-for="prod in productionOptions"
          :key="prod.value"
          class="relative p-4 border-2 rounded-xl text-left transition-all"
          :class="quoteStore.productionTime === prod.value
            ? 'border-indigo-600 bg-indigo-50'
            : 'border-gray-200 hover:border-indigo-300 bg-white'"
          @click="quoteStore.setProductionTime(prod.value)"
        >
          <span
            v-if="prod.badge"
            class="absolute top-2 right-2 text-xs font-medium px-1.5 py-0.5 rounded-full"
            :class="prod.value === 'rush' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'"
          >{{ prod.badge }}</span>
          <p class="font-semibold text-gray-900 text-sm">{{ prod.label }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ prod.description }}</p>
        </button>
      </div>

      <!-- Estimated ship date -->
      <div class="mt-4 flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
        <svg class="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <div>
          <p class="text-xs text-indigo-600 font-medium">Estimated delivery</p>
          <p class="text-sm font-semibold text-indigo-900">{{ estimatedShipDate }}</p>
          <p class="text-xs text-indigo-500">{{ productionDays }} business days production + 2 days shipping</p>
        </div>
      </div>
    </div>
  </div>
</template>

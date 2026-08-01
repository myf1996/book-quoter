<script setup lang="ts">
/**
 * TrimSizeStep — Step 1: user selects a book trim size and enters page count
 */
import { computed, ref, watch } from 'vue'
import { useProductOptions } from '@/composables/use-quote-state.composable'
import { useQuoteStore } from '@/stores/quote.store'
import OptionInfoModal from '@/components/option-info-modal.component.vue'

const quoteStore = useQuoteStore()
const { options, isLoading, error } = useProductOptions('/products/trim-sizes')

const activeModal = ref<string | null>(null)

const optionMeta: Record<string, { description: string; tooltip: string }> = {
  'Digest': {
    description: 'Most popular format for novels & fiction',
    tooltip: 'Classic mass-market paperback size. Fits comfortably in hand and on standard bookshelves. The go-to format for fiction, genre novels, and most popular paperbacks.',
  },
  'Digest 5.5×8.5': {
    description: 'Most popular format for novels & fiction',
    tooltip: 'Classic mass-market paperback size. Fits comfortably in hand and on standard bookshelves. The go-to format for fiction, genre novels, and most popular paperbacks.',
  },
  'Trade Paperback': {
    description: 'Standard trade format for non-fiction',
    tooltip: 'The most common size for trade paperbacks, memoirs, and non-fiction titles. Used by most major publishers — recognized and expected by readers of serious non-fiction.',
  },
  'Trade 6×9': {
    description: 'Standard trade format for non-fiction',
    tooltip: 'The most common size for trade paperbacks, memoirs, and non-fiction titles. Used by most major publishers — recognized and expected by readers of serious non-fiction.',
  },
  '8x10': {
    description: 'Great for workbooks & illustrated guides',
    tooltip: 'Large format ideal for workbooks, manuals, and content with wide tables or diagrams. Maximizes page real estate for visual or data-heavy content.',
  },
  'Large 8.5×11': {
    description: 'Great for workbooks & illustrated guides',
    tooltip: 'Full letter-size format — ideal for workbooks, manuals, and content with wide tables or diagrams. Maximizes page real estate for visual or data-heavy content.',
  },
  'Hardcover': {
    description: 'Premium rigid cover — gifts & keepsakes',
    tooltip: 'Rigid hardcover board gives a durable, premium finish. Perfect for gift books, special editions, and content meant to last generations.',
  },
  'Hardcover 6×9': {
    description: 'Premium rigid cover — gifts & keepsakes',
    tooltip: 'Same footprint as Trade but with a rigid hardcover board for a durable, premium finish. Perfect for gift books, special editions, and content meant to last generations.',
  },
  'Square': {
    description: 'Unique format for photo books & children\'s',
    tooltip: 'Eye-catching square format perfect for photo collections, children\'s books, and coffee table books. Stands out on any shelf and gives images the space they deserve.',
  },
  'Square 8×8': {
    description: 'Unique format for photo books & children\'s',
    tooltip: 'Eye-catching square format perfect for photo collections, children\'s books, and coffee table books. Stands out on any shelf and gives images the space they deserve.',
  },
}

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

watch(selectedOption, (next) => {
  if (next) {
    const min = typeof next.minPages === 'number' ? (next.minPages as number) : 24
    const max = typeof next.maxPages === 'number' ? (next.maxPages as number) : 840
    quoteStore.setPageCountBounds({ minPages: min, maxPages: max })
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

function pageStyle(width: unknown, height: unknown): Record<string, string> {
  const w = width != null ? parseFloat(String(width)) : 6
  const h = height != null ? parseFloat(String(height)) : 9
  const safeW = isNaN(w) ? 6 : w
  const safeH = isNaN(h) ? 9 : h
  const scale = Math.min(44 / safeW, 52 / safeH)
  return {
    width: `${Math.round(safeW * scale)}px`,
    height: `${Math.round(safeH * scale)}px`,
  }
}

const modalMeta = computed(() =>
  activeModal.value ? (optionMeta[activeModal.value] ?? null) : null
)
const modalOption = computed(() =>
  activeModal.value ? options.value.find(o => o.name === activeModal.value) ?? null : null
)
const modalDescription = computed((): string => {
  if (modalMeta.value?.tooltip) return modalMeta.value.tooltip
  const o = modalOption.value
  if (!o) return ''
  const w = o.width != null ? o.width : '?'
  const h = o.height != null ? o.height : '?'
  const min = o.minPages != null ? o.minPages : 24
  const max = o.maxPages != null ? o.maxPages : 840
  return `${w}" × ${h}" — Min ${min}, Max ${max} pages`
})

const modalPricingMultiplier = computed((): number => {
  const raw = modalOption.value?.pricingMultiplier
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') return parseFloat(raw)
  return 1
})
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
        class="p-4 border-2 rounded-xl text-left transition-all"
        :class="quoteStore.quoteState.trimSizeId === option.id
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-300 bg-white'"
        @click="quoteStore.updateQuoteState({ trimSizeId: option.id })"
      >
        <!-- Proportional page preview -->
        <div class="flex items-end justify-start mb-3 h-14">
          <div
            class="border-2 rounded-sm transition-colors flex items-center justify-center"
            :class="quoteStore.quoteState.trimSizeId === option.id
              ? 'border-indigo-400 bg-indigo-100'
              : 'border-gray-300 bg-gray-50'"
            :style="pageStyle(option.width, option.height)"
          />
        </div>

        <div class="flex items-start justify-between gap-1">
          <div>
            <p class="font-semibold text-gray-900 text-sm">{{ option.name }}</p>
            <p v-if="optionMeta[option.name]?.description" class="text-xs text-gray-500 mt-0.5">
              {{ optionMeta[option.name].description }}
            </p>
          </div>
          <button
            class="flex-shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
            @click.stop="activeModal = option.name"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2"/>
              <path d="M12 16v-4M12 8h.01" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <p class="text-xs text-gray-400 mt-1">{{ option.width }}" × {{ option.height }}"</p>
      </button>
    </div>

    <!-- Page count input -->
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

    <!-- Info modal -->
    <OptionInfoModal
      :open="activeModal !== null"
      :title="activeModal ?? ''"
      :description="modalDescription"
      @close="activeModal = null"
    >
      <template #icon>
        <div v-if="modalOption" class="flex flex-col items-center gap-1">
          <svg
            :width="Math.round((modalOption.width != null ? parseFloat(String(modalOption.width)) : 6) * 14)"
            :height="Math.round((modalOption.height != null ? parseFloat(String(modalOption.height)) : 9) * 14)"
            :viewBox="`0 0 ${Math.round((modalOption.width != null ? parseFloat(String(modalOption.width)) : 6) * 14)} ${Math.round((modalOption.height != null ? parseFloat(String(modalOption.height)) : 9) * 14)}`"
            style="max-width: 110px; max-height: 140px;"
          >
            <rect x="0" y="0" :width="Math.round((modalOption.width != null ? parseFloat(String(modalOption.width)) : 6) * 14)" :height="Math.round((modalOption.height != null ? parseFloat(String(modalOption.height)) : 9) * 14)" rx="2" fill="#e0e7ff" stroke="#818cf8" stroke-width="2"/>
            <rect x="0" y="0" width="8" :height="Math.round((modalOption.height != null ? parseFloat(String(modalOption.height)) : 9) * 14)" rx="2" fill="#818cf8" opacity="0.6"/>
            <rect x="13" y="16" :width="Math.max(10, Math.round((modalOption.width != null ? parseFloat(String(modalOption.width)) : 6) * 14) - 20)" height="3" rx="1" fill="#a5b4fc" opacity="0.7"/>
            <rect x="13" y="24" :width="Math.max(10, Math.round((modalOption.width != null ? parseFloat(String(modalOption.width)) : 6) * 14) - 24)" height="2" rx="1" fill="#c7d2fe"/>
            <rect x="13" y="30" :width="Math.max(10, Math.round((modalOption.width != null ? parseFloat(String(modalOption.width)) : 6) * 14) - 20)" height="2" rx="1" fill="#c7d2fe"/>
            <rect x="13" y="36" :width="Math.max(10, Math.round((modalOption.width != null ? parseFloat(String(modalOption.width)) : 6) * 14) - 22)" height="2" rx="1" fill="#c7d2fe"/>
          </svg>
          <p class="text-xs font-semibold text-indigo-600">
            {{ modalOption.width }}" × {{ modalOption.height }}"
          </p>
        </div>
        <div v-else class="w-20 h-28 bg-indigo-100 border-2 border-indigo-300 rounded"/>
      </template>

      <template v-if="modalOption" #extra>
        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="bg-gray-50 rounded-lg p-2.5">
            <p class="text-xs text-gray-400 mb-0.5">Width</p>
            <p class="text-sm font-semibold text-gray-900">{{ modalOption.width }}"</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-2.5">
            <p class="text-xs text-gray-400 mb-0.5">Height</p>
            <p class="text-sm font-semibold text-gray-900">{{ modalOption.height }}"</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-2.5">
            <p class="text-xs text-gray-400 mb-0.5">Min pages</p>
            <p class="text-sm font-semibold text-gray-900">{{ modalOption.minPages ?? 24 }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-2.5">
            <p class="text-xs text-gray-400 mb-0.5">Max pages</p>
            <p class="text-sm font-semibold text-gray-900">{{ modalOption.maxPages ?? 840 }}</p>
          </div>
          <div class="col-span-2 rounded-lg p-2.5"
            :class="modalPricingMultiplier === 1 ? 'bg-gray-50' : modalPricingMultiplier < 1 ? 'bg-green-50' : 'bg-amber-50'"
          >
            <p class="text-xs text-gray-400 mb-0.5">Pricing multiplier</p>
            <p class="text-sm font-semibold"
              :class="modalPricingMultiplier === 1 ? 'text-gray-700' : modalPricingMultiplier < 1 ? 'text-green-700' : 'text-amber-700'"
            >{{ modalPricingMultiplier }}×</p>
            <p class="text-xs text-gray-400 mt-0.5">Multiplied against your print type's per-page rate (steps 4 &amp; 5)</p>
          </div>
        </div>
      </template>
    </OptionInfoModal>
  </div>
</template>

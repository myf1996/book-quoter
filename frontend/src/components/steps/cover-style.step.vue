<script setup lang="ts">
/**
 * CoverStyleStep — Step 2: user selects a cover style
 */
import { computed, ref } from 'vue'
import { useProductOptions } from '@/composables/use-quote-state.composable'
import { useQuoteStore } from '@/stores/quote.store'
import OptionInfoModal from '@/components/option-info-modal.component.vue'

const quoteStore = useQuoteStore()
const { options, isLoading, error } = useProductOptions('/products/cover-styles')

const activeModal = ref<string | null>(null)

const optionMeta: Record<string, { description: string; tooltip: string; icon: string }> = {
  'Softcover': {
    description: 'Flexible paper cover — lightweight & affordable',
    tooltip: 'The most popular choice. A paper cover is glued to the spine. Lightweight and cost-effective for most print runs. Ideal for novels, workbooks, and any book you want to keep affordable.',
    icon: 'softcover',
  },
  'Hardcover': {
    description: 'Rigid board cover — durable & premium',
    tooltip: 'Thick, rigid boards wrapped in printed material. Highly durable and gives a premium feel. Great for reference books, gifts, and editions meant to last for years.',
    icon: 'hardcover',
  },
  'Dust Jacket': {
    description: 'Printed paper wrap over a hardcover',
    tooltip: 'A removable full-color paper sleeve over a hardcover board. The classic bookstore look used by most major publishers. Allows a striking cover design separate from the board underneath.',
    icon: 'dustjacket',
  },
}

const selectedIsActive = (id: string) => quoteStore.quoteState.coverStyleId === id

const modalMeta = computed(() =>
  activeModal.value ? (optionMeta[activeModal.value] ?? null) : null
)
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-1">Select Cover Style</h2>
    <p class="text-sm text-gray-500 mb-6">Choose how your book cover is constructed.</p>

    <div v-if="isLoading" class="text-gray-400 text-sm">Loading options…</div>
    <p v-else-if="error" class="text-red-500 text-sm">{{ error }}</p>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="option in options"
        :key="option.id"
        class="p-4 border-2 rounded-xl text-left transition-all"
        :class="selectedIsActive(option.id)
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-300 bg-white'"
        @click="quoteStore.updateQuoteState({ coverStyleId: option.id })"
      >
        <!-- Book icon -->
        <div class="mb-3 h-12 flex items-center">
          <template v-if="optionMeta[option.name]?.icon === 'softcover'">
            <svg width="40" height="48" viewBox="0 0 40 48" fill="none" class="opacity-80">
              <rect x="4" y="2" width="32" height="44" rx="1" :fill="selectedIsActive(option.id) ? '#c7d2fe' : '#e5e7eb'" stroke="#6b7280" stroke-width="1.5"/>
              <rect x="4" y="2" width="5" height="44" :fill="selectedIsActive(option.id) ? '#818cf8' : '#9ca3af'"/>
              <line x1="12" y1="10" x2="32" y2="10" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="12" y1="15" x2="32" y2="15" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="12" y1="20" x2="28" y2="20" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </template>
          <template v-else-if="optionMeta[option.name]?.icon === 'hardcover'">
            <svg width="40" height="48" viewBox="0 0 40 48" fill="none" class="opacity-80">
              <rect x="2" y="1" width="36" height="46" rx="1" :fill="selectedIsActive(option.id) ? '#818cf8' : '#6b7280'" stroke="#374151" stroke-width="2"/>
              <rect x="6" y="4" width="28" height="40" rx="1" :fill="selectedIsActive(option.id) ? '#c7d2fe' : '#e5e7eb'"/>
              <rect x="6" y="4" width="4" height="40" :fill="selectedIsActive(option.id) ? '#818cf8' : '#9ca3af'"/>
              <line x1="13" y1="12" x2="30" y2="12" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="13" y1="17" x2="30" y2="17" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="13" y1="22" x2="26" y2="22" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </template>
          <template v-else>
            <svg width="44" height="48" viewBox="0 0 44 48" fill="none" class="opacity-80">
              <rect x="4" y="1" width="36" height="46" rx="1" :fill="selectedIsActive(option.id) ? '#818cf8' : '#6b7280'" stroke="#374151" stroke-width="2"/>
              <rect x="8" y="4" width="28" height="40" rx="1" :fill="selectedIsActive(option.id) ? '#c7d2fe' : '#e5e7eb'"/>
              <path d="M8 4 L2 8 L2 40 L8 44" :fill="selectedIsActive(option.id) ? '#a5b4fc' : '#d1d5db'" stroke="#6b7280" stroke-width="1"/>
              <path d="M36 4 L42 8 L42 40 L36 44" :fill="selectedIsActive(option.id) ? '#a5b4fc' : '#d1d5db'" stroke="#6b7280" stroke-width="1"/>
              <rect x="9" y="4" width="4" height="40" :fill="selectedIsActive(option.id) ? '#818cf8' : '#9ca3af'"/>
            </svg>
          </template>
        </div>

        <div class="flex items-start justify-between gap-1">
          <div>
            <p class="font-semibold text-gray-900 text-sm">{{ option.name }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ optionMeta[option.name]?.description }}</p>
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
      </button>
    </div>

    <!-- Info modal -->
    <OptionInfoModal
      :open="activeModal !== null"
      :title="activeModal ?? ''"
      :description="modalMeta?.tooltip ?? ''"
      @close="activeModal = null"
    >
      <template #icon>
        <!-- Softcover large -->
        <svg v-if="modalMeta?.icon === 'softcover'" width="90" height="110" viewBox="0 0 40 48" fill="none">
          <rect x="4" y="2" width="32" height="44" rx="1" fill="#c7d2fe" stroke="#6b7280" stroke-width="1.5"/>
          <rect x="4" y="2" width="5" height="44" fill="#818cf8"/>
          <line x1="12" y1="10" x2="32" y2="10" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="12" y1="15" x2="32" y2="15" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="12" y1="20" x2="28" y2="20" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="12" y1="25" x2="32" y2="25" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="12" y1="30" x2="30" y2="30" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <!-- Hardcover large -->
        <svg v-else-if="modalMeta?.icon === 'hardcover'" width="90" height="110" viewBox="0 0 40 48" fill="none">
          <rect x="2" y="1" width="36" height="46" rx="1" fill="#818cf8" stroke="#374151" stroke-width="2"/>
          <rect x="6" y="4" width="28" height="40" rx="1" fill="#c7d2fe"/>
          <rect x="6" y="4" width="4" height="40" fill="#6366f1"/>
          <line x1="13" y1="12" x2="30" y2="12" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="13" y1="17" x2="30" y2="17" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="13" y1="22" x2="26" y2="22" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="13" y1="27" x2="30" y2="27" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <!-- Dust Jacket large -->
        <svg v-else width="100" height="110" viewBox="0 0 44 48" fill="none">
          <rect x="4" y="1" width="36" height="46" rx="1" fill="#818cf8" stroke="#374151" stroke-width="2"/>
          <rect x="8" y="4" width="28" height="40" rx="1" fill="#c7d2fe"/>
          <path d="M8 4 L2 8 L2 40 L8 44" fill="#a5b4fc" stroke="#6b7280" stroke-width="1"/>
          <path d="M36 4 L42 8 L42 40 L36 44" fill="#a5b4fc" stroke="#6b7280" stroke-width="1"/>
          <rect x="9" y="4" width="4" height="40" fill="#6366f1"/>
        </svg>
      </template>
    </OptionInfoModal>
  </div>
</template>

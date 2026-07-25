<script setup lang="ts">
/**
 * PaperStockStep — Step 5: user selects interior paper stock
 */
import { computed, ref } from 'vue'
import { useProductOptions } from '@/composables/use-quote-state.composable'
import { useQuoteStore } from '@/stores/quote.store'
import OptionInfoModal from '@/components/option-info-modal.component.vue'

const quoteStore = useQuoteStore()
const { options, isLoading, error } = useProductOptions('/products/paper-stocks')

const activeModal = ref<string | null>(null)

const optionMeta: Record<string, { description: string; tooltip: string; sheets: number }> = {
  '60lb Natural': {
    description: 'Cream-toned — warm, classic book feel',
    tooltip: 'Slightly off-white (cream) paper that reduces eye strain during long reading sessions. The traditional choice for novels and fiction. Slightly thinner than white stocks.',
    sheets: 2,
  },
  '70lb White': {
    description: 'Bright white — crisp & clean standard',
    tooltip: 'Bright white paper — the most common choice for non-fiction, workbooks, and mixed text/image content. Good opacity, minimal bleed-through.',
    sheets: 3,
  },
  '80lb White': {
    description: 'Heavyweight white — premium & opaque',
    tooltip: 'Heavier bright white stock with excellent opacity and a premium feel. Ideal when your interior includes photos or graphics. Noticeably thicker than 70lb.',
    sheets: 4,
  },
}

const modalMeta = computed(() =>
  activeModal.value ? (optionMeta[activeModal.value] ?? null) : null
)

const isNatural = (name: string) => name === '60lb Natural'
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-1">Select Paper Stock</h2>
    <p class="text-sm text-gray-500 mb-6">Choose the paper weight for your interior pages.</p>

    <div v-if="isLoading" class="text-gray-400 text-sm">Loading options…</div>
    <p v-else-if="error" class="text-red-500 text-sm">{{ error }}</p>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="option in options"
        :key="option.id"
        class="p-4 border-2 rounded-xl text-left transition-all"
        :class="quoteStore.quoteState.paperStockId === option.id
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-300 bg-white'"
        @click="quoteStore.updateQuoteState({ paperStockId: option.id })"
      >
        <!-- Stacked sheets icon -->
        <div class="mb-3 h-12 flex items-end">
          <div class="relative" :style="{ width: '44px', height: `${(optionMeta[option.name]?.sheets ?? 3) * 10 + 6}px` }">
            <div
              v-for="i in (optionMeta[option.name]?.sheets ?? 3)"
              :key="i"
              class="absolute left-0 right-0 rounded-sm border transition-colors"
              :style="{ bottom: `${(i - 1) * 10}px`, height: '14px' }"
              :class="quoteStore.quoteState.paperStockId === option.id
                ? (isNatural(option.name) ? 'bg-amber-100 border-amber-300' : 'bg-indigo-100 border-indigo-300')
                : (isNatural(option.name) ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-300')"
            />
          </div>
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
        <!-- Large stacked sheets -->
        <div class="relative" :style="{ width: '64px', height: `${(modalMeta?.sheets ?? 3) * 14 + 8}px` }">
          <div
            v-for="i in (modalMeta?.sheets ?? 3)"
            :key="i"
            class="absolute left-0 right-0 rounded border"
            :style="{ bottom: `${(i - 1) * 14}px`, height: '20px' }"
            :class="activeModal && isNatural(activeModal)
              ? 'bg-amber-100 border-amber-300'
              : 'bg-indigo-100 border-indigo-300'"
          />
        </div>
      </template>
    </OptionInfoModal>
  </div>
</template>

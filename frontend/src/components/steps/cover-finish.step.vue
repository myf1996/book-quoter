<script setup lang="ts">
/**
 * CoverFinishStep — Step 3: user selects a cover finish
 */
import { computed, ref } from 'vue'
import { useProductOptions } from '@/composables/use-quote-state.composable'
import { useQuoteStore } from '@/stores/quote.store'
import OptionInfoModal from '@/components/option-info-modal.component.vue'

const quoteStore = useQuoteStore()
const { options, isLoading, error } = useProductOptions('/products/cover-finishes')

const activeModal = ref<string | null>(null)

const optionMeta: Record<string, { description: string; tooltip: string }> = {
  'Gloss': {
    description: 'Shiny & vibrant — makes colors pop',
    tooltip: 'High-shine coating that intensifies color saturation and adds visual depth. Best for photography books, children\'s books, and bold cover designs. Slightly more resistant to moisture.',
  },
  'Matte': {
    description: 'Smooth & non-reflective — sophisticated look',
    tooltip: 'Flat, non-reflective finish with a soft, elegant feel. Reduces glare and gives a more understated, literary look. Very popular for literary fiction and serious non-fiction.',
  },
  'Textured': {
    description: 'Tactile feel — unique premium touch',
    tooltip: 'Embossed surface texture adds a distinctive look and feel that stands out on shelves. A premium choice that makes your book immediately memorable when picked up.',
  },
}

const selectedIsActive = (id: string) => quoteStore.quoteState.coverFinishId === id

const modalMeta = computed(() =>
  activeModal.value ? (optionMeta[activeModal.value] ?? null) : null
)
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
        class="p-4 border-2 rounded-xl text-left transition-all"
        :class="selectedIsActive(option.id)
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-300 bg-white'"
        @click="quoteStore.updateQuoteState({ coverFinishId: option.id })"
      >
        <!-- Finish swatch -->
        <div class="mb-3 w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
          <div
            v-if="option.name === 'Gloss'"
            class="w-full h-full"
            :style="{
              background: selectedIsActive(option.id)
                ? 'linear-gradient(135deg,#818cf8 0%,#c7d2fe 40%,#ffffff 55%,#818cf8 100%)'
                : 'linear-gradient(135deg,#6b7280 0%,#d1d5db 40%,#ffffff 55%,#9ca3af 100%)',
            }"
          />
          <div
            v-else-if="option.name === 'Matte'"
            class="w-full h-full"
            :class="selectedIsActive(option.id) ? 'bg-indigo-200' : 'bg-gray-200'"
          />
          <div
            v-else
            class="w-full h-full relative overflow-hidden"
            :class="selectedIsActive(option.id) ? 'bg-indigo-50' : 'bg-gray-50'"
          >
            <svg width="48" height="48" class="absolute inset-0">
              <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" :fill="selectedIsActive(option.id) ? '#818cf8' : '#9ca3af'"/>
              </pattern>
              <rect width="48" height="48" fill="url(#dots)"/>
            </svg>
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
        <!-- Gloss: large gradient swatch -->
        <div
          v-if="activeModal === 'Gloss'"
          class="w-28 h-28 rounded-2xl"
          style="background: linear-gradient(135deg,#818cf8 0%,#c7d2fe 40%,#ffffff 55%,#818cf8 100%); box-shadow: 0 8px 24px rgba(99,102,241,0.3)"
        />
        <!-- Matte: flat swatch -->
        <div
          v-else-if="activeModal === 'Matte'"
          class="w-28 h-28 rounded-2xl bg-indigo-200"
          style="box-shadow: inset 0 2px 8px rgba(0,0,0,0.08)"
        />
        <!-- Textured: large dot pattern -->
        <div v-else class="w-28 h-28 rounded-2xl overflow-hidden bg-indigo-50">
          <svg width="112" height="112">
            <pattern id="bigdots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="2" fill="#818cf8" opacity="0.6"/>
            </pattern>
            <rect width="112" height="112" fill="url(#bigdots)"/>
          </svg>
        </div>
      </template>
    </OptionInfoModal>
  </div>
</template>

<script setup lang="ts">
/**
 * BindingStep — Step 6: user selects binding type
 */
import { computed, ref } from 'vue'
import { useProductOptions } from '@/composables/use-quote-state.composable'
import { useQuoteStore } from '@/stores/quote.store'
import OptionInfoModal from '@/components/option-info-modal.component.vue'

const quoteStore = useQuoteStore()
const { options, isLoading, error } = useProductOptions('/products/binding-types')

const activeModal = ref<string | null>(null)

const optionMeta: Record<string, { description: string; tooltip: string }> = {
  'Perfect Bind': {
    description: 'Glued spine — the trade paperback standard',
    tooltip: 'Pages are glued together at the spine with a strong adhesive. The standard for trade paperbacks, novels, and most books over 80 pages. Clean, professional look.',
  },
  'Saddle Stitch': {
    description: 'Stapled spine — ideal for booklets under 80 pages',
    tooltip: 'Pages are folded and stapled through the spine. Simple and cost-effective for shorter runs like brochures, programs, and small booklets. Lays flat when open.',
  },
  'Spiral': {
    description: 'Coil binding — lays flat, great for workbooks',
    tooltip: 'A plastic or metal coil threaded through punched holes. Pages lie completely flat when open — perfect for notebooks, manuals, and workbooks where both hands need to be free.',
  },
}

const selectedIsActive = (id: string) => quoteStore.quoteState.bindingTypeId === id

const modalMeta = computed(() =>
  activeModal.value ? (optionMeta[activeModal.value] ?? null) : null
)
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-1">Select Binding Type</h2>
    <p class="text-sm text-gray-500 mb-6">Choose how your book pages are bound together.</p>

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
        @click="quoteStore.updateQuoteState({ bindingTypeId: option.id })"
      >
        <!-- Binding icon -->
        <div class="mb-3 h-12 flex items-center">
          <svg v-if="option.name === 'Perfect Bind'" width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect x="8" y="4" width="28" height="36" rx="1" :fill="selectedIsActive(option.id) ? '#c7d2fe' : '#e5e7eb'" stroke="#9ca3af" stroke-width="1.5"/>
            <rect x="8" y="4" width="5" height="36" :fill="selectedIsActive(option.id) ? '#818cf8' : '#9ca3af'"/>
            <line x1="16" y1="12" x2="33" y2="12" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
            <line x1="16" y1="17" x2="33" y2="17" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
            <line x1="16" y1="22" x2="30" y2="22" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
            <line x1="16" y1="27" x2="33" y2="27" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="option.name === 'Saddle Stitch'" width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect x="6" y="4" width="32" height="36" rx="1" :fill="selectedIsActive(option.id) ? '#c7d2fe' : '#e5e7eb'" stroke="#9ca3af" stroke-width="1.5"/>
            <line x1="22" y1="4" x2="22" y2="40" stroke="#9ca3af" stroke-width="1" stroke-dasharray="2 2"/>
            <rect x="19" y="11" width="6" height="3" rx="0.5" :fill="selectedIsActive(option.id) ? '#6366f1' : '#6b7280'"/>
            <rect x="19" y="27" width="6" height="3" rx="0.5" :fill="selectedIsActive(option.id) ? '#6366f1' : '#6b7280'"/>
            <line x1="10" y1="14" x2="20" y2="14" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
            <line x1="10" y1="19" x2="20" y2="19" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
            <line x1="24" y1="14" x2="34" y2="14" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
            <line x1="24" y1="19" x2="34" y2="19" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
          </svg>
          <svg v-else width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect x="10" y="4" width="28" height="36" rx="1" :fill="selectedIsActive(option.id) ? '#c7d2fe' : '#e5e7eb'" stroke="#9ca3af" stroke-width="1.5"/>
            <circle v-for="cy in [10, 17, 24, 31]" :key="cy" cx="10" :cy="cy" r="3.5" :fill="selectedIsActive(option.id) ? '#818cf8' : '#9ca3af'" stroke="white" stroke-width="1"/>
            <line x1="17" y1="13" x2="35" y2="13" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
            <line x1="17" y1="20" x2="35" y2="20" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
            <line x1="17" y1="27" x2="35" y2="27" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
          </svg>
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
        <!-- Perfect Bind large -->
        <svg v-if="activeModal === 'Perfect Bind'" width="90" height="110" viewBox="0 0 44 54" fill="none">
          <rect x="8" y="4" width="28" height="46" rx="1" fill="#c7d2fe" stroke="#9ca3af" stroke-width="1.5"/>
          <rect x="8" y="4" width="6" height="46" fill="#818cf8"/>
          <line x1="17" y1="14" x2="33" y2="14" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="17" y1="21" x2="33" y2="21" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="17" y1="28" x2="30" y2="28" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="17" y1="35" x2="33" y2="35" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="17" y1="42" x2="29" y2="42" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <!-- Saddle Stitch large -->
        <svg v-else-if="activeModal === 'Saddle Stitch'" width="100" height="110" viewBox="0 0 50 54" fill="none">
          <rect x="5" y="4" width="40" height="46" rx="1" fill="#c7d2fe" stroke="#9ca3af" stroke-width="1.5"/>
          <line x1="25" y1="4" x2="25" y2="50" stroke="#9ca3af" stroke-width="1" stroke-dasharray="3 3"/>
          <rect x="21" y="13" width="8" height="4" rx="1" fill="#6366f1"/>
          <rect x="21" y="33" width="8" height="4" rx="1" fill="#6366f1"/>
          <line x1="9" y1="19" x2="23" y2="19" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="9" y1="25" x2="23" y2="25" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="27" y1="19" x2="41" y2="19" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="27" y1="25" x2="41" y2="25" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <!-- Spiral large -->
        <svg v-else width="90" height="110" viewBox="0 0 44 54" fill="none">
          <rect x="10" y="4" width="28" height="46" rx="1" fill="#c7d2fe" stroke="#9ca3af" stroke-width="1.5"/>
          <circle v-for="cy in [11, 19, 27, 35, 43]" :key="cy" cx="10" :cy="cy" r="4" fill="#818cf8" stroke="white" stroke-width="1.5"/>
          <line x1="17" y1="15" x2="35" y2="15" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="17" y1="23" x2="35" y2="23" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="17" y1="31" x2="35" y2="31" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="17" y1="39" x2="33" y2="39" stroke="#a5b4fc" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
    </OptionInfoModal>
  </div>
</template>

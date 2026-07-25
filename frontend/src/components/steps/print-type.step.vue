<script setup lang="ts">
/**
 * PrintTypeStep — Step 4: select print type and configure ink colors.
 * B&W: colors (#000000/#FFFFFF) auto-set from API. Color: user picks via color pickers.
 */
import { computed, ref } from 'vue'
import { useProductOptions } from '@/composables/use-quote-state.composable'
import { useQuoteStore } from '@/stores/quote.store'
import OptionInfoModal from '@/components/option-info-modal.component.vue'

const quoteStore = useQuoteStore()
const { options, isLoading, error } = useProductOptions('/products/print-types')

// ─── Modal ────────────────────────────────────────────────────────────────────
const activeModal = ref<string | null>(null)

const optionMeta: Record<string, { description: string }> = {
  'Black & White': {
    description: 'Standard black ink on white or cream paper. Perfect for novels, memoirs, academic texts, and any content without color images. Significantly lower cost per page than full color.',
  },
  'Color': {
    description: 'Full CMYK color printing on every page. Perfect for children\'s books, art books, photo collections, and illustrated guides requiring accurate color reproduction.',
  },
}

// ─── Selected option ──────────────────────────────────────────────────────────
const selectedOption = computed(() =>
  options.value.find((o) => o.id === quoteStore.quoteState.printTypeId) ?? null,
)

/** True if the selected type has preset colors (i.e. Black & White) */
const isBWType = computed(() =>
  selectedOption.value !== null && selectedOption.value.primaryColor != null,
)

/** True if the selected type requires user to pick colors (i.e. Color) */
const isColorType = computed(() =>
  selectedOption.value !== null && selectedOption.value.primaryColor == null,
)

// ─── Local color state for the color pickers ──────────────────────────────────
const localPrimary = ref(quoteStore.quoteState.primaryColor ?? '#1a1a2e')
const localSecondary = ref(quoteStore.quoteState.secondaryColor ?? '#e8e8e8')

function selectPrintType(option: typeof options.value[number]): void {
  quoteStore.updateQuoteState({ printTypeId: option.id })

  if (option.primaryColor) {
    // B&W — auto-fill from API defaults
    quoteStore.updateQuoteState({
      primaryColor: option.primaryColor as string,
      secondaryColor: option.secondaryColor as string,
    })
  } else {
    // Color — reset store; user must pick
    localPrimary.value = '#1a1a2e'
    localSecondary.value = '#e8e8e8'
    quoteStore.updateQuoteState({ primaryColor: null, secondaryColor: null })
  }
}

function onPrimaryChange(e: Event): void {
  const hex = (e.target as HTMLInputElement).value
  localPrimary.value = hex
  if (isColorType.value) {
    quoteStore.updateQuoteState({ primaryColor: hex })
  }
}

function onSecondaryChange(e: Event): void {
  const hex = (e.target as HTMLInputElement).value
  localSecondary.value = hex
  if (isColorType.value) {
    quoteStore.updateQuoteState({ secondaryColor: hex })
  }
}

const modalDescription = computed(() =>
  activeModal.value ? (optionMeta[activeModal.value]?.description ?? '') : ''
)
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
        class="p-4 border-2 rounded-xl text-left transition-all"
        :class="quoteStore.quoteState.printTypeId === option.id
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-300 bg-white'"
        @click="selectPrintType(option)"
      >
        <!-- Icon -->
        <div class="mb-3 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
          <svg v-if="option.primaryColor" width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="16" fill="white" stroke="#d1d5db"/>
            <path d="M18 2 A16 16 0 0 1 18 34 Z" fill="#1f2937"/>
            <line x1="22" y1="12" x2="30" y2="12" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="22" y1="17" x2="30" y2="17" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="22" y1="22" x2="28" y2="22" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="6" y1="12" x2="14" y2="12" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="6" y1="17" x2="14" y2="17" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="6" y1="22" x2="12" y2="22" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <svg v-else width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="16" fill="white" stroke="#d1d5db"/>
            <path d="M18 4 A14 14 0 0 1 32 18" fill="#ef4444" opacity="0.85"/>
            <path d="M32 18 A14 14 0 0 1 24.9 28.9" fill="#f97316" opacity="0.85"/>
            <path d="M24.9 28.9 A14 14 0 0 1 11.1 28.9" fill="#eab308" opacity="0.85"/>
            <path d="M11.1 28.9 A14 14 0 0 1 4 18" fill="#22c55e" opacity="0.85"/>
            <path d="M4 18 A14 14 0 0 1 11.1 7.1" fill="#3b82f6" opacity="0.85"/>
            <path d="M11.1 7.1 A14 14 0 0 1 18 4" fill="#8b5cf6" opacity="0.85"/>
            <circle cx="18" cy="18" r="6" fill="white"/>
          </svg>
        </div>

        <div class="flex items-start justify-between gap-1">
          <div>
            <p class="font-semibold text-gray-900 text-sm">{{ option.name }}</p>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ option.primaryColor ? 'Ideal for text-heavy books — most affordable' : 'Full-color interior — vivid images & graphics' }}
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
      </button>
    </div>

    <!-- B&W: auto color preview -->
    <div v-if="isBWType" class="mt-6 p-4 bg-white border border-gray-200 rounded-xl">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ink Colors</p>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full border-2 border-gray-300 shadow-inner" style="background:#000000"/>
          <div>
            <p class="text-xs font-medium text-gray-700">Primary</p>
            <p class="text-xs text-gray-400">#000000</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full border-2 border-gray-300 shadow-inner" style="background:#FFFFFF"/>
          <div>
            <p class="text-xs font-medium text-gray-700">Secondary</p>
            <p class="text-xs text-gray-400">#FFFFFF</p>
          </div>
        </div>
        <p class="text-xs text-gray-400 ml-auto">Auto-configured</p>
      </div>
    </div>

    <!-- Color: user-defined pickers -->
    <div v-if="isColorType" class="mt-6 p-4 bg-white border border-indigo-100 rounded-xl">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Choose Your Book's Colors</p>
      <p class="text-xs text-gray-400 mb-4">Select a primary and secondary color for your interior printing.</p>

      <div class="grid grid-cols-2 gap-4">
        <!-- Primary -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-2">Primary Color</label>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden relative flex-shrink-0"
              :style="{ background: localPrimary }"
            >
              <input
                type="color"
                :value="localPrimary"
                class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                @input="onPrimaryChange"
              />
            </div>
            <div>
              <p class="text-sm font-mono text-gray-800 uppercase">{{ localPrimary }}</p>
              <p class="text-xs text-gray-400">Click to change</p>
            </div>
          </div>
        </div>

        <!-- Secondary -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-2">Secondary Color</label>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden relative flex-shrink-0"
              :style="{ background: localSecondary }"
            >
              <input
                type="color"
                :value="localSecondary"
                class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                @input="onSecondaryChange"
              />
            </div>
            <div>
              <p class="text-sm font-mono text-gray-800 uppercase">{{ localSecondary }}</p>
              <p class="text-xs text-gray-400">Click to change</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview strip -->
      <div class="mt-4 h-6 rounded-lg overflow-hidden flex">
        <div class="flex-1" :style="{ background: localPrimary }"/>
        <div class="flex-1" :style="{ background: localSecondary }"/>
      </div>
      <p class="text-xs text-gray-400 mt-1 text-center">Color preview</p>
    </div>

    <!-- Info modal -->
    <OptionInfoModal
      :open="activeModal !== null"
      :title="activeModal ?? ''"
      :description="modalDescription"
      @close="activeModal = null"
    >
      <template #icon>
        <!-- B&W large icon -->
        <svg
          v-if="activeModal && options.find(o => o.name === activeModal)?.primaryColor"
          width="80" height="80" viewBox="0 0 80 80" fill="none"
        >
          <circle cx="40" cy="40" r="36" fill="white" stroke="#e5e7eb" stroke-width="2"/>
          <path d="M40 4 A36 36 0 0 1 40 76 Z" fill="#1f2937"/>
          <line x1="48" y1="26" x2="68" y2="26" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
          <line x1="48" y1="36" x2="68" y2="36" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
          <line x1="48" y1="46" x2="62" y2="46" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
          <line x1="12" y1="26" x2="32" y2="26" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
          <line x1="12" y1="36" x2="32" y2="36" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
          <line x1="12" y1="46" x2="28" y2="46" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <!-- Color large icon -->
        <svg v-else width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" fill="white" stroke="#e5e7eb" stroke-width="2"/>
          <path d="M40 6 A34 34 0 0 1 74 40" fill="#ef4444" opacity="0.9"/>
          <path d="M74 40 A34 34 0 0 1 57 69.5" fill="#f97316" opacity="0.9"/>
          <path d="M57 69.5 A34 34 0 0 1 23 69.5" fill="#eab308" opacity="0.9"/>
          <path d="M23 69.5 A34 34 0 0 1 6 40" fill="#22c55e" opacity="0.9"/>
          <path d="M6 40 A34 34 0 0 1 23 10.5" fill="#3b82f6" opacity="0.9"/>
          <path d="M23 10.5 A34 34 0 0 1 40 6" fill="#8b5cf6" opacity="0.9"/>
          <circle cx="40" cy="40" r="14" fill="white"/>
        </svg>
      </template>

      <!-- B&W: show hex swatches in extra slot -->
      <template v-if="activeModal && options.find(o => o.name === activeModal)?.primaryColor" #extra>
        <div class="flex gap-4">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-black border-2 border-gray-300 flex-shrink-0"/>
            <div>
              <p class="text-xs font-semibold text-gray-700">Primary</p>
              <p class="text-xs font-mono text-gray-500">#000000</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-white border-2 border-gray-300 flex-shrink-0"/>
            <div>
              <p class="text-xs font-semibold text-gray-700">Secondary</p>
              <p class="text-xs font-mono text-gray-500">#FFFFFF</p>
            </div>
          </div>
        </div>
      </template>
    </OptionInfoModal>
  </div>
</template>

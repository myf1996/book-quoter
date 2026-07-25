<script setup lang="ts">
/**
 * OptionInfoModal — full-screen modal that shows a large icon preview
 * plus the full description for a wizard option card.
 * Triggered by clicking the ⓘ icon on any option card.
 */
defineProps<{
  open: boolean
  title: string
  description: string
}>()

defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="$emit('close')"
        />

        <!-- Panel -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          <!-- Close button -->
          <button
            class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10"
            @click="$emit('close')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Icon area — full-width colored header -->
          <div class="bg-indigo-50 flex items-center justify-center py-8 px-6">
            <slot name="icon" />
          </div>

          <!-- Content -->
          <div class="p-6 pt-5">
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ title }}</h3>
            <p class="text-sm text-gray-600 leading-relaxed">{{ description }}</p>

            <!-- Optional extra content slot (e.g. color swatches) -->
            <div v-if="$slots.extra" class="mt-4">
              <slot name="extra" />
            </div>

            <button
              class="mt-5 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
              @click="$emit('close')"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * ProgressBar — clickable step navigator showing all steps with completion state.
 */
import { computed } from 'vue'
import { useQuoteStore, STEP_LABELS } from '@/stores/quote.store'

const props = defineProps<{ currentStep: number; totalSteps: number }>()
const quoteStore = useQuoteStore()

const percent = computed(() => Math.round((props.currentStep / props.totalSteps) * 100))

function canJumpTo(stepIndex: number): boolean {
  // Allow jumping to any step that has already been reached
  return stepIndex + 1 <= props.currentStep
}
</script>

<template>
  <!-- Mobile: compact progress bar -->
  <div class="lg:hidden mb-2">
    <div class="flex justify-between text-xs text-gray-500 mb-1.5">
      <span class="font-medium">{{ STEP_LABELS[currentStep - 1] }}</span>
      <span>Step {{ currentStep }} of {{ totalSteps }}</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-1.5">
      <div
        class="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>

  <!-- Desktop: horizontal step list -->
  <div class="hidden lg:flex items-center gap-0">
    <template v-for="(label, i) in STEP_LABELS" :key="i">
      <button
        class="flex items-center gap-2 group transition-all"
        :class="canJumpTo(i) ? 'cursor-pointer' : 'cursor-default'"
        :disabled="!canJumpTo(i)"
        :title="canJumpTo(i) ? `Go to ${label}` : ''"
        @click="canJumpTo(i) ? quoteStore.goToStep(i + 1) : undefined"
      >
        <!-- Step circle -->
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors"
          :class="{
            'bg-indigo-600 text-white': i + 1 === currentStep,
            'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200': i + 1 < currentStep,
            'bg-gray-100 text-gray-400': i + 1 > currentStep,
          }"
        >
          <!-- Checkmark for completed steps -->
          <svg v-if="i + 1 < currentStep" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
          <span v-else>{{ i + 1 }}</span>
        </div>

        <!-- Label (only show for current + flanking) -->
        <span
          class="text-xs whitespace-nowrap transition-colors hidden xl:block"
          :class="{
            'font-semibold text-indigo-700': i + 1 === currentStep,
            'text-indigo-500 group-hover:text-indigo-700': i + 1 < currentStep,
            'text-gray-400': i + 1 > currentStep,
          }"
        >{{ label }}</span>
      </button>

      <!-- Connector line between steps -->
      <div
        v-if="i < STEP_LABELS.length - 1"
        class="flex-1 h-px mx-1 min-w-[8px] transition-colors"
        :class="i + 1 < currentStep ? 'bg-indigo-300' : 'bg-gray-200'"
      />
    </template>
  </div>
</template>

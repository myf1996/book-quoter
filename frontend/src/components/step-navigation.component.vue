<script setup lang="ts">
/**
 * StepNavigation — Previous / Next / Finish buttons for the wizard.
 * Emits `finish` on the last step instead of `next` so the wizard
 * can intercept it for auth-gated quote saving.
 */
defineProps<{
  currentStep: number
  totalSteps: number
  canAdvance: boolean
}>()

const emit = defineEmits<{
  next: []
  previous: []
  finish: []
}>()
</script>

<template>
  <div class="flex justify-between mt-8">
    <button
      v-if="currentStep > 1"
      class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      @click="emit('previous')"
    >
      Previous
    </button>
    <div v-else />

    <button
      v-if="currentStep < totalSteps"
      class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      :disabled="!canAdvance"
      @click="emit('next')"
    >
      Next
    </button>
    <button
      v-else
      class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      :disabled="!canAdvance"
      @click="emit('finish')"
    >
      Finish
    </button>
  </div>
</template>

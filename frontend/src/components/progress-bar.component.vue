<script setup lang="ts">
/**
 * ProgressBar — shows current step out of total with a filled bar
 */
defineProps<{ currentStep: number; totalSteps: number }>()
</script>

<template>
  <div class="mb-6">
    <div class="flex justify-between text-sm text-gray-500 mb-2">
      <span>Step {{ currentStep }} of {{ totalSteps }}</span>
      <span>{{ Math.round((currentStep / totalSteps) * 100) }}% complete</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div
        class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
        :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
      />
    </div>
  </div>
</template>

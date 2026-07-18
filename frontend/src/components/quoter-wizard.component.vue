<script setup lang="ts">
/**
 * QuoterWizard — orchestrates all 7 steps of the quote configuration flow
 */
import { computed } from 'vue'
import { useQuoteStore } from '@/stores/quote.store'
import ProgressBar from '@/components/progress-bar.component.vue'
import StepNavigation from '@/components/step-navigation.component.vue'
import QuoteSummary from '@/components/quote-summary.component.vue'
import TrimSizeStep from '@/components/steps/trim-size.step.vue'
import CoverStyleStep from '@/components/steps/cover-style.step.vue'
import CoverFinishStep from '@/components/steps/cover-finish.step.vue'
import PrintTypeStep from '@/components/steps/print-type.step.vue'
import PaperStockStep from '@/components/steps/paper-stock.step.vue'
import BindingStep from '@/components/steps/binding.step.vue'
import QuantityStep from '@/components/steps/quantity.step.vue'

const TOTAL_STEPS = 7
const quoteStore = useQuoteStore()

const stepComponents = [
  TrimSizeStep,
  CoverStyleStep,
  CoverFinishStep,
  PrintTypeStep,
  PaperStockStep,
  BindingStep,
  QuantityStep,
]

const currentStepComponent = computed(() => stepComponents[quoteStore.currentStep - 1])
const canAdvance = computed(() => quoteStore.isCurrentStepComplete())
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-100">
      <ProgressBar :current-step="quoteStore.currentStep" :total-steps="TOTAL_STEPS" />
    </div>

    <div class="flex flex-col lg:flex-row">
      <!-- Step content -->
      <div class="flex-1 p-6 lg:p-8">
        <component :is="currentStepComponent" />

        <div class="mt-8">
          <StepNavigation
            :current-step="quoteStore.currentStep"
            :total-steps="TOTAL_STEPS"
            :can-advance="canAdvance"
            @next="quoteStore.goToNextStep()"
            @previous="quoteStore.goToPreviousStep()"
          />
        </div>
      </div>

      <!-- Sidebar summary -->
      <div class="lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 bg-gray-50">
        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Your Selection</h3>
        <QuoteSummary />
      </div>
    </div>
  </div>
</template>

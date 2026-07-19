<script setup lang="ts">
/**
 * QuoterWizard — orchestrates all 7 steps of the quote configuration flow.
 * On finish: if unauthenticated shows the auth modal, then auto-saves the quote.
 * If already authenticated, saves immediately.
 */
import { computed, ref } from 'vue'
import { useQuoteStore } from '@/stores/quote.store'
import { useAuthStore } from '@/stores/auth.store'
import { api } from '@/utils/helpers.utils'
import ProgressBar from '@/components/progress-bar.component.vue'
import StepNavigation from '@/components/step-navigation.component.vue'
import QuoteSummary from '@/components/quote-summary.component.vue'
import AuthModal from '@/components/auth-modal.component.vue'
import TrimSizeStep from '@/components/steps/trim-size.step.vue'
import CoverStyleStep from '@/components/steps/cover-style.step.vue'
import CoverFinishStep from '@/components/steps/cover-finish.step.vue'
import PrintTypeStep from '@/components/steps/print-type.step.vue'
import PaperStockStep from '@/components/steps/paper-stock.step.vue'
import BindingStep from '@/components/steps/binding.step.vue'
import QuantityStep from '@/components/steps/quantity.step.vue'

interface SavedQuoteResponse {
  id: string
}

const TOTAL_STEPS = 7
const quoteStore = useQuoteStore()
const authStore = useAuthStore()

const showAuthModal = ref(false)
const isSavingQuote = ref(false)
const savedQuoteId = ref<string | null>(null)
const saveError = ref<string | null>(null)

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

/**
 * Called when the user clicks Finish on step 7.
 * Opens the auth modal if unauthenticated, otherwise saves immediately.
 */
async function handleFinish(): Promise<void> {
  if (!authStore.isAuthenticated) {
    showAuthModal.value = true
    return
  }
  await saveQuote()
}

/**
 * Sends the current quote state to the backend and records the saved quote ID.
 * Called directly (authenticated) or as the auth modal's onSuccess callback.
 */
async function saveQuote(): Promise<void> {
  isSavingQuote.value = true
  saveError.value = null
  try {
    const body: Record<string, unknown> = { ...quoteStore.quoteState }
    if (quoteStore.appliedCoupon) {
      body.couponCode = quoteStore.appliedCoupon.code
    }
    const { data } = await api.post<SavedQuoteResponse>('/quoter/quote', body)
    savedQuoteId.value = data.id
    quoteStore.setAppliedCoupon(null)
  } catch {
    saveError.value = 'Failed to save quote. Please try again.'
  } finally {
    isSavingQuote.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

    <!-- Success state — shown after quote is saved -->
    <div v-if="savedQuoteId" class="p-8 text-center">
      <div class="text-green-600 text-5xl mb-4">&#10003;</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Quote Saved!</h2>
      <p class="text-gray-500 mb-1">Quote #{{ savedQuoteId }}</p>
      <p class="text-sm text-gray-400 mb-6">
        We'll email your quote details to {{ authStore.user?.email }}
      </p>
      <a
        href="/my-quotes"
        class="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        View My Quotes
      </a>
    </div>

    <!-- Wizard steps -->
    <template v-else>
      <div class="p-6 border-b border-gray-100">
        <ProgressBar :current-step="quoteStore.currentStep" :total-steps="TOTAL_STEPS" />
      </div>

      <div class="flex flex-col lg:flex-row">
        <!-- Step content -->
        <div class="flex-1 p-6 lg:p-8">
          <component :is="currentStepComponent" />

          <!-- Save error banner -->
          <p
            v-if="saveError"
            class="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2"
          >
            {{ saveError }}
          </p>

          <div class="mt-8">
            <StepNavigation
              :current-step="quoteStore.currentStep"
              :total-steps="TOTAL_STEPS"
              :can-advance="canAdvance && !isSavingQuote"
              @next="quoteStore.goToNextStep()"
              @previous="quoteStore.goToPreviousStep()"
              @finish="handleFinish"
            />
          </div>
        </div>

        <!-- Sidebar summary -->
        <div class="lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Your Selection</h3>
          <QuoteSummary />
        </div>
      </div>
    </template>

    <!-- Auth modal — shown when unauthenticated user clicks Finish -->
    <AuthModal v-model="showAuthModal" :on-success="saveQuote" />
  </div>
</template>

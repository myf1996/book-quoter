import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export interface QuoteState {
  trimSizeId: number | null
  coverStyleId: number | null
  coverFinishId: number | null
  printTypeId: number | null
  paperStockId: number | null
  bindingTypeId: number | null
}

const TOTAL_STEPS = 6

const stepFieldMap: Record<number, keyof QuoteState> = {
  1: 'trimSizeId',
  2: 'coverStyleId',
  3: 'coverFinishId',
  4: 'printTypeId',
  5: 'paperStockId',
  6: 'bindingTypeId',
}

/**
 * Central state for the 6-step quoter wizard.
 * Tracks current step and all selected product IDs.
 */
export const useQuoteStore = defineStore('quote', () => {
  const currentStep = ref(1)
  const quoteState = reactive<QuoteState>({
    trimSizeId: null,
    coverStyleId: null,
    coverFinishId: null,
    printTypeId: null,
    paperStockId: null,
    bindingTypeId: null,
  })

  /** Updates one or more fields in the quote state */
  function updateQuoteState(updates: Partial<QuoteState>): void {
    Object.assign(quoteState, updates)
  }

  /** Returns true if the current step has a selection */
  function isCurrentStepComplete(): boolean {
    const field = stepFieldMap[currentStep.value]
    return quoteState[field] !== null
  }

  /** Advance to the next step if current step is complete */
  function goToNextStep(): void {
    if (currentStep.value < TOTAL_STEPS && isCurrentStepComplete()) {
      currentStep.value++
    }
  }

  /** Go back one step */
  function goToPreviousStep(): void {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  return {
    currentStep,
    quoteState,
    updateQuoteState,
    isCurrentStepComplete,
    goToNextStep,
    goToPreviousStep,
    totalSteps: TOTAL_STEPS,
  }
})

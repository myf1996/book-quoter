import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export interface AppliedCoupon {
  code: string
  discountType: 'fixed' | 'percentage'
  discountValue: number
}

export interface QuoteState {
  trimSizeId: string | null
  coverStyleId: string | null
  coverFinishId: string | null
  printTypeId: string | null
  paperStockId: string | null
  bindingTypeId: string | null
  pageCount: number | null
  quantity: number | null
  /** Primary ink color hex — auto-set for B&W, user-chosen for Color */
  primaryColor: string | null
  /** Secondary ink color hex — auto-set for B&W, user-chosen for Color */
  secondaryColor: string | null
}

/** Tracks page count validity bounds when a trim size is selected */
export interface PageCountBounds {
  minPages: number
  maxPages: number
}

export type ProductionTime = 'standard' | 'expedited' | 'rush'

export const STEP_LABELS = [
  'Trim Size',
  'Cover Style',
  'Cover Finish',
  'Print Type',
  'Paper Stock',
  'Binding',
  'Quantity',
] as const

const TOTAL_STEPS = 7

const stepFieldMap: Record<number, keyof QuoteState> = {
  1: 'trimSizeId',
  2: 'coverStyleId',
  3: 'coverFinishId',
  4: 'printTypeId',
  5: 'paperStockId',
  6: 'bindingTypeId',
  7: 'quantity',
}

/**
 * Central state for the 7-step quoter wizard.
 * Tracks current step and all selected product IDs, page count, and quantity.
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
    pageCount: null,
    quantity: null,
    primaryColor: null,
    secondaryColor: null,
  })

  /**
   * Stores the valid page range for the currently selected trim size.
   * Set by TrimSizeStep when the user picks a size.
   */
  const pageCountBounds = reactive<PageCountBounds>({ minPages: 24, maxPages: 840 })

  /** Coupon applied by the user in the summary sidebar; null if none */
  const appliedCoupon = ref<AppliedCoupon | null>(null)

  /** Production time selection — UI only, not persisted to DB */
  const productionTime = ref<ProductionTime>('standard')

  function setAppliedCoupon(coupon: AppliedCoupon | null): void {
    appliedCoupon.value = coupon
  }

  function setProductionTime(time: ProductionTime): void {
    productionTime.value = time
  }

  /** Navigate directly to any step number */
  function goToStep(step: number): void {
    if (step >= 1 && step <= TOTAL_STEPS) {
      currentStep.value = step
    }
  }

  /** Updates one or more fields in the quote state */
  function updateQuoteState(updates: Partial<QuoteState>): void {
    Object.assign(quoteState, updates)
  }

  /** Updates the min/max page bounds based on the selected trim size */
  function setPageCountBounds(bounds: PageCountBounds): void {
    pageCountBounds.minPages = bounds.minPages
    pageCountBounds.maxPages = bounds.maxPages
  }

  /** Returns true if the current step has a valid selection */
  function isCurrentStepComplete(): boolean {
    if (currentStep.value === 1) {
      if (quoteState.trimSizeId === null || quoteState.pageCount === null) return false
      return (
        quoteState.pageCount >= pageCountBounds.minPages &&
        quoteState.pageCount <= pageCountBounds.maxPages
      )
    }
    if (currentStep.value === 4) {
      // Print Type requires a selection AND both colors to be set
      return (
        quoteState.printTypeId !== null &&
        quoteState.primaryColor !== null &&
        quoteState.secondaryColor !== null
      )
    }
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
    pageCountBounds,
    appliedCoupon,
    productionTime,
    updateQuoteState,
    setPageCountBounds,
    setAppliedCoupon,
    setProductionTime,
    goToStep,
    isCurrentStepComplete,
    goToNextStep,
    goToPreviousStep,
    totalSteps: TOTAL_STEPS,
  }
})

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useQuoteStore } from './quote.store'

describe('useQuoteStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ─── initial state ───────────────────────────────────────────────────────────

  it('starts at step 1 with all fields null', () => {
    const store = useQuoteStore()
    expect(store.currentStep).toBe(1)
    expect(store.quoteState.trimSizeId).toBeNull()
    expect(store.quoteState.coverStyleId).toBeNull()
    expect(store.quoteState.pageCount).toBeNull()
    expect(store.quoteState.quantity).toBeNull()
  })

  // ─── isCurrentStepComplete ───────────────────────────────────────────────────

  describe('isCurrentStepComplete', () => {
    it('returns false on step 1 when trimSizeId not set', () => {
      const store = useQuoteStore()
      store.updateQuoteState({ pageCount: 200 })
      expect(store.isCurrentStepComplete()).toBe(false)
    })

    it('returns false on step 1 when pageCount not set', () => {
      const store = useQuoteStore()
      store.updateQuoteState({ trimSizeId: 'uuid-1' })
      expect(store.isCurrentStepComplete()).toBe(false)
    })

    it('returns false on step 1 when pageCount is below minPages', () => {
      const store = useQuoteStore()
      store.updateQuoteState({ trimSizeId: 'uuid-1', pageCount: 10 })
      store.setPageCountBounds({ minPages: 24, maxPages: 840 })
      expect(store.isCurrentStepComplete()).toBe(false)
    })

    it('returns false on step 1 when pageCount exceeds maxPages', () => {
      const store = useQuoteStore()
      store.updateQuoteState({ trimSizeId: 'uuid-1', pageCount: 900 })
      store.setPageCountBounds({ minPages: 24, maxPages: 840 })
      expect(store.isCurrentStepComplete()).toBe(false)
    })

    it('returns true on step 1 when trimSizeId set and pageCount in valid range', () => {
      const store = useQuoteStore()
      store.updateQuoteState({ trimSizeId: 'uuid-1', pageCount: 200 })
      store.setPageCountBounds({ minPages: 24, maxPages: 840 })
      expect(store.isCurrentStepComplete()).toBe(true)
    })

    it('returns false on step 2 when coverStyleId is null', () => {
      const store = useQuoteStore()
      store.updateQuoteState({ trimSizeId: 'uuid-1', pageCount: 200 })
      store.goToNextStep()
      expect(store.currentStep).toBe(2)
      expect(store.isCurrentStepComplete()).toBe(false)
    })

    it('returns true on step 2 when coverStyleId is set', () => {
      const store = useQuoteStore()
      store.updateQuoteState({ trimSizeId: 'uuid-1', pageCount: 200, coverStyleId: 'uuid-cs' })
      store.goToNextStep()
      expect(store.isCurrentStepComplete()).toBe(true)
    })

    it('returns true on step 7 when quantity is set', () => {
      const store = useQuoteStore()
      store.updateQuoteState({
        trimSizeId: 'uuid-1', pageCount: 200,
        coverStyleId: 'cs', coverFinishId: 'cf',
        printTypeId: 'pt', paperStockId: 'ps',
        bindingTypeId: 'bt',
      })
      // advance to step 7
      for (let i = 0; i < 6; i++) store.goToNextStep()
      expect(store.currentStep).toBe(7)
      store.updateQuoteState({ quantity: 100 })
      expect(store.isCurrentStepComplete()).toBe(true)
    })
  })

  // ─── goToNextStep ────────────────────────────────────────────────────────────

  describe('goToNextStep', () => {
    it('advances when current step is complete', () => {
      const store = useQuoteStore()
      store.updateQuoteState({ trimSizeId: 'uuid-1', pageCount: 200 })
      store.goToNextStep()
      expect(store.currentStep).toBe(2)
    })

    it('does NOT advance when current step is incomplete', () => {
      const store = useQuoteStore()
      store.goToNextStep()
      expect(store.currentStep).toBe(1)
    })

    it('does not advance past the last step', () => {
      const store = useQuoteStore()
      store.updateQuoteState({
        trimSizeId: 'ts', pageCount: 200,
        coverStyleId: 'cs', coverFinishId: 'cf',
        printTypeId: 'pt', paperStockId: 'ps',
        bindingTypeId: 'bt', quantity: 100,
      })
      for (let i = 0; i < 10; i++) store.goToNextStep()
      expect(store.currentStep).toBe(store.totalSteps)
    })
  })

  // ─── goToPreviousStep ────────────────────────────────────────────────────────

  describe('goToPreviousStep', () => {
    it('decrements step', () => {
      const store = useQuoteStore()
      store.updateQuoteState({ trimSizeId: 'uuid-1', pageCount: 200 })
      store.goToNextStep()
      store.goToPreviousStep()
      expect(store.currentStep).toBe(1)
    })

    it('does not go below step 1', () => {
      const store = useQuoteStore()
      store.goToPreviousStep()
      expect(store.currentStep).toBe(1)
    })
  })

  // ─── updateQuoteState ────────────────────────────────────────────────────────

  describe('updateQuoteState', () => {
    it('merges partial updates without clearing other fields', () => {
      const store = useQuoteStore()
      store.updateQuoteState({ trimSizeId: 'uuid-1', pageCount: 200 })
      store.updateQuoteState({ coverStyleId: 'uuid-cs' })
      expect(store.quoteState.trimSizeId).toBe('uuid-1')
      expect(store.quoteState.coverStyleId).toBe('uuid-cs')
    })
  })

  // ─── setPageCountBounds ──────────────────────────────────────────────────────

  describe('setPageCountBounds', () => {
    it('updates min and max pages', () => {
      const store = useQuoteStore()
      store.setPageCountBounds({ minPages: 48, maxPages: 400 })
      expect(store.pageCountBounds.minPages).toBe(48)
      expect(store.pageCountBounds.maxPages).toBe(400)
    })
  })
})

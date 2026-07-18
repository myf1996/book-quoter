<script setup lang="ts">
/**
 * QuoterPage — root page for the book printing quote wizard
 */
import QuoterWizard from '@/components/quoter-wizard.component.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-10 px-4">
    <div class="max-w-5xl mx-auto">
      <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900">Book Printing Quote</h1>
        <p class="text-gray-500 mt-2">Configure your book and get an instant quote.</p>
      </header>

      <QuoterWizard />
    </div>
  </div>
</template>

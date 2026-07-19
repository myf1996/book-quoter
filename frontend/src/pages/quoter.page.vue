<script setup lang="ts">
/**
 * QuoterPage — root page for the book printing quote wizard.
 * Includes a top nav that surfaces auth state and quick actions.
 */
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import QuoterWizard from '@/components/quoter-wizard.component.vue'
import AuthModal from '@/components/auth-modal.component.vue'

const authStore = useAuthStore()
const showAuthModal = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top navigation -->
    <nav class="bg-white border-b border-gray-100 px-4 py-3">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <span class="text-lg font-bold text-gray-900">Book Quoter</span>

        <div class="flex items-center gap-3">
          <template v-if="authStore.isAuthenticated">
            <a
              href="/profile"
              class="text-sm text-gray-500 hidden sm:inline hover:text-gray-700 transition-colors"
            >
              {{ authStore.user?.name }}
            </a>
            <a
              v-if="authStore.user?.role === 'admin'"
              href="/admin"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Admin
            </a>
            <a
              href="/my-quotes"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              My Quotes
            </a>
            <button
              class="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              @click="authStore.logout()"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <button
              class="px-4 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              @click="showAuthModal = true"
            >
              Sign In
            </button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Page content -->
    <div class="py-10 px-4">
      <div class="max-w-5xl mx-auto">
        <header class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-gray-900">Book Printing Quote</h1>
          <p class="text-gray-500 mt-2">Configure your book and get an instant quote.</p>
        </header>

        <QuoterWizard />
      </div>
    </div>

    <!-- Auth modal triggered from Sign In button in nav -->
    <AuthModal v-model="showAuthModal" />
  </div>
</template>

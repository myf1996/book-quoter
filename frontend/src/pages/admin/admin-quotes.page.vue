<script setup lang="ts">
/**
 * AdminQuotesPage — read-only view of all quotes in the system with pagination.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AdminLayout from '@/components/admin-layout.component.vue'
import { api } from '@/utils/helpers.utils'

interface QuoteConfig {
  trimSizeId: string
  coverStyleId: string
  coverFinishId: string
  printTypeId: string
  paperStockId: string
  bindingTypeId: string
}

interface QuoteUser {
  id: string
  name: string
  email: string
}

interface AdminQuote {
  id: string
  config: QuoteConfig
  pageCount: number
  quantity: number
  totalPrice: number
  createdAt: string
  user: QuoteUser | null
}

interface PaginatedQuotes {
  data: AdminQuote[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const router = useRouter()
const authStore = useAuthStore()

const quotes = ref<AdminQuote[]>([])
const isLoading = ref(false)
const fetchError = ref<string | null>(null)

const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const LIMIT = 20

const hasPrev = computed(() => currentPage.value > 1)
const hasNext = computed(() => currentPage.value < totalPages.value)

async function loadQuotes(page = currentPage.value): Promise<void> {
  isLoading.value = true
  fetchError.value = null
  try {
    const { data } = await api.get<PaginatedQuotes>(`/admin/quotes?page=${page}&limit=${LIMIT}`)
    quotes.value = data.data
    currentPage.value = data.page
    totalPages.value = data.totalPages
    total.value = data.total
  } catch {
    fetchError.value = 'Failed to load quotes. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function goToPage(page: number): Promise<void> {
  if (page < 1 || page > totalPages.value) return
  await loadQuotes(page)
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push({ path: '/' })
    return
  }
  await loadQuotes()
})
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 lg:p-8">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h1 class="text-2xl font-bold text-gray-900">All Quotes</h1>
        <span class="text-sm text-gray-500">{{ total }} total</span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <!-- Fetch error -->
      <div
        v-else-if="fetchError"
        class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600"
      >
        {{ fetchError }}
      </div>

      <!-- Empty state -->
      <div
        v-else-if="quotes.length === 0"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center"
      >
        <p class="text-gray-400 text-sm">No quotes have been generated yet.</p>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-[600px]">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th class="px-6 py-3">Quote #</th>
                <th class="px-6 py-3">User</th>
                <th class="px-6 py-3 text-center">Pages</th>
                <th class="px-6 py-3 text-center">Qty</th>
                <th class="px-6 py-3">Total Price</th>
                <th class="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="quote in quotes" :key="quote.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 font-mono text-xs text-indigo-600">#{{ quote.id.slice(0, 8) }}</td>
                <td class="px-6 py-3">
                  <template v-if="quote.user">
                    <p class="font-medium text-gray-800">{{ quote.user.name }}</p>
                    <p class="text-xs text-gray-400">{{ quote.user.email }}</p>
                  </template>
                  <span v-else class="text-gray-400 italic text-xs">Guest</span>
                </td>
                <td class="px-6 py-3 text-center text-gray-700">{{ quote.pageCount }}</td>
                <td class="px-6 py-3 text-center text-gray-700">{{ quote.quantity }}</td>
                <td class="px-6 py-3 font-semibold text-gray-900">{{ formatPrice(quote.totalPrice) }}</td>
                <td class="px-6 py-3 text-gray-500">{{ formatDate(quote.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-between px-6 py-3 border-t border-gray-100"
        >
          <span class="text-xs text-gray-500">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <div class="flex gap-2">
            <button
              :disabled="!hasPrev"
              class="px-3 py-1 text-xs font-medium rounded-lg border transition-colors"
              :class="hasPrev ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-100 text-gray-300 cursor-not-allowed'"
              @click="goToPage(currentPage - 1)"
            >
              Previous
            </button>
            <button
              :disabled="!hasNext"
              class="px-3 py-1 text-xs font-medium rounded-lg border transition-colors"
              :class="hasNext ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-100 text-gray-300 cursor-not-allowed'"
              @click="goToPage(currentPage + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

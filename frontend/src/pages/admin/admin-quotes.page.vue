<script setup lang="ts">
/**
 * AdminQuotesPage — read-only view of all quotes in the system with pagination and user search.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AdminLayout from '@/components/admin-layout.component.vue'
import { api } from '@/utils/helpers.utils'

interface QuoteUser {
  id: string
  name: string
  email: string
}

interface AdminQuote {
  id: string
  pageCount: number
  quantity: number
  totalPrice: number
  discountAmount: number | null
  couponCode: string | null
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

const userSearch = ref('')
const couponFilter = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

const hasPrev = computed(() => currentPage.value > 1)
const hasNext = computed(() => currentPage.value < totalPages.value)

async function loadQuotes(page = currentPage.value): Promise<void> {
  isLoading.value = true
  fetchError.value = null
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
    const trimmed = userSearch.value.trim()
    if (trimmed) params.set('userSearch', trimmed)
    const coupon = couponFilter.value.trim().toUpperCase()
    if (coupon) params.set('couponCode', coupon)
    const { data } = await api.get<PaginatedQuotes>(`/admin/quotes?${params.toString()}`)
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

function onSearchInput(): void {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadQuotes(1), 300)
}

function clearSearch(): void {
  userSearch.value = ''
  loadQuotes(1)
}

function onCouponInput(): void {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadQuotes(1), 300)
}

function clearCouponFilter(): void {
  couponFilter.value = ''
  loadQuotes(1)
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

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 lg:p-8">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h1 class="text-2xl font-bold text-gray-900">All Quotes</h1>
        <span class="text-sm text-gray-500">{{ total }} total</span>
      </div>

      <!-- Filters row -->
      <div class="flex flex-wrap gap-3 mb-4">
        <!-- User search -->
        <div class="relative min-w-[200px] flex-1 max-w-xs">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            v-model="userSearch"
            type="text"
            placeholder="Search by name or email…"
            class="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            @input="onSearchInput"
          />
          <button
            v-if="userSearch"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
            @click="clearSearch"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Coupon filter -->
        <div class="relative min-w-[160px] max-w-[200px]">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <input
            v-model="couponFilter"
            type="text"
            placeholder="Coupon code…"
            class="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            @input="onCouponInput"
          />
          <button
            v-if="couponFilter"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear coupon filter"
            @click="clearCouponFilter"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
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
        <p class="text-gray-400 text-sm">
          {{ userSearch.trim() || couponFilter.trim() ? 'No quotes match the current filters.' : 'No quotes have been generated yet.' }}
        </p>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-[760px]">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th class="px-6 py-3">Quote #</th>
                <th class="px-6 py-3">User</th>
                <th class="px-6 py-3 text-center">Pages</th>
                <th class="px-6 py-3 text-center">Qty</th>
                <th class="px-6 py-3">Coupon</th>
                <th class="px-6 py-3">Total Price</th>
                <th class="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="quote in quotes" :key="quote.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3">
                  <RouterLink
                    :to="`/admin/quotes/${quote.id}`"
                    class="font-mono text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                  >#{{ quote.id.slice(0, 8) }}</RouterLink>
                </td>
                <td class="px-6 py-3">
                  <template v-if="quote.user">
                    <p class="font-medium text-gray-800">{{ quote.user.name }}</p>
                    <p class="text-xs text-gray-400">{{ quote.user.email }}</p>
                  </template>
                  <span v-else class="text-gray-400 italic text-xs">Guest</span>
                </td>
                <td class="px-6 py-3 text-center text-gray-700">{{ quote.pageCount }}</td>
                <td class="px-6 py-3 text-center text-gray-700">{{ quote.quantity }}</td>
                <td class="px-6 py-3">
                  <span v-if="quote.couponCode" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-mono bg-indigo-50 text-indigo-700">
                    {{ quote.couponCode }}
                  </span>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </td>
                <td class="px-6 py-3">
                  <span class="font-semibold text-gray-900">{{ formatPrice(quote.totalPrice) }}</span>
                  <span v-if="quote.discountAmount" class="block text-xs text-green-600">−{{ formatPrice(quote.discountAmount) }}</span>
                </td>
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

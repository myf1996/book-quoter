<script setup lang="ts">
/**
 * MyQuotesPage — lists all saved quotes for the authenticated user.
 * Redirects to the quoter if unauthenticated.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { api } from '@/utils/helpers.utils'

interface PriceBreakdown {
  pageCost: number
  coverCost: number
  bindingCost: number
  subtotal: number
  tax: number
  total: number
}

interface SavedQuote {
  id: string
  trimSize: { id: string; name: string } | null
  coverStyle: { id: string; name: string } | null
  coverFinish: { id: string; name: string } | null
  printType: { id: string; name: string } | null
  paperStock: { id: string; name: string } | null
  bindingType: { id: string; name: string } | null
  pageCount: number
  quantity: number
  totalPrice: number
  createdAt: string
  priceBreakdown?: PriceBreakdown
  couponCode?: string | null
  discountAmount?: number | null
  primaryColor?: string | null
  secondaryColor?: string | null
}

const router = useRouter()
const authStore = useAuthStore()

interface PaginatedQuotes {
  data: SavedQuote[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const quotes = ref<SavedQuote[]>([])
const isLoading = ref(false)
const fetchError = ref<string | null>(null)

const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const LIMIT = 20

const hasPrev = computed(() => currentPage.value > 1)
const hasNext = computed(() => currentPage.value < totalPages.value)

const expandedIds = ref<Set<string>>(new Set())

function toggleBreakdown(quoteId: string): void {
  if (expandedIds.value.has(quoteId)) {
    expandedIds.value.delete(quoteId)
  } else {
    expandedIds.value.add(quoteId)
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'quoter' })
    return
  }
  await loadQuotes()
})

async function loadQuotes(page = currentPage.value): Promise<void> {
  isLoading.value = true
  fetchError.value = null
  try {
    const { data } = await api.get<PaginatedQuotes>(`/quoter/quotes?page=${page}&limit=${LIMIT}`)
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

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <span class="text-lg font-bold text-gray-900">Book Quoter</span>
        <div class="flex items-center gap-3">
          <template v-if="authStore.isAuthenticated">
            <a href="/profile" class="text-sm text-gray-500 hidden sm:inline hover:text-gray-700 transition-colors">
              {{ authStore.user?.name }}
            </a>
            <a v-if="authStore.user?.role === 'admin'" href="/admin" class="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">Admin</a>
            <a href="/my-quotes" class="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">My Quotes</a>
            <button class="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors" @click="authStore.logout(); router.push({ name: 'quoter' })">Logout</button>
          </template>
        </div>
      </div>
    </nav>

    <div class="py-10 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Page header -->
        <header class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">My Quotes</h1>
            <p class="text-gray-500 mt-1">
              <span v-if="!isLoading && total > 0">{{ total }} saved quote{{ total !== 1 ? 's' : '' }}</span>
              <span v-else>Your saved book printing quotes</span>
            </p>
          </div>
          <a
            href="/"
            class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium self-start sm:self-auto shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Quote
          </a>
        </header>

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center py-20">
          <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>

        <!-- Error -->
        <div v-else-if="fetchError" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
          {{ fetchError }}
        </div>

        <!-- Empty state -->
        <div v-else-if="quotes.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">No quotes yet</h2>
          <p class="text-gray-500 mb-6">Configure your book to get an instant price.</p>
          <a href="/" class="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            Get a Quote
          </a>
        </div>

        <!-- Quote cards -->
        <ul v-else class="space-y-4" aria-label="quotes">
          <li
            v-for="quote in quotes"
            :key="quote.id"
            class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
          >
            <!-- Colored top accent bar -->
            <div
              class="h-1.5 w-full"
              :style="{ background: quote.primaryColor && quote.secondaryColor
                ? `linear-gradient(90deg, ${quote.primaryColor} 0%, ${quote.secondaryColor} 100%)`
                : quote.primaryColor
                  ? quote.primaryColor
                  : 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)' }"
            />

            <div class="p-5">
              <!-- Top row: quote ID + date on left, price on right -->
              <div class="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
                      #{{ quote.id.slice(0, 8).toUpperCase() }}
                    </span>
                    <span class="text-gray-200">·</span>
                    <span class="text-xs text-gray-400">{{ formatDate(quote.createdAt) }}</span>
                  </div>
                  <div class="flex items-baseline gap-3">
                    <p class="text-2xl font-bold text-gray-900">{{ formatPrice(quote.totalPrice) }}</p>
                    <p v-if="quote.discountAmount" class="text-sm text-green-600 font-medium">
                      −{{ formatPrice(quote.discountAmount) }} off
                    </p>
                  </div>
                  <p class="text-sm text-gray-500 mt-0.5">
                    {{ quote.pageCount }} pages &nbsp;·&nbsp; {{ quote.quantity.toLocaleString() }} copies
                    <span v-if="quote.totalPrice && quote.quantity" class="text-gray-400">
                      &nbsp;·&nbsp; {{ formatPrice(quote.totalPrice / quote.quantity) }}/copy
                    </span>
                  </p>
                </div>

                <!-- Print type color swatches -->
                <div v-if="quote.primaryColor || quote.secondaryColor" class="flex flex-col items-end gap-1 flex-shrink-0">
                  <div class="flex items-center gap-1.5">
                    <div
                      v-if="quote.primaryColor"
                      class="w-5 h-5 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200"
                      :style="{ background: quote.primaryColor }"
                      :title="`Primary: ${quote.primaryColor}`"
                    />
                    <div
                      v-if="quote.secondaryColor"
                      class="w-5 h-5 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200"
                      :style="{ background: quote.secondaryColor }"
                      :title="`Secondary: ${quote.secondaryColor}`"
                    />
                  </div>
                  <p class="text-xs text-gray-400">{{ quote.printType?.name ?? 'Print' }}</p>
                </div>
              </div>

              <!-- Configuration chips -->
              <div class="flex flex-wrap gap-1.5 mb-4">
                <!-- Trim size chip (special — shows dimensions feel) -->
                <span
                  v-if="quote.trimSize"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="3" width="10" height="14" rx="1" stroke-width="2"/>
                  </svg>
                  {{ quote.trimSize.name }}
                </span>

                <!-- Cover style -->
                <span v-if="quote.coverStyle" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                  {{ quote.coverStyle.name }}
                </span>

                <!-- Cover finish -->
                <span v-if="quote.coverFinish" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                  {{ quote.coverFinish.name }}
                </span>

                <!-- Print type chip — uses primary color as tint if no separate swatch shown -->
                <span
                  v-if="quote.printType && !quote.primaryColor"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600"
                >
                  {{ quote.printType.name }}
                </span>

                <!-- Paper stock -->
                <span v-if="quote.paperStock" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                  {{ quote.paperStock.name }}
                </span>

                <!-- Binding type -->
                <span v-if="quote.bindingType" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                  {{ quote.bindingType.name }}
                </span>

                <!-- Coupon badge -->
                <span v-if="quote.couponCode" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  {{ quote.couponCode }}
                </span>
              </div>

              <!-- Expandable price breakdown -->
              <div v-if="quote.priceBreakdown" class="border-t border-gray-50 pt-3">
                <button
                  class="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-indigo-600 transition-colors"
                  @click="toggleBreakdown(quote.id)"
                >
                  <svg
                    class="w-3.5 h-3.5 transition-transform"
                    :class="expandedIds.has(quote.id) ? 'rotate-90' : ''"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  {{ expandedIds.has(quote.id) ? 'Hide' : 'Show' }} price breakdown
                </button>

                <div
                  v-if="expandedIds.has(quote.id)"
                  class="mt-3 rounded-xl border border-gray-100 overflow-hidden text-sm"
                >
                  <div class="divide-y divide-gray-50">
                    <div class="flex justify-between px-4 py-2 text-gray-500">
                      <span>Page Cost</span><span class="text-gray-800">{{ formatPrice(quote.priceBreakdown.pageCost) }}</span>
                    </div>
                    <div class="flex justify-between px-4 py-2 text-gray-500">
                      <span>Cover Cost</span><span class="text-gray-800">{{ formatPrice(quote.priceBreakdown.coverCost) }}</span>
                    </div>
                    <div class="flex justify-between px-4 py-2 text-gray-500">
                      <span>Binding Cost</span><span class="text-gray-800">{{ formatPrice(quote.priceBreakdown.bindingCost) }}</span>
                    </div>
                    <div class="flex justify-between px-4 py-2 text-gray-500 bg-gray-50">
                      <span>Subtotal</span><span class="text-gray-800">{{ formatPrice(quote.priceBreakdown.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between px-4 py-2 text-gray-500">
                      <span>Tax (8%)</span><span class="text-gray-800">{{ formatPrice(quote.priceBreakdown.tax) }}</span>
                    </div>
                    <div v-if="quote.couponCode && quote.discountAmount" class="flex justify-between px-4 py-2 text-green-600 bg-green-50">
                      <span>{{ quote.couponCode }}</span><span>−{{ formatPrice(quote.discountAmount) }}</span>
                    </div>
                    <div class="flex justify-between px-4 py-2.5 font-semibold bg-gray-50">
                      <span class="text-gray-800">Total</span>
                      <span class="text-indigo-700">{{ formatPrice(quote.totalPrice) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
          <span class="text-sm text-gray-500">Page {{ currentPage }} of {{ totalPages }} &middot; {{ total }} quotes</span>
          <div class="flex gap-2">
            <button
              :disabled="!hasPrev"
              class="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
              :class="hasPrev ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-100 text-gray-300 cursor-not-allowed'"
              @click="goToPage(currentPage - 1)"
            >
              Previous
            </button>
            <button
              :disabled="!hasNext"
              class="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
              :class="hasNext ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-100 text-gray-300 cursor-not-allowed'"
              @click="goToPage(currentPage + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

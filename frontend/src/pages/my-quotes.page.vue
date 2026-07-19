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

// Which quote cards have their breakdown expanded
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

function configSummary(q: SavedQuote): string {
  const parts = [
    q.trimSize?.name ?? 'Unknown',
    q.coverStyle?.name ?? 'Unknown',
    q.coverFinish?.name ?? 'Unknown',
    q.printType?.name ?? 'Unknown',
    q.paperStock?.name ?? 'Unknown',
    q.bindingType?.name ?? 'Unknown',
    `${q.pageCount} pages`,
    `Qty ${q.quantity}`,
  ]
  return parts.join(' · ')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top navigation (mirrors quoter.page.vue) -->
    <nav class="bg-white border-b border-gray-100 px-4 py-3">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
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
              @click="authStore.logout(); router.push({ name: 'quoter' })"
            >
              Logout
            </button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Page body -->
    <div class="py-10 px-4">
      <div class="max-w-4xl mx-auto">
        <header class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">My Quotes</h1>
            <p class="text-gray-500 mt-1">Your saved book printing quotes</p>
          </div>
          <a
            href="/"
            class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm self-start sm:self-auto"
          >
            &#8592; New Quote
          </a>
        </header>

        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center py-20">
          <svg
            class="animate-spin h-8 w-8 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <!-- Error state -->
        <div
          v-else-if="fetchError"
          class="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600"
        >
          {{ fetchError }}
        </div>

        <!-- Empty state -->
        <div
          v-else-if="quotes.length === 0"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center"
        >
          <div class="text-5xl mb-4">&#128218;</div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">No quotes yet</h2>
          <p class="text-gray-500 mb-6">Start a new quote to get an instant price for your book.</p>
          <a
            href="/"
            class="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start a New Quote
          </a>
        </div>

        <!-- Quote list -->
        <ul v-else class="space-y-4" aria-label="quotes">
          <li
            v-for="quote in quotes"
            :key="quote.id"
            class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <!-- Header row: ID + date + total -->
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <div>
                <p class="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                  Quote #{{ quote.id.slice(0, 8) }}
                </p>
                <p class="text-2xl font-bold text-gray-900">{{ formatPrice(quote.totalPrice) }}</p>
                <p class="text-sm text-gray-500 mt-0.5">{{ formatDate(quote.createdAt) }}</p>
              </div>
              <div class="sm:text-right">
                <p class="text-sm font-medium text-gray-700">
                  {{ quote.pageCount }} pages &nbsp;&middot;&nbsp; Qty {{ quote.quantity }}
                </p>
              </div>
            </div>

            <!-- Configuration summary -->
            <p class="text-xs text-gray-500 leading-relaxed mb-3">
              {{ configSummary(quote) }}
            </p>

            <!-- Expandable price breakdown -->
            <div v-if="quote.priceBreakdown">
              <button
                class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                @click="toggleBreakdown(quote.id)"
              >
                {{ expandedIds.has(quote.id) ? 'Hide breakdown' : 'Show breakdown' }}
              </button>

              <div
                v-if="expandedIds.has(quote.id)"
                class="mt-3 bg-gray-50 rounded-xl border border-gray-100 p-4 text-sm space-y-1.5"
              >
                <div class="flex justify-between text-gray-600">
                  <span>Page Cost</span>
                  <span>{{ formatPrice(quote.priceBreakdown.pageCost) }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Cover Cost</span>
                  <span>{{ formatPrice(quote.priceBreakdown.coverCost) }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Binding Cost</span>
                  <span>{{ formatPrice(quote.priceBreakdown.bindingCost) }}</span>
                </div>
                <div class="flex justify-between text-gray-600 border-t border-gray-200 pt-1.5">
                  <span>Subtotal</span>
                  <span>{{ formatPrice(quote.priceBreakdown.subtotal) }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>{{ formatPrice(quote.priceBreakdown.tax) }}</span>
                </div>
                <div class="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5">
                  <span>Total</span>
                  <span>{{ formatPrice(quote.priceBreakdown.total) }}</span>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-between mt-6"
        >
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

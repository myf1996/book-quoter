<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/admin-layout.component.vue'
import { api } from '@/utils/helpers.utils'

interface PriceBreakdown {
  pageCost: number
  coverCost: number
  bindingCost: number
  subtotal: number
  tax: number
  total: number
}

interface QuoteDetail {
  id: string
  createdAt: string
  user: { id: string; name: string; email: string; role: string } | null
  configuration: {
    trimSize: string
    coverStyle: string
    coverFinish: string
    printType: string
    paperStock: string
    bindingType: string
    pageCount: number
    quantity: number
  }
  priceBreakdown: PriceBreakdown
  totalPrice: number
  couponCode: string | null
  discountAmount: number | null
}

const route = useRoute()
const router = useRouter()
const quote = ref<QuoteDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

function formatPrice(val: number): string {
  return '$' + val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const configRows = [
  { label: 'Trim Size', key: 'trimSize' },
  { label: 'Cover Style', key: 'coverStyle' },
  { label: 'Cover Finish', key: 'coverFinish' },
  { label: 'Print Type', key: 'printType' },
  { label: 'Paper Stock', key: 'paperStock' },
  { label: 'Binding Type', key: 'bindingType' },
] as const

onMounted(async () => {
  try {
    const { data } = await api.get<QuoteDetail>(`/admin/quotes/${route.params.id}`)
    quote.value = data
  } catch {
    error.value = 'Failed to load quote details.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AdminLayout>
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Back link -->
      <button
        class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        @click="router.push('/admin/quotes')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Quotes
      </button>

      <!-- Loading / error -->
      <div v-if="loading" class="text-center py-20 text-gray-400">Loading quote details…</div>
      <div v-else-if="error" class="text-center py-20 text-red-500">{{ error }}</div>

      <template v-else-if="quote">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 font-mono">
              #{{ quote.id.slice(0, 8).toUpperCase() }}
            </h1>
            <p class="text-sm text-gray-500 mt-0.5">{{ formatDate(quote.createdAt) }}</p>
          </div>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
            {{ formatPrice(quote.totalPrice) }}
          </span>
        </div>

        <div class="space-y-6">
          <!-- Customer -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-50 bg-gray-50">
              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Customer</h2>
            </div>
            <div class="px-6 py-4">
              <template v-if="quote.user">
                <div class="flex items-center gap-4">
                  <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                    {{ quote.user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ quote.user.name }}</p>
                    <p class="text-sm text-gray-500">{{ quote.user.email }}</p>
                  </div>
                  <span
                    class="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="quote.user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ quote.user.role }}
                  </span>
                </div>
              </template>
              <p v-else class="text-sm text-gray-400 italic">Guest / deleted user</p>
            </div>
          </div>

          <!-- Book Configuration -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-50 bg-gray-50">
              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Book Configuration</h2>
            </div>
            <div class="divide-y divide-gray-50">
              <div
                v-for="row in configRows"
                :key="row.key"
                class="flex items-center justify-between px-6 py-3"
              >
                <span class="text-sm text-gray-500">{{ row.label }}</span>
                <span class="text-sm font-medium text-gray-900">{{ quote.configuration[row.key] }}</span>
              </div>
              <div class="flex items-center justify-between px-6 py-3">
                <span class="text-sm text-gray-500">Pages</span>
                <span class="text-sm font-medium text-gray-900">{{ quote.configuration.pageCount }}</span>
              </div>
              <div class="flex items-center justify-between px-6 py-3">
                <span class="text-sm text-gray-500">Quantity</span>
                <span class="text-sm font-medium text-gray-900">{{ quote.configuration.quantity }} copies</span>
              </div>
            </div>
          </div>

          <!-- Price Breakdown -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-50 bg-gray-50">
              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Price Breakdown</h2>
            </div>
            <div class="px-6 py-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Page Cost</span>
                <span class="text-gray-900">{{ formatPrice(quote.priceBreakdown.pageCost) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Cover Cost</span>
                <span class="text-gray-900">{{ formatPrice(quote.priceBreakdown.coverCost) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Binding Cost</span>
                <span class="text-gray-900">{{ formatPrice(quote.priceBreakdown.bindingCost) }}</span>
              </div>
              <div class="flex justify-between text-sm border-t border-gray-100 pt-2 mt-2">
                <span class="text-gray-500">Subtotal</span>
                <span class="text-gray-900">{{ formatPrice(quote.priceBreakdown.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Tax (8%)</span>
                <span class="text-gray-900">{{ formatPrice(quote.priceBreakdown.tax) }}</span>
              </div>

              <!-- Coupon discount (if applied) -->
              <template v-if="quote.couponCode && quote.discountAmount">
                <div class="flex justify-between text-sm border-t border-gray-100 pt-2 mt-2">
                  <span class="text-gray-500">
                    Subtotal before discount
                  </span>
                  <span class="text-gray-900">{{ formatPrice(quote.priceBreakdown.total) }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="flex items-center gap-2 text-green-700">
                    <span class="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded">
                      {{ quote.couponCode }}
                    </span>
                    Coupon discount
                  </span>
                  <span class="text-green-600 font-medium">−{{ formatPrice(quote.discountAmount) }}</span>
                </div>
              </template>

              <!-- Final total -->
              <div class="flex justify-between font-semibold text-base border-t border-gray-200 pt-3 mt-3">
                <span class="text-gray-800">Total</span>
                <span class="text-indigo-600">{{ formatPrice(quote.totalPrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AdminLayout>
</template>

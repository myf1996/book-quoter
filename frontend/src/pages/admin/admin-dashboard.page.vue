<script setup lang="ts">
/**
 * AdminDashboardPage — overview stats and a recent quotes table for admins.
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AdminLayout from '@/components/admin-layout.component.vue'
import { api } from '@/utils/helpers.utils'

interface DashboardStats {
  totalUsers: number
  totalQuotes: number
  totalRevenue: number
}

interface QuoteUser {
  id: string
  name: string
  email: string
}

interface RecentQuote {
  id: string
  totalPrice: number
  createdAt: string
  user: QuoteUser | null
}

interface PaginatedQuotes {
  data: RecentQuote[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const router = useRouter()
const authStore = useAuthStore()

const stats = ref<DashboardStats | null>(null)
const recentQuotes = ref<RecentQuote[]>([])
const isLoading = ref(false)
const fetchError = ref<string | null>(null)

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

  isLoading.value = true
  fetchError.value = null
  try {
    const [statsRes, quotesRes] = await Promise.all([
      api.get<DashboardStats>('/admin/dashboard'),
      api.get<PaginatedQuotes>('/admin/quotes?page=1&limit=5'),
    ])
    stats.value = statsRes.data
    recentQuotes.value = quotesRes.data.data
  } catch {
    fetchError.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 lg:p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <!-- Loading spinner -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <!-- Error -->
      <div
        v-else-if="fetchError"
        class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-6"
      >
        {{ fetchError }}
      </div>

      <template v-else>
        <!-- Stat cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <!-- Total Users -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Users</p>
              <p class="text-3xl font-bold text-gray-900 mt-0.5">{{ stats?.totalUsers ?? 0 }}</p>
            </div>
          </div>

          <!-- Total Quotes -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Quotes</p>
              <p class="text-3xl font-bold text-gray-900 mt-0.5">{{ stats?.totalQuotes ?? 0 }}</p>
            </div>
          </div>

          <!-- Total Revenue -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Revenue</p>
              <p class="text-3xl font-bold text-gray-900 mt-0.5">{{ formatPrice(stats?.totalRevenue ?? 0) }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Quotes -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-900">Recent Quotes</h2>
          </div>

          <div v-if="recentQuotes.length === 0" class="px-6 py-10 text-center text-sm text-gray-400">
            No quotes yet.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm min-w-[480px]">
              <thead>
                <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th class="px-6 py-3">Quote #</th>
                  <th class="px-6 py-3">User</th>
                  <th class="px-6 py-3">Total Price</th>
                  <th class="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="quote in recentQuotes" :key="quote.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-3 font-medium text-indigo-600">#{{ quote.id }}</td>
                  <td class="px-6 py-3 text-gray-700">
                    <span v-if="quote.user">{{ quote.user.name }}</span>
                    <span v-else class="text-gray-400 italic">Guest</span>
                  </td>
                  <td class="px-6 py-3 font-medium text-gray-900">{{ formatPrice(quote.totalPrice) }}</td>
                  <td class="px-6 py-3 text-gray-500">{{ formatDate(quote.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </AdminLayout>
</template>

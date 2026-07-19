<script setup lang="ts">
/**
 * AdminUsersPage — view, manage roles, and delete users.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AdminLayout from '@/components/admin-layout.component.vue'
import { api } from '@/utils/helpers.utils'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'customer'
  createdAt: string
}

interface PaginatedUsers {
  data: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const router = useRouter()
const authStore = useAuthStore()

const users = ref<AdminUser[]>([])
const isLoading = ref(false)
const fetchError = ref<string | null>(null)
const mutateError = ref<string | null>(null)

const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const LIMIT = 20

const hasPrev = computed(() => currentPage.value > 1)
const hasNext = computed(() => currentPage.value < totalPages.value)

async function loadUsers(page = currentPage.value): Promise<void> {
  isLoading.value = true
  fetchError.value = null
  try {
    const { data } = await api.get<PaginatedUsers>(`/admin/users?page=${page}&limit=${LIMIT}`)
    users.value = data.data
    currentPage.value = data.page
    totalPages.value = data.totalPages
    total.value = data.total
  } catch {
    fetchError.value = 'Failed to load users. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function goToPage(page: number): Promise<void> {
  if (page < 1 || page > totalPages.value) return
  await loadUsers(page)
}

async function toggleRole(user: AdminUser): Promise<void> {
  const newRole: 'admin' | 'customer' = user.role === 'admin' ? 'customer' : 'admin'
  mutateError.value = null
  try {
    await api.patch(`/admin/users/${user.id}/role`, { role: newRole })
    user.role = newRole
  } catch {
    mutateError.value = 'Failed to update user role. Please try again.'
  }
}

async function deleteUser(user: AdminUser): Promise<void> {
  if (!window.confirm(`Delete user "${user.name}" (${user.email})? This cannot be undone.`)) return
  mutateError.value = null
  try {
    await api.delete(`/admin/users/${user.id}`)
    await loadUsers()
  } catch {
    mutateError.value = 'Failed to delete user. Please try again.'
  }
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Coupon history modal ────────────────────────────────────────────────────

interface CouponUsageRecord {
  couponCode: string
  discountType: 'fixed' | 'percentage'
  discountValue: number
  discountAmount: number | null
  usedAt: string
  quoteId: string | null
}

interface CouponHistoryModal {
  user: AdminUser
  usages: CouponUsageRecord[]
}

const couponModal = ref<CouponHistoryModal | null>(null)
const couponLoading = ref(false)

async function viewCouponHistory(user: AdminUser): Promise<void> {
  couponLoading.value = true
  couponModal.value = { user, usages: [] }
  try {
    const { data } = await api.get<CouponUsageRecord[]>(`/admin/users/${user.id}/coupon-usage`)
    couponModal.value = { user, usages: data }
  } catch {
    couponModal.value = null
    mutateError.value = 'Failed to load coupon history.'
  } finally {
    couponLoading.value = false
  }
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function discountLabel(usage: CouponUsageRecord): string {
  return usage.discountType === 'percentage'
    ? `${usage.discountValue}%`
    : formatPrice(usage.discountValue)
}

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push({ path: '/' })
    return
  }
  await loadUsers()
})
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 lg:p-8">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Users</h1>
        <span class="text-sm text-gray-500">{{ total }} total</span>
      </div>

      <!-- Mutate error -->
      <div
        v-if="mutateError"
        class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4"
      >
        {{ mutateError }}
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

      <!-- Table -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="users.length === 0" class="px-6 py-10 text-center text-sm text-gray-400">
          No users found.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm min-w-[640px]">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th class="px-6 py-3">Name</th>
                <th class="px-6 py-3">Email</th>
                <th class="px-6 py-3">Role</th>
                <th class="px-6 py-3">Member Since</th>
                <th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 font-medium text-gray-800">{{ user.name }}</td>
                <td class="px-6 py-3 text-gray-600">{{ user.email }}</td>
                <td class="px-6 py-3">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      user.role === 'admin'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600',
                    ]"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-3 text-gray-500">{{ formatDate(user.createdAt) }}</td>
                <td class="px-6 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      class="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      @click="viewCouponHistory(user)"
                    >
                      Coupons
                    </button>
                    <button
                      class="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap"
                      @click="toggleRole(user)"
                    >
                      {{ user.role === 'admin' ? 'Make Customer' : 'Make Admin' }}
                    </button>
                    <button
                      class="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      @click="deleteUser(user)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
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

  <!-- Coupon history modal -->
  <Teleport to="body">
    <div v-if="couponModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="couponModal = null" />
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-gray-900">Coupon History</h2>
            <p class="text-xs text-gray-400 mt-0.5">{{ couponModal.user.name }} · {{ couponModal.user.email }}</p>
          </div>
          <button
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            @click="couponModal = null"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="overflow-y-auto flex-1">
          <div v-if="couponLoading" class="flex justify-center py-10">
            <svg class="animate-spin h-7 w-7 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <div v-else-if="couponModal.usages.length === 0" class="px-6 py-10 text-center text-sm text-gray-400">
            This user hasn't used any coupons yet.
          </div>
          <div v-else>
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th class="px-6 py-3">Code</th>
                  <th class="px-6 py-3">Discount</th>
                  <th class="px-6 py-3 text-right">Saved</th>
                  <th class="px-6 py-3 text-right">Used On</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="u in couponModal.usages" :key="u.quoteId ?? u.usedAt" class="hover:bg-gray-50">
                  <td class="px-6 py-3 font-mono font-semibold text-indigo-700">{{ u.couponCode }}</td>
                  <td class="px-6 py-3 text-gray-700">{{ discountLabel(u) }}</td>
                  <td class="px-6 py-3 text-right text-green-600 font-medium">
                    {{ u.discountAmount ? `−${formatPrice(u.discountAmount)}` : '—' }}
                  </td>
                  <td class="px-6 py-3 text-right text-gray-500">{{ formatDate(u.usedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

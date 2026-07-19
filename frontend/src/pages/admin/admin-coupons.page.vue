<script setup lang="ts">
/**
 * AdminCouponsPage — create, edit, activate/deactivate, and delete discount coupons.
 * Shows usage count per coupon and allows drilling into the quotes that used each one.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AdminLayout from '@/components/admin-layout.component.vue'
import { api } from '@/utils/helpers.utils'

type DiscountType = 'fixed' | 'percentage'

interface AdminUser {
  id: string
  name: string
  email: string
}

interface Coupon {
  id: string
  code: string
  discountType: DiscountType
  discountValue: number
  applicableUser: AdminUser | null
  maxUsesPerUser: number
  totalMaxUses: number | null
  status: 'active' | 'inactive'
  expiresAt: string | null
  createdAt: string
  usageCount: number
}

interface CouponQuote {
  id: string
  totalPrice: number
  discountAmount: number | null
  couponCode: string | null
  pageCount: number
  quantity: number
  createdAt: string
  user: { name: string; email: string } | null
}

interface PaginatedUsers {
  data: AdminUser[]
}

const router = useRouter()
const authStore = useAuthStore()

const coupons = ref<Coupon[]>([])
const users = ref<AdminUser[]>([])
const isLoading = ref(false)
const fetchError = ref<string | null>(null)
const mutateError = ref<string | null>(null)

// ─── Filters ───────────────────────────────────────────────────────────────────
const codeSearch = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const filteredCoupons = computed(() => {
  const search = codeSearch.value.trim().toUpperCase()
  return coupons.value.filter((c) => {
    const matchesCode = !search || c.code.includes(search)
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && c.status === 'active') ||
      (statusFilter.value === 'inactive' && c.status !== 'active')
    return matchesCode && matchesStatus
  })
})

// ─── Create form ───────────────────────────────────────────────────────────────
const showCreateForm = ref(false)
const creating = ref(false)
const createForm = ref({
  code: '',
  discountType: 'fixed' as DiscountType,
  discountValue: 0,
  applicableUserId: '',
  maxUsesPerUser: 1,
  totalMaxUses: '' as number | '',
  isActive: true,
  expiresAt: '',
})

// ─── Edit ──────────────────────────────────────────────────────────────────────
const editingId = ref<string | null>(null)
const editForm = ref({
  code: '',
  discountType: 'fixed' as DiscountType,
  discountValue: 0,
  applicableUserId: '',
  maxUsesPerUser: 1,
  totalMaxUses: '' as number | '',
  isActive: true,
  expiresAt: '',
})
const editSaving = ref(false)

// ─── Quotes modal ──────────────────────────────────────────────────────────────
const quotesModal = ref<{ coupon: Coupon; quotes: CouponQuote[] } | null>(null)
const quotesLoading = ref(false)

async function loadCoupons(): Promise<void> {
  isLoading.value = true
  fetchError.value = null
  try {
    const { data } = await api.get<Coupon[]>('/admin/coupons')
    coupons.value = data
  } catch {
    fetchError.value = 'Failed to load coupons. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function loadUsers(): Promise<void> {
  try {
    const { data } = await api.get<PaginatedUsers>('/admin/users?limit=200')
    users.value = data.data
  } catch {
    console.error('Failed to load users for coupon form')
  }
}

function openCreateForm(): void {
  showCreateForm.value = true
  editingId.value = null
  createForm.value = {
    code: '',
    discountType: 'fixed',
    discountValue: 0,
    applicableUserId: '',
    maxUsesPerUser: 1,
    totalMaxUses: '',
    isActive: true,
    expiresAt: '',
  }
  mutateError.value = null
  if (users.value.length === 0) loadUsers()
}

function cancelCreate(): void {
  showCreateForm.value = false
  mutateError.value = null
}

async function submitCreate(): Promise<void> {
  if (!createForm.value.code.trim() || createForm.value.discountValue < 0) return
  creating.value = true
  mutateError.value = null
  try {
    await api.post('/admin/coupons', {
      code: createForm.value.code.trim().toUpperCase(),
      discountType: createForm.value.discountType,
      discountValue: createForm.value.discountValue,
      applicableUserId: createForm.value.applicableUserId || undefined,
      maxUsesPerUser: createForm.value.maxUsesPerUser,
      totalMaxUses: createForm.value.totalMaxUses !== '' ? createForm.value.totalMaxUses : undefined,
      isActive: createForm.value.isActive,
      expiresAt: createForm.value.expiresAt || undefined,
    })
    showCreateForm.value = false
    await loadCoupons()
  } catch {
    mutateError.value = 'Failed to create coupon. Code may already exist.'
  } finally {
    creating.value = false
  }
}

function startEdit(coupon: Coupon): void {
  editingId.value = coupon.id
  showCreateForm.value = false
  editForm.value = {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    applicableUserId: coupon.applicableUser?.id ?? '',
    maxUsesPerUser: coupon.maxUsesPerUser,
    totalMaxUses: coupon.totalMaxUses ?? '',
    isActive: coupon.status === 'active',
    expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '',
  }
  mutateError.value = null
  if (users.value.length === 0) loadUsers()
}

function cancelEdit(): void {
  editingId.value = null
  mutateError.value = null
}

async function submitEdit(): Promise<void> {
  if (!editingId.value) return
  editSaving.value = true
  mutateError.value = null
  try {
    await api.patch(`/admin/coupons/${editingId.value}`, {
      code: editForm.value.code.trim().toUpperCase(),
      discountType: editForm.value.discountType,
      discountValue: editForm.value.discountValue,
      applicableUserId: editForm.value.applicableUserId || undefined,
      maxUsesPerUser: editForm.value.maxUsesPerUser,
      totalMaxUses: editForm.value.totalMaxUses !== '' ? editForm.value.totalMaxUses : null,
      isActive: editForm.value.isActive,
      expiresAt: editForm.value.expiresAt || null,
    })
    editingId.value = null
    await loadCoupons()
  } catch {
    mutateError.value = 'Failed to update coupon.'
  } finally {
    editSaving.value = false
  }
}

async function toggleActive(coupon: Coupon): Promise<void> {
  mutateError.value = null
  try {
    await api.patch(`/admin/coupons/${coupon.id}`, { isActive: coupon.status !== 'active' })
    await loadCoupons()
  } catch {
    mutateError.value = 'Failed to update coupon status.'
  }
}

async function deleteCoupon(coupon: Coupon): Promise<void> {
  if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return
  mutateError.value = null
  try {
    await api.delete(`/admin/coupons/${coupon.id}`)
    await loadCoupons()
  } catch {
    mutateError.value = 'Failed to delete coupon.'
  }
}

async function viewQuotes(coupon: Coupon): Promise<void> {
  quotesLoading.value = true
  quotesModal.value = { coupon, quotes: [] }
  try {
    const { data } = await api.get<CouponQuote[]>(`/admin/coupons/${coupon.id}/quotes`)
    quotesModal.value = { coupon, quotes: data }
  } catch {
    quotesModal.value = null
    mutateError.value = 'Failed to load quotes for this coupon.'
  } finally {
    quotesLoading.value = false
  }
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function formatDate(isoString: string | null): string {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function formatDatetime(isoString: string | null): string {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function discountLabel(coupon: Coupon): string {
  return coupon.discountType === 'percentage'
    ? `${coupon.discountValue}%`
    : formatPrice(coupon.discountValue)
}

function isExpired(coupon: Coupon): boolean {
  return !!coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
}

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push({ path: '/' })
    return
  }
  await loadCoupons()
})
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 lg:p-8">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Coupons</h1>
        <button
          class="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          @click="openCreateForm"
        >
          + Create Coupon
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-4">
        <!-- Code search -->
        <div class="relative min-w-[200px] flex-1 max-w-xs">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            v-model="codeSearch"
            type="text"
            placeholder="Search by code…"
            class="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            v-if="codeSearch"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
            @click="codeSearch = ''"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Status filter -->
        <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-1 py-1">
          <button
            v-for="opt in [{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]"
            :key="opt.value"
            :class="[
              'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
              statusFilter === opt.value
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:text-gray-700',
            ]"
            @click="statusFilter = opt.value as 'all' | 'active' | 'inactive'"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Mutate error -->
      <div
        v-if="mutateError"
        class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4"
      >
        {{ mutateError }}
      </div>

      <!-- Create form -->
      <div v-if="showCreateForm" class="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 mb-6">
        <h2 class="text-base font-semibold text-gray-900 mb-4">New Coupon</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Code *</label>
            <input
              v-model="createForm.code"
              type="text"
              placeholder="e.g. SAVE10"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Discount Type *</label>
            <select
              v-model="createForm.discountType"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="fixed">Fixed ($)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">
              Value * {{ createForm.discountType === 'percentage' ? '(%)' : '($)' }}
            </label>
            <input
              v-model.number="createForm.discountValue"
              type="number"
              min="0"
              :max="createForm.discountType === 'percentage' ? 100 : undefined"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Applicable To</label>
            <select
              v-model="createForm.applicableUserId"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Users</option>
              <option v-for="u in users" :key="u.id" :value="u.id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Max Uses Per User</label>
            <input
              v-model.number="createForm.maxUsesPerUser"
              type="number"
              min="1"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Total Max Uses (blank = unlimited)</label>
            <input
              v-model.number="createForm.totalMaxUses"
              type="number"
              min="1"
              placeholder="Unlimited"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Expires At (optional)</label>
            <input
              v-model="createForm.expiresAt"
              type="datetime-local"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="flex items-end gap-3 pb-0.5">
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input v-model="createForm.isActive" type="checkbox" class="rounded accent-indigo-600" />
              <span class="text-gray-700">Active</span>
            </label>
          </div>
        </div>
        <div class="flex gap-3 mt-5">
          <button
            :disabled="creating || !createForm.code.trim()"
            class="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            @click="submitCreate"
          >
            {{ creating ? 'Creating…' : 'Create Coupon' }}
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            @click="cancelCreate"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Edit form -->
      <div v-if="editingId" class="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 mb-6">
        <h2 class="text-base font-semibold text-gray-900 mb-4">Edit Coupon — {{ editForm.code }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Code</label>
            <input
              v-model="editForm.code"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
            <select
              v-model="editForm.discountType"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="fixed">Fixed ($)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">
              Value {{ editForm.discountType === 'percentage' ? '(%)' : '($)' }}
            </label>
            <input
              v-model.number="editForm.discountValue"
              type="number"
              min="0"
              :max="editForm.discountType === 'percentage' ? 100 : undefined"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Applicable To</label>
            <select
              v-model="editForm.applicableUserId"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Users</option>
              <option v-for="u in users" :key="u.id" :value="u.id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Max Uses Per User</label>
            <input
              v-model.number="editForm.maxUsesPerUser"
              type="number"
              min="1"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Total Max Uses (blank = unlimited)</label>
            <input
              v-model.number="editForm.totalMaxUses"
              type="number"
              min="1"
              placeholder="Unlimited"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Expires At</label>
            <input
              v-model="editForm.expiresAt"
              type="datetime-local"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="flex items-end gap-3 pb-0.5">
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input v-model="editForm.isActive" type="checkbox" class="rounded accent-indigo-600" />
              <span class="text-gray-700">Active</span>
            </label>
          </div>
        </div>
        <div class="flex gap-3 mt-5">
          <button
            :disabled="editSaving"
            class="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            @click="submitEdit"
          >
            {{ editSaving ? 'Saving…' : 'Save Changes' }}
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            @click="cancelEdit"
          >
            Cancel
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
      <div v-else-if="fetchError" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
        {{ fetchError }}
      </div>

      <!-- Empty -->
      <div v-else-if="filteredCoupons.length === 0 && !showCreateForm" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
        <p class="text-gray-400 text-sm">{{ coupons.length === 0 ? 'No coupons yet. Click "Create Coupon" to add one.' : 'No coupons match the current filters.' }}</p>
      </div>

      <!-- Table -->
      <div v-else-if="filteredCoupons.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-[800px]">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th class="px-6 py-3">Code</th>
                <th class="px-6 py-3">Discount</th>
                <th class="px-6 py-3">For</th>
                <th class="px-6 py-3 text-center">Uses / User</th>
                <th class="px-6 py-3 text-center">Quotes Used</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3">Expires</th>
                <th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="coupon in filteredCoupons"
                :key="coupon.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-3 font-mono font-semibold text-indigo-700">{{ coupon.code }}</td>
                <td class="px-6 py-3 font-medium text-gray-800">{{ discountLabel(coupon) }}</td>
                <td class="px-6 py-3">
                  <span v-if="coupon.applicableUser" class="text-gray-700">
                    {{ coupon.applicableUser.name }}
                    <span class="block text-xs text-gray-400">{{ coupon.applicableUser.email }}</span>
                  </span>
                  <span v-else class="text-gray-400 text-xs">All users</span>
                </td>
                <td class="px-6 py-3 text-center text-gray-600">
                  {{ coupon.maxUsesPerUser }}
                </td>
                <td class="px-6 py-3 text-center">
                  <button
                    class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    @click="viewQuotes(coupon)"
                  >
                    {{ coupon.usageCount }}
                    {{ coupon.totalMaxUses !== null ? ` / ${coupon.totalMaxUses}` : '' }}
                  </button>
                </td>
                <td class="px-6 py-3">
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      isExpired(coupon)
                        ? 'bg-orange-100 text-orange-700'
                        : coupon.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500',
                    ]"
                  >
                    {{ isExpired(coupon) ? 'Expired' : coupon.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-3 text-gray-500 text-xs">{{ formatDatetime(coupon.expiresAt) }}</td>
                <td class="px-6 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      :class="[
                        'px-3 py-1 text-xs font-medium rounded-lg border transition-colors',
                        coupon.status === 'active'
                          ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                          : 'text-green-600 border-green-200 hover:bg-green-50',
                      ]"
                      @click="toggleActive(coupon)"
                    >
                      {{ coupon.status === 'active' ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button
                      class="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                      @click="startEdit(coupon)"
                    >
                      Edit
                    </button>
                    <button
                      class="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      @click="deleteCoupon(coupon)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Quotes modal -->
    <Teleport to="body">
      <div v-if="quotesModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="quotesModal = null" />
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold text-gray-900">
                Quotes using <span class="font-mono text-indigo-700">{{ quotesModal.coupon.code }}</span>
              </h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ quotesModal.quotes.length }} quotes</p>
            </div>
            <button
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              @click="quotesModal = null"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="overflow-y-auto flex-1">
            <div v-if="quotesLoading" class="flex justify-center py-12">
              <svg class="animate-spin h-7 w-7 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>

            <div v-else-if="quotesModal.quotes.length === 0" class="px-6 py-12 text-center text-sm text-gray-400">
              No quotes have used this coupon yet.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm min-w-[480px]">
                <thead>
                  <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th class="px-6 py-3">Quote #</th>
                    <th class="px-6 py-3">User</th>
                    <th class="px-6 py-3 text-right">Saved</th>
                    <th class="px-6 py-3 text-right">Final Total</th>
                    <th class="px-6 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="q in quotesModal.quotes"
                    :key="q.id"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-6 py-3 font-mono text-xs text-indigo-600">#{{ q.id.slice(0, 8) }}</td>
                    <td class="px-6 py-3">
                      <template v-if="q.user">
                        <p class="font-medium text-gray-800">{{ q.user.name }}</p>
                        <p class="text-xs text-gray-400">{{ q.user.email }}</p>
                      </template>
                      <span v-else class="text-gray-400 italic text-xs">Guest</span>
                    </td>
                    <td class="px-6 py-3 text-right text-green-600 font-medium">
                      {{ q.discountAmount ? `−${formatPrice(q.discountAmount)}` : '—' }}
                    </td>
                    <td class="px-6 py-3 text-right font-semibold text-gray-900">{{ formatPrice(q.totalPrice) }}</td>
                    <td class="px-6 py-3 text-right text-gray-500">{{ formatDate(q.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

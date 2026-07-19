<script setup lang="ts">
/**
 * AdminProductsPage — CRUD management for all 6 product option types.
 * Supports status filtering and activate/deactivate toggling.
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AdminLayout from '@/components/admin-layout.component.vue'
import { api } from '@/utils/helpers.utils'

type ProductStatus = 'active' | 'inactive'

interface ProductOption {
  id: string
  name: string
  status: ProductStatus
}

type TabKey = 'trim-sizes' | 'cover-styles' | 'cover-finishes' | 'print-types' | 'paper-stocks' | 'binding-types'
type StatusFilter = 'all' | ProductStatus

interface Tab {
  key: TabKey
  label: string
}

const tabs: Tab[] = [
  { key: 'trim-sizes', label: 'Trim Sizes' },
  { key: 'cover-styles', label: 'Cover Styles' },
  { key: 'cover-finishes', label: 'Cover Finishes' },
  { key: 'print-types', label: 'Print Types' },
  { key: 'paper-stocks', label: 'Paper Stocks' },
  { key: 'binding-types', label: 'Binding Types' },
]

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<TabKey>('trim-sizes')
const statusFilter = ref<StatusFilter>('all')
const items = ref<ProductOption[]>([])
const isLoading = ref(false)
const fetchError = ref<string | null>(null)
const mutateError = ref<string | null>(null)

const showAddForm = ref(false)
const addName = ref('')
const addSaving = ref(false)

const editingId = ref<string | null>(null)
const editName = ref('')
const editSaving = ref(false)
const togglingId = ref<string | null>(null)

async function loadItems(): Promise<void> {
  isLoading.value = true
  fetchError.value = null
  mutateError.value = null
  try {
    const params = statusFilter.value !== 'all' ? `?status=${statusFilter.value}` : ''
    const { data } = await api.get<ProductOption[]>(`/admin/${activeTab.value}${params}`)
    items.value = data
  } catch {
    fetchError.value = 'Failed to load items. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function switchTab(tab: TabKey): void {
  if (activeTab.value === tab) return
  activeTab.value = tab
  showAddForm.value = false
  addName.value = ''
  editingId.value = null
  editName.value = ''
  mutateError.value = null
  loadItems()
}

function setFilter(f: StatusFilter): void {
  statusFilter.value = f
  loadItems()
}

async function addItem(): Promise<void> {
  if (!addName.value.trim()) return
  addSaving.value = true
  mutateError.value = null
  try {
    await api.post(`/admin/${activeTab.value}`, { name: addName.value.trim() })
    addName.value = ''
    showAddForm.value = false
    await loadItems()
  } catch {
    mutateError.value = 'Failed to add item. Please try again.'
  } finally {
    addSaving.value = false
  }
}

function startEdit(item: ProductOption): void {
  editingId.value = item.id
  editName.value = item.name
  mutateError.value = null
}

function cancelEdit(): void {
  editingId.value = null
  editName.value = ''
  mutateError.value = null
}

async function saveEdit(id: string): Promise<void> {
  if (!editName.value.trim()) return
  editSaving.value = true
  mutateError.value = null
  try {
    await api.patch(`/admin/${activeTab.value}/${id}`, { name: editName.value.trim() })
    editingId.value = null
    editName.value = ''
    await loadItems()
  } catch {
    mutateError.value = 'Failed to update item. Please try again.'
  } finally {
    editSaving.value = false
  }
}

async function toggleStatus(item: ProductOption): Promise<void> {
  togglingId.value = item.id
  mutateError.value = null
  try {
    const newStatus: ProductStatus = item.status === 'active' ? 'inactive' : 'active'
    await api.patch(`/admin/${activeTab.value}/${item.id}`, { status: newStatus })
    await loadItems()
  } catch {
    mutateError.value = 'Failed to update status. Please try again.'
  } finally {
    togglingId.value = null
  }
}

async function deleteItem(id: string, name: string): Promise<void> {
  if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
  mutateError.value = null
  try {
    await api.delete(`/admin/${activeTab.value}/${id}`)
    await loadItems()
  } catch {
    mutateError.value = 'Failed to delete item. Please try again.'
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push({ path: '/' })
    return
  }
  await loadItems()
})
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 lg:p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Products</h1>

      <!-- Tab bar -->
      <div class="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 flex-wrap">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
            activeTab === tab.key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ]"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Error -->
      <div
        v-if="mutateError"
        class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4"
      >
        {{ mutateError }}
      </div>

      <!-- Main card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <!-- Header row -->
        <div class="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <!-- Status filter pills -->
          <div class="flex gap-1 flex-1 min-w-0">
            <button
              v-for="f in (['all', 'active', 'inactive'] as const)"
              :key="f"
              :class="[
                'px-3 py-1 text-xs font-medium rounded-full border transition-colors capitalize',
                statusFilter === f
                  ? f === 'active'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : f === 'inactive'
                      ? 'bg-gray-100 text-gray-600 border-gray-300'
                      : 'bg-indigo-100 text-indigo-700 border-indigo-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
              ]"
              @click="setFilter(f)"
            >
              {{ f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) }}
            </button>
          </div>
          <h2 class="text-base font-semibold text-gray-900">
            {{ tabs.find((t) => t.key === activeTab)?.label }}
          </h2>
          <button
            class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            @click="showAddForm = !showAddForm; mutateError = null"
          >
            {{ showAddForm ? 'Cancel' : 'Add New' }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center py-16">
          <svg class="animate-spin h-7 w-7 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <!-- Fetch error -->
        <div v-else-if="fetchError" class="px-6 py-10 text-center text-sm text-red-500">
          {{ fetchError }}
        </div>

        <div v-else class="overflow-x-auto">
        <table class="w-full text-sm min-w-[520px]">
          <thead>
            <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <th class="px-6 py-3 w-14 hidden sm:table-cell">ID</th>
              <th class="px-6 py-3">Name</th>
              <th class="px-6 py-3 w-24 text-center">Status</th>
              <th class="px-6 py-3 w-52 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <!-- Add form row -->
            <tr v-if="showAddForm" class="bg-indigo-50">
              <td class="px-6 py-3 text-gray-400 text-xs hidden sm:table-cell">New</td>
              <td class="px-6 py-3">
                <input
                  v-model="addName"
                  type="text"
                  placeholder="Enter name"
                  class="w-full border border-indigo-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  @keyup.enter="addItem"
                  @keyup.escape="showAddForm = false; addName = ''"
                />
              </td>
              <td class="px-6 py-3 text-center text-xs text-gray-400">inactive</td>
              <td class="px-6 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    :disabled="addSaving || !addName.trim()"
                    class="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    @click="addItem"
                  >
                    {{ addSaving ? 'Saving…' : 'Save' }}
                  </button>
                  <button
                    class="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    @click="showAddForm = false; addName = ''"
                  >
                    Cancel
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="items.length === 0 && !showAddForm">
              <td colspan="4" class="px-6 py-10 text-center text-sm text-gray-400">
                No items found. {{ statusFilter !== 'all' ? 'Try changing the filter.' : 'Click "Add New" to create one.' }}
              </td>
            </tr>

            <!-- Data rows -->
            <tr
              v-for="item in items"
              :key="item.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-3 text-gray-400 text-xs font-mono hidden sm:table-cell">{{ item.id }}</td>
              <td class="px-6 py-3">
                <input
                  v-if="editingId === item.id"
                  v-model="editName"
                  type="text"
                  class="w-full border border-indigo-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  @keyup.enter="saveEdit(item.id)"
                  @keyup.escape="cancelEdit"
                />
                <span v-else class="font-medium text-gray-800">{{ item.name }}</span>
              </td>

              <!-- Status badge -->
              <td class="px-6 py-3 text-center">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    item.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500',
                  ]"
                >
                  {{ item.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-3 text-right">
                <!-- Edit save/cancel -->
                <div v-if="editingId === item.id" class="flex items-center justify-end gap-2">
                  <button
                    :disabled="editSaving || !editName.trim()"
                    class="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    @click="saveEdit(item.id)"
                  >
                    {{ editSaving ? 'Saving…' : 'Save' }}
                  </button>
                  <button
                    class="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    @click="cancelEdit"
                  >
                    Cancel
                  </button>
                </div>
                <!-- Normal actions -->
                <div v-else class="flex items-center justify-end gap-2">
                  <!-- Activate / Deactivate -->
                  <button
                    :disabled="togglingId === item.id"
                    :class="[
                      'px-3 py-1 text-xs font-medium rounded-lg border transition-colors disabled:opacity-60',
                      item.status === 'active'
                        ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                        : 'text-green-600 border-green-200 hover:bg-green-50',
                    ]"
                    @click="toggleStatus(item)"
                  >
                    {{ togglingId === item.id ? '…' : item.status === 'active' ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button
                    class="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                    @click="startEdit(item)"
                  >
                    Edit
                  </button>
                  <button
                    class="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    @click="deleteItem(item.id, item.name)"
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
  </AdminLayout>
</template>

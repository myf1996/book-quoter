<script setup lang="ts">
/**
 * AdminProductsPage — CRUD management for all 6 product option types.
 * Shows tab-specific extra columns (TrimSize dimensions, PaperStock weight,
 * PrintType colours). Supports status filtering and activate/deactivate toggling.
 */
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AdminLayout from '@/components/admin-layout.component.vue'
import { api } from '@/utils/helpers.utils'

type ProductStatus = 'active' | 'inactive'

interface ProductOption {
  id: string
  name: string
  status: ProductStatus
  width?: string | null
  height?: string | null
  minPages?: number | null
  maxPages?: number | null
  weight?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
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
const editWidth = ref('')
const editHeight = ref('')
const editMinPages = ref('')
const editMaxPages = ref('')
const editWeight = ref('')
const editPrimaryColor = ref('')
const editSecondaryColor = ref('')
const editSaving = ref(false)
const togglingId = ref<string | null>(null)

const isTrimSizes = computed(() => activeTab.value === 'trim-sizes')
const isPrintTypes = computed(() => activeTab.value === 'print-types')
const isPaperStocks = computed(() => activeTab.value === 'paper-stocks')

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
  clearEditFields()
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

function clearEditFields(): void {
  editName.value = ''
  editWidth.value = ''
  editHeight.value = ''
  editMinPages.value = ''
  editMaxPages.value = ''
  editWeight.value = ''
  editPrimaryColor.value = ''
  editSecondaryColor.value = ''
}

function startEdit(item: ProductOption): void {
  editingId.value = item.id
  editName.value = item.name
  editWidth.value = item.width ?? ''
  editHeight.value = item.height ?? ''
  editMinPages.value = item.minPages != null ? String(item.minPages) : ''
  editMaxPages.value = item.maxPages != null ? String(item.maxPages) : ''
  editWeight.value = item.weight ?? ''
  editPrimaryColor.value = item.primaryColor ?? ''
  editSecondaryColor.value = item.secondaryColor ?? ''
  mutateError.value = null
}

function cancelEdit(): void {
  editingId.value = null
  clearEditFields()
  mutateError.value = null
}

async function saveEdit(id: string): Promise<void> {
  if (!editName.value.trim()) return
  editSaving.value = true
  mutateError.value = null
  try {
    const payload: Record<string, unknown> = { name: editName.value.trim() }

    if (isTrimSizes.value) {
      if (editWidth.value) payload.width = parseFloat(editWidth.value)
      if (editHeight.value) payload.height = parseFloat(editHeight.value)
      if (editMinPages.value) payload.minPages = parseInt(editMinPages.value, 10)
      if (editMaxPages.value) payload.maxPages = parseInt(editMaxPages.value, 10)
    } else if (isPaperStocks.value) {
      if (editWeight.value) payload.weight = editWeight.value.trim()
    } else if (isPrintTypes.value) {
      if (editPrimaryColor.value) payload.primaryColor = editPrimaryColor.value
      if (editSecondaryColor.value) payload.secondaryColor = editSecondaryColor.value
    }

    await api.patch(`/admin/${activeTab.value}/${id}`, payload)
    editingId.value = null
    clearEditFields()
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

function colorSwatch(hex: string | null | undefined): string {
  return hex ?? '#e5e7eb'
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
          <table class="w-full text-sm min-w-[560px]">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th class="px-6 py-3 w-14 hidden sm:table-cell">ID</th>
                <th class="px-6 py-3">Name</th>
                <!-- TrimSize extras -->
                <template v-if="isTrimSizes">
                  <th class="px-3 py-3 w-16 text-right">W&quot;</th>
                  <th class="px-3 py-3 w-16 text-right">H&quot;</th>
                  <th class="px-3 py-3 w-20 text-right">Min Pg</th>
                  <th class="px-3 py-3 w-20 text-right">Max Pg</th>
                </template>
                <!-- PaperStock extras -->
                <th v-else-if="isPaperStocks" class="px-3 py-3 w-28">Weight</th>
                <!-- PrintType extras -->
                <template v-else-if="isPrintTypes">
                  <th class="px-3 py-3 w-24 text-center">Primary</th>
                  <th class="px-3 py-3 w-24 text-center">Secondary</th>
                </template>
                <th class="px-6 py-3 w-24 text-center">Status</th>
                <th class="px-6 py-3 w-52 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <!-- Add form row -->
              <tr v-if="showAddForm" class="bg-indigo-50">
                <td class="px-6 py-3 text-gray-400 text-xs hidden sm:table-cell">New</td>
                <td class="px-6 py-3" :colspan="isTrimSizes ? 5 : (isPrintTypes ? 3 : (isPaperStocks ? 2 : 1))">
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
                <td
                  :colspan="isTrimSizes ? 7 : (isPrintTypes ? 6 : (isPaperStocks ? 5 : 4))"
                  class="px-6 py-10 text-center text-sm text-gray-400"
                >
                  No items found. {{ statusFilter !== 'all' ? 'Try changing the filter.' : 'Click "Add New" to create one.' }}
                </td>
              </tr>

              <!-- Data rows -->
              <tr
                v-for="item in items"
                :key="item.id"
                class="hover:bg-gray-50 transition-colors"
                :class="editingId === item.id ? 'bg-indigo-50/40' : ''"
              >
                <td class="px-6 py-3 text-gray-400 text-xs font-mono hidden sm:table-cell">{{ item.id }}</td>

                <!-- Name cell -->
                <td class="px-6 py-3">
                  <div class="flex flex-col gap-2">
                    <input
                      v-if="editingId === item.id"
                      v-model="editName"
                      type="text"
                      class="w-full border border-indigo-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      @keyup.enter="saveEdit(item.id)"
                      @keyup.escape="cancelEdit"
                    />
                    <span v-else class="font-medium text-gray-800">{{ item.name }}</span>
                  </div>
                </td>

                <!-- TrimSize extra cells -->
                <template v-if="isTrimSizes">
                  <td class="px-3 py-3 text-right">
                    <input
                      v-if="editingId === item.id"
                      v-model="editWidth"
                      type="number"
                      step="0.25"
                      min="1"
                      placeholder="W""
                      class="w-16 border border-indigo-300 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <span v-else class="text-gray-600 text-xs">{{ item.width ?? '—' }}</span>
                  </td>
                  <td class="px-3 py-3 text-right">
                    <input
                      v-if="editingId === item.id"
                      v-model="editHeight"
                      type="number"
                      step="0.25"
                      min="1"
                      placeholder="H""
                      class="w-16 border border-indigo-300 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <span v-else class="text-gray-600 text-xs">{{ item.height ?? '—' }}</span>
                  </td>
                  <td class="px-3 py-3 text-right">
                    <input
                      v-if="editingId === item.id"
                      v-model="editMinPages"
                      type="number"
                      min="1"
                      placeholder="Min"
                      class="w-16 border border-indigo-300 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <span v-else class="text-gray-600 text-xs">{{ item.minPages ?? '—' }}</span>
                  </td>
                  <td class="px-3 py-3 text-right">
                    <input
                      v-if="editingId === item.id"
                      v-model="editMaxPages"
                      type="number"
                      min="1"
                      placeholder="Max"
                      class="w-16 border border-indigo-300 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <span v-else class="text-gray-600 text-xs">{{ item.maxPages ?? '—' }}</span>
                  </td>
                </template>

                <!-- PaperStock extra cell -->
                <td v-else-if="isPaperStocks" class="px-3 py-3">
                  <input
                    v-if="editingId === item.id"
                    v-model="editWeight"
                    type="text"
                    placeholder="e.g. 60lb"
                    class="w-24 border border-indigo-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                  <span v-else class="text-gray-600 text-xs">{{ item.weight ?? '—' }}</span>
                </td>

                <!-- PrintType extra cells -->
                <template v-else-if="isPrintTypes">
                  <td class="px-3 py-3 text-center">
                    <div v-if="editingId === item.id" class="flex items-center gap-1 justify-center">
                      <input
                        v-model="editPrimaryColor"
                        type="color"
                        class="w-8 h-7 rounded border border-indigo-300 cursor-pointer p-0.5"
                      />
                      <input
                        v-model="editPrimaryColor"
                        type="text"
                        maxlength="7"
                        placeholder="#000000"
                        class="w-20 border border-indigo-300 rounded px-1.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </div>
                    <div v-else-if="item.primaryColor" class="flex items-center justify-center gap-1.5">
                      <div
                        class="w-5 h-5 rounded-full border border-gray-200 shadow-sm flex-shrink-0"
                        :style="{ background: colorSwatch(item.primaryColor) }"
                      />
                      <span class="text-xs font-mono text-gray-500">{{ item.primaryColor }}</span>
                    </div>
                    <span v-else class="text-gray-300 text-xs">—</span>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <div v-if="editingId === item.id" class="flex items-center gap-1 justify-center">
                      <input
                        v-model="editSecondaryColor"
                        type="color"
                        class="w-8 h-7 rounded border border-indigo-300 cursor-pointer p-0.5"
                      />
                      <input
                        v-model="editSecondaryColor"
                        type="text"
                        maxlength="7"
                        placeholder="#FFFFFF"
                        class="w-20 border border-indigo-300 rounded px-1.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </div>
                    <div v-else-if="item.secondaryColor" class="flex items-center justify-center gap-1.5">
                      <div
                        class="w-5 h-5 rounded-full border border-gray-200 shadow-sm flex-shrink-0"
                        :style="{ background: colorSwatch(item.secondaryColor) }"
                      />
                      <span class="text-xs font-mono text-gray-500">{{ item.secondaryColor }}</span>
                    </div>
                    <span v-else class="text-gray-300 text-xs">—</span>
                  </td>
                </template>

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
                  <div v-else class="flex items-center justify-end gap-2">
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

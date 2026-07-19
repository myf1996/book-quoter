<script setup lang="ts">
/**
 * AdminPricingPage — manage page rates, cover rates, and binding rates.
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AdminLayout from '@/components/admin-layout.component.vue'
import { api } from '@/utils/helpers.utils'

// ---- Shared product option type ----
interface ProductOption {
  id: string
  name: string
}

// ---- Page Rates ----
interface PageRate {
  id: string
  printType: ProductOption
  paperStock: ProductOption
  ratePerPage: number
}

interface PageRatePayload {
  printTypeId: string
  paperStockId: string
  ratePerPage: number
}

// ---- Cover Rates ----
interface CoverRate {
  id: string
  coverStyle: ProductOption
  coverFinish: ProductOption
  basePrice: number
}

interface CoverRatePayload {
  coverStyleId: string
  coverFinishId: string
  basePrice: number
}

// ---- Binding Rates ----
interface BindingRate {
  id: string
  bindingType: ProductOption
  surcharge: number
}

interface BindingRatePayload {
  bindingTypeId: string
  surcharge: number
}

const router = useRouter()
const authStore = useAuthStore()

// Product lookup options
const printTypes = ref<ProductOption[]>([])
const paperStocks = ref<ProductOption[]>([])
const coverStyles = ref<ProductOption[]>([])
const coverFinishes = ref<ProductOption[]>([])
const bindingTypes = ref<ProductOption[]>([])

// Page Rates state
const pageRates = ref<PageRate[]>([])
const pageRatesLoading = ref(false)
const pageRatesError = ref<string | null>(null)
const showAddPageRate = ref(false)
const editingPageRateId = ref<string | null>(null)
const pageRateForm = ref<PageRatePayload>({ printTypeId: '', paperStockId: '', ratePerPage: 0 })
const pageRateSaving = ref(false)

// Cover Rates state
const coverRates = ref<CoverRate[]>([])
const coverRatesLoading = ref(false)
const coverRatesError = ref<string | null>(null)
const showAddCoverRate = ref(false)
const editingCoverRateId = ref<string | null>(null)
const coverRateForm = ref<CoverRatePayload>({ coverStyleId: '', coverFinishId: '', basePrice: 0 })
const coverRateSaving = ref(false)

// Binding Rates state
const bindingRates = ref<BindingRate[]>([])
const bindingRatesLoading = ref(false)
const bindingRatesError = ref<string | null>(null)
const showAddBindingRate = ref(false)
const editingBindingRateId = ref<string | null>(null)
const bindingRateForm = ref<BindingRatePayload>({ bindingTypeId: '', surcharge: 0 })
const bindingRateSaving = ref(false)

// ---- Load all data ----
async function loadAll(): Promise<void> {
  try {
    const [ptRes, psRes, csRes, cfRes, btRes] = await Promise.all([
      api.get<ProductOption[]>('/products/print-types'),
      api.get<ProductOption[]>('/products/paper-stocks'),
      api.get<ProductOption[]>('/products/cover-styles'),
      api.get<ProductOption[]>('/products/cover-finishes'),
      api.get<ProductOption[]>('/products/binding-types'),
    ])
    printTypes.value = ptRes.data
    paperStocks.value = psRes.data
    coverStyles.value = csRes.data
    coverFinishes.value = cfRes.data
    bindingTypes.value = btRes.data
  } catch {
    // Non-fatal — dropdowns will be empty
  }

  await Promise.all([loadPageRates(), loadCoverRates(), loadBindingRates()])
}

// ---- Page Rates CRUD ----
async function loadPageRates(): Promise<void> {
  pageRatesLoading.value = true
  pageRatesError.value = null
  try {
    const { data } = await api.get<PageRate[]>('/admin/page-rates')
    pageRates.value = data
  } catch {
    pageRatesError.value = 'Failed to load page rates.'
  } finally {
    pageRatesLoading.value = false
  }
}

function resetPageRateForm(): void {
  pageRateForm.value = { printTypeId: '', paperStockId: '', ratePerPage: 0 }
}

function startAddPageRate(): void {
  resetPageRateForm()
  editingPageRateId.value = null
  showAddPageRate.value = true
}

function startEditPageRate(rate: PageRate): void {
  pageRateForm.value = {
    printTypeId: rate.printType.id,
    paperStockId: rate.paperStock.id,
    ratePerPage: rate.ratePerPage,
  }
  editingPageRateId.value = rate.id
  showAddPageRate.value = false
}

function cancelPageRate(): void {
  showAddPageRate.value = false
  editingPageRateId.value = null
  resetPageRateForm()
  pageRatesError.value = null
}

async function savePageRate(): Promise<void> {
  pageRateSaving.value = true
  pageRatesError.value = null
  try {
    if (editingPageRateId.value !== null) {
      await api.patch(`/admin/page-rates/${editingPageRateId.value}`, pageRateForm.value)
    } else {
      await api.post('/admin/page-rates', pageRateForm.value)
    }
    cancelPageRate()
    await loadPageRates()
  } catch {
    pageRatesError.value = 'Failed to save page rate.'
  } finally {
    pageRateSaving.value = false
  }
}

async function deletePageRate(id: string): Promise<void> {
  if (!window.confirm('Delete this page rate?')) return
  pageRatesError.value = null
  try {
    await api.delete(`/admin/page-rates/${id}`)
    await loadPageRates()
  } catch {
    pageRatesError.value = 'Failed to delete page rate.'
  }
}

// ---- Cover Rates CRUD ----
async function loadCoverRates(): Promise<void> {
  coverRatesLoading.value = true
  coverRatesError.value = null
  try {
    const { data } = await api.get<CoverRate[]>('/admin/cover-rates')
    coverRates.value = data
  } catch {
    coverRatesError.value = 'Failed to load cover rates.'
  } finally {
    coverRatesLoading.value = false
  }
}

function resetCoverRateForm(): void {
  coverRateForm.value = { coverStyleId: '', coverFinishId: '', basePrice: 0 }
}

function startAddCoverRate(): void {
  resetCoverRateForm()
  editingCoverRateId.value = null
  showAddCoverRate.value = true
}

function startEditCoverRate(rate: CoverRate): void {
  coverRateForm.value = {
    coverStyleId: rate.coverStyle.id,
    coverFinishId: rate.coverFinish.id,
    basePrice: rate.basePrice,
  }
  editingCoverRateId.value = rate.id
  showAddCoverRate.value = false
}

function cancelCoverRate(): void {
  showAddCoverRate.value = false
  editingCoverRateId.value = null
  resetCoverRateForm()
  coverRatesError.value = null
}

async function saveCoverRate(): Promise<void> {
  coverRateSaving.value = true
  coverRatesError.value = null
  try {
    if (editingCoverRateId.value !== null) {
      await api.patch(`/admin/cover-rates/${editingCoverRateId.value}`, coverRateForm.value)
    } else {
      await api.post('/admin/cover-rates', coverRateForm.value)
    }
    cancelCoverRate()
    await loadCoverRates()
  } catch {
    coverRatesError.value = 'Failed to save cover rate.'
  } finally {
    coverRateSaving.value = false
  }
}

async function deleteCoverRate(id: string): Promise<void> {
  if (!window.confirm('Delete this cover rate?')) return
  coverRatesError.value = null
  try {
    await api.delete(`/admin/cover-rates/${id}`)
    await loadCoverRates()
  } catch {
    coverRatesError.value = 'Failed to delete cover rate.'
  }
}

// ---- Binding Rates CRUD ----
async function loadBindingRates(): Promise<void> {
  bindingRatesLoading.value = true
  bindingRatesError.value = null
  try {
    const { data } = await api.get<BindingRate[]>('/admin/binding-rates')
    bindingRates.value = data
  } catch {
    bindingRatesError.value = 'Failed to load binding rates.'
  } finally {
    bindingRatesLoading.value = false
  }
}

function resetBindingRateForm(): void {
  bindingRateForm.value = { bindingTypeId: '', surcharge: 0 }
}

function startAddBindingRate(): void {
  resetBindingRateForm()
  editingBindingRateId.value = null
  showAddBindingRate.value = true
}

function startEditBindingRate(rate: BindingRate): void {
  bindingRateForm.value = {
    bindingTypeId: rate.bindingType.id,
    surcharge: rate.surcharge,
  }
  editingBindingRateId.value = rate.id
  showAddBindingRate.value = false
}

function cancelBindingRate(): void {
  showAddBindingRate.value = false
  editingBindingRateId.value = null
  resetBindingRateForm()
  bindingRatesError.value = null
}

async function saveBindingRate(): Promise<void> {
  bindingRateSaving.value = true
  bindingRatesError.value = null
  try {
    if (editingBindingRateId.value !== null) {
      await api.patch(`/admin/binding-rates/${editingBindingRateId.value}`, bindingRateForm.value)
    } else {
      await api.post('/admin/binding-rates', bindingRateForm.value)
    }
    cancelBindingRate()
    await loadBindingRates()
  } catch {
    bindingRatesError.value = 'Failed to save binding rate.'
  } finally {
    bindingRateSaving.value = false
  }
}

async function deleteBindingRate(id: string): Promise<void> {
  if (!window.confirm('Delete this binding rate?')) return
  bindingRatesError.value = null
  try {
    await api.delete(`/admin/binding-rates/${id}`)
    await loadBindingRates()
  } catch {
    bindingRatesError.value = 'Failed to delete binding rate.'
  }
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push({ path: '/' })
    return
  }
  await loadAll()
})
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 class="text-2xl font-bold text-gray-900">Pricing</h1>

      <!-- ======== PAGE RATES ======== -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900">Page Rates</h2>
          <button
            class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            @click="startAddPageRate"
          >
            Add
          </button>
        </div>

        <div
          v-if="pageRatesError"
          class="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600"
        >
          {{ pageRatesError }}
        </div>

        <!-- Add / edit form -->
        <div v-if="showAddPageRate || editingPageRateId !== null" class="px-6 py-4 bg-indigo-50 border-b border-gray-100">
          <p class="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
            {{ editingPageRateId !== null ? 'Edit Page Rate' : 'Add Page Rate' }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Print Type</label>
              <select
                v-model="pageRateForm.printTypeId"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option :value="0" disabled>Select...</option>
                <option v-for="pt in printTypes" :key="pt.id" :value="pt.id">{{ pt.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Paper Stock</label>
              <select
                v-model="pageRateForm.paperStockId"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option :value="0" disabled>Select...</option>
                <option v-for="ps in paperStocks" :key="ps.id" :value="ps.id">{{ ps.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Rate per Page ($)</label>
              <input
                v-model.number="pageRateForm.ratePerPage"
                type="number"
                min="0"
                step="0.01"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div class="flex gap-2 mt-3">
            <button
              :disabled="pageRateSaving || pageRateForm.printTypeId === '' || pageRateForm.paperStockId === ''"
              class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
              @click="savePageRate"
            >
              {{ pageRateSaving ? 'Saving…' : 'Save' }}
            </button>
            <button
              class="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              @click="cancelPageRate"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="pageRatesLoading" class="flex justify-center py-12">
          <svg class="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm min-w-[560px]">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th class="px-6 py-3 w-16 hidden sm:table-cell">ID</th>
                <th class="px-6 py-3">Print Type</th>
                <th class="px-6 py-3">Paper Stock</th>
                <th class="px-6 py-3">Rate/Page</th>
                <th class="px-6 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="pageRates.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-sm text-gray-400">No page rates yet.</td>
              </tr>
              <tr v-for="rate in pageRates" :key="rate.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 text-gray-400 text-xs font-mono hidden sm:table-cell">{{ rate.id }}</td>
                <td class="px-6 py-3 text-gray-800">{{ rate.printType.name }}</td>
                <td class="px-6 py-3 text-gray-800">{{ rate.paperStock.name }}</td>
                <td class="px-6 py-3 font-medium text-gray-900">{{ formatPrice(rate.ratePerPage) }}/page</td>
                <td class="px-6 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      class="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                      @click="startEditPageRate(rate)"
                    >
                      Edit
                    </button>
                    <button
                      class="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      @click="deletePageRate(rate.id)"
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

      <!-- ======== COVER RATES ======== -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900">Cover Rates</h2>
          <button
            class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            @click="startAddCoverRate"
          >
            Add
          </button>
        </div>

        <div
          v-if="coverRatesError"
          class="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600"
        >
          {{ coverRatesError }}
        </div>

        <!-- Add / edit form -->
        <div v-if="showAddCoverRate || editingCoverRateId !== null" class="px-6 py-4 bg-indigo-50 border-b border-gray-100">
          <p class="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
            {{ editingCoverRateId !== null ? 'Edit Cover Rate' : 'Add Cover Rate' }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Cover Style</label>
              <select
                v-model="coverRateForm.coverStyleId"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option :value="0" disabled>Select...</option>
                <option v-for="cs in coverStyles" :key="cs.id" :value="cs.id">{{ cs.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Cover Finish</label>
              <select
                v-model="coverRateForm.coverFinishId"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option :value="0" disabled>Select...</option>
                <option v-for="cf in coverFinishes" :key="cf.id" :value="cf.id">{{ cf.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Base Price ($)</label>
              <input
                v-model.number="coverRateForm.basePrice"
                type="number"
                min="0"
                step="0.01"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div class="flex gap-2 mt-3">
            <button
              :disabled="coverRateSaving || coverRateForm.coverStyleId === '' || coverRateForm.coverFinishId === ''"
              class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
              @click="saveCoverRate"
            >
              {{ coverRateSaving ? 'Saving…' : 'Save' }}
            </button>
            <button
              class="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              @click="cancelCoverRate"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="coverRatesLoading" class="flex justify-center py-12">
          <svg class="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm min-w-[560px]">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th class="px-6 py-3 w-16 hidden sm:table-cell">ID</th>
                <th class="px-6 py-3">Cover Style</th>
                <th class="px-6 py-3">Cover Finish</th>
                <th class="px-6 py-3">Base Price</th>
                <th class="px-6 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="coverRates.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-sm text-gray-400">No cover rates yet.</td>
              </tr>
              <tr v-for="rate in coverRates" :key="rate.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 text-gray-400 text-xs font-mono hidden sm:table-cell">{{ rate.id }}</td>
                <td class="px-6 py-3 text-gray-800">{{ rate.coverStyle.name }}</td>
                <td class="px-6 py-3 text-gray-800">{{ rate.coverFinish.name }}</td>
                <td class="px-6 py-3 font-medium text-gray-900">{{ formatPrice(rate.basePrice) }}</td>
                <td class="px-6 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      class="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                      @click="startEditCoverRate(rate)"
                    >
                      Edit
                    </button>
                    <button
                      class="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      @click="deleteCoverRate(rate.id)"
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

      <!-- ======== BINDING RATES ======== -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900">Binding Rates</h2>
          <button
            class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            @click="startAddBindingRate"
          >
            Add
          </button>
        </div>

        <div
          v-if="bindingRatesError"
          class="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600"
        >
          {{ bindingRatesError }}
        </div>

        <!-- Add / edit form -->
        <div v-if="showAddBindingRate || editingBindingRateId !== null" class="px-6 py-4 bg-indigo-50 border-b border-gray-100">
          <p class="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
            {{ editingBindingRateId !== null ? 'Edit Binding Rate' : 'Add Binding Rate' }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Binding Type</label>
              <select
                v-model="bindingRateForm.bindingTypeId"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option :value="0" disabled>Select...</option>
                <option v-for="bt in bindingTypes" :key="bt.id" :value="bt.id">{{ bt.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Surcharge ($)</label>
              <input
                v-model.number="bindingRateForm.surcharge"
                type="number"
                min="0"
                step="0.01"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div class="flex gap-2 mt-3">
            <button
              :disabled="bindingRateSaving || bindingRateForm.bindingTypeId === ''"
              class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
              @click="saveBindingRate"
            >
              {{ bindingRateSaving ? 'Saving…' : 'Save' }}
            </button>
            <button
              class="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              @click="cancelBindingRate"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="bindingRatesLoading" class="flex justify-center py-12">
          <svg class="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm min-w-[420px]">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th class="px-6 py-3 w-16 hidden sm:table-cell">ID</th>
                <th class="px-6 py-3">Binding Type</th>
                <th class="px-6 py-3">Surcharge</th>
                <th class="px-6 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="bindingRates.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-sm text-gray-400">No binding rates yet.</td>
              </tr>
              <tr v-for="rate in bindingRates" :key="rate.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 text-gray-400 text-xs font-mono hidden sm:table-cell">{{ rate.id }}</td>
                <td class="px-6 py-3 text-gray-800">{{ rate.bindingType.name }}</td>
                <td class="px-6 py-3 font-medium text-gray-900">{{ formatPrice(rate.surcharge) }}</td>
                <td class="px-6 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      class="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                      @click="startEditBindingRate(rate)"
                    >
                      Edit
                    </button>
                    <button
                      class="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      @click="deleteBindingRate(rate.id)"
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

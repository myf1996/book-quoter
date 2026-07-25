<script setup lang="ts">
/**
 * AdminPricingPage — manage page rates, cover style rates, cover finish rates, and binding rates.
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AdminLayout from '@/components/admin-layout.component.vue'
import { api } from '@/utils/helpers.utils'

interface ProductOption { id: string; name: string }

// ---- Page Rates ----
interface PageRate { id: string; printType: ProductOption; paperStock: ProductOption; ratePerPage: number }
interface PageRatePayload { printTypeId: string; paperStockId: string; ratePerPage: number }

// ---- Cover Style Rates ----
interface CoverStyleRate { id: string; coverStyle: ProductOption; basePrice: number }
interface CoverStyleRatePayload { coverStyleId: string; basePrice: number }

// ---- Cover Finish Rates ----
interface CoverFinishRate { id: string; coverFinish: ProductOption; addOnPrice: number }
interface CoverFinishRatePayload { coverFinishId: string; addOnPrice: number }

// ---- Binding Rates ----
interface BindingRate { id: string; bindingType: ProductOption; surcharge: number }
interface BindingRatePayload { bindingTypeId: string; surcharge: number }

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

// Cover Style Rates state
const coverStyleRates = ref<CoverStyleRate[]>([])
const coverStyleRatesLoading = ref(false)
const coverStyleRatesError = ref<string | null>(null)
const showAddCoverStyleRate = ref(false)
const editingCoverStyleRateId = ref<string | null>(null)
const coverStyleRateForm = ref<CoverStyleRatePayload>({ coverStyleId: '', basePrice: 0 })
const coverStyleRateSaving = ref(false)

// Cover Finish Rates state
const coverFinishRates = ref<CoverFinishRate[]>([])
const coverFinishRatesLoading = ref(false)
const coverFinishRatesError = ref<string | null>(null)
const showAddCoverFinishRate = ref(false)
const editingCoverFinishRateId = ref<string | null>(null)
const coverFinishRateForm = ref<CoverFinishRatePayload>({ coverFinishId: '', addOnPrice: 0 })
const coverFinishRateSaving = ref(false)

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

  await Promise.all([loadPageRates(), loadCoverStyleRates(), loadCoverFinishRates(), loadBindingRates()])
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

function startAddPageRate(): void {
  pageRateForm.value = { printTypeId: '', paperStockId: '', ratePerPage: 0 }
  editingPageRateId.value = null
  showAddPageRate.value = true
}

function startEditPageRate(rate: PageRate): void {
  pageRateForm.value = { printTypeId: rate.printType.id, paperStockId: rate.paperStock.id, ratePerPage: rate.ratePerPage }
  editingPageRateId.value = rate.id
  showAddPageRate.value = false
}

function cancelPageRate(): void {
  showAddPageRate.value = false
  editingPageRateId.value = null
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

// ---- Cover Style Rates CRUD ----
async function loadCoverStyleRates(): Promise<void> {
  coverStyleRatesLoading.value = true
  coverStyleRatesError.value = null
  try {
    const { data } = await api.get<CoverStyleRate[]>('/admin/cover-style-rates')
    coverStyleRates.value = data
  } catch {
    coverStyleRatesError.value = 'Failed to load cover style rates.'
  } finally {
    coverStyleRatesLoading.value = false
  }
}

function startAddCoverStyleRate(): void {
  coverStyleRateForm.value = { coverStyleId: '', basePrice: 0 }
  editingCoverStyleRateId.value = null
  showAddCoverStyleRate.value = true
}

function startEditCoverStyleRate(rate: CoverStyleRate): void {
  coverStyleRateForm.value = { coverStyleId: rate.coverStyle.id, basePrice: rate.basePrice }
  editingCoverStyleRateId.value = rate.id
  showAddCoverStyleRate.value = false
}

function cancelCoverStyleRate(): void {
  showAddCoverStyleRate.value = false
  editingCoverStyleRateId.value = null
  coverStyleRatesError.value = null
}

async function saveCoverStyleRate(): Promise<void> {
  coverStyleRateSaving.value = true
  coverStyleRatesError.value = null
  try {
    if (editingCoverStyleRateId.value !== null) {
      await api.patch(`/admin/cover-style-rates/${editingCoverStyleRateId.value}`, coverStyleRateForm.value)
    } else {
      await api.post('/admin/cover-style-rates', coverStyleRateForm.value)
    }
    cancelCoverStyleRate()
    await loadCoverStyleRates()
  } catch {
    coverStyleRatesError.value = 'Failed to save cover style rate.'
  } finally {
    coverStyleRateSaving.value = false
  }
}

async function deleteCoverStyleRate(id: string): Promise<void> {
  if (!window.confirm('Delete this cover style rate?')) return
  coverStyleRatesError.value = null
  try {
    await api.delete(`/admin/cover-style-rates/${id}`)
    await loadCoverStyleRates()
  } catch {
    coverStyleRatesError.value = 'Failed to delete cover style rate.'
  }
}

// ---- Cover Finish Rates CRUD ----
async function loadCoverFinishRates(): Promise<void> {
  coverFinishRatesLoading.value = true
  coverFinishRatesError.value = null
  try {
    const { data } = await api.get<CoverFinishRate[]>('/admin/cover-finish-rates')
    coverFinishRates.value = data
  } catch {
    coverFinishRatesError.value = 'Failed to load cover finish rates.'
  } finally {
    coverFinishRatesLoading.value = false
  }
}

function startAddCoverFinishRate(): void {
  coverFinishRateForm.value = { coverFinishId: '', addOnPrice: 0 }
  editingCoverFinishRateId.value = null
  showAddCoverFinishRate.value = true
}

function startEditCoverFinishRate(rate: CoverFinishRate): void {
  coverFinishRateForm.value = { coverFinishId: rate.coverFinish.id, addOnPrice: rate.addOnPrice }
  editingCoverFinishRateId.value = rate.id
  showAddCoverFinishRate.value = false
}

function cancelCoverFinishRate(): void {
  showAddCoverFinishRate.value = false
  editingCoverFinishRateId.value = null
  coverFinishRatesError.value = null
}

async function saveCoverFinishRate(): Promise<void> {
  coverFinishRateSaving.value = true
  coverFinishRatesError.value = null
  try {
    if (editingCoverFinishRateId.value !== null) {
      await api.patch(`/admin/cover-finish-rates/${editingCoverFinishRateId.value}`, coverFinishRateForm.value)
    } else {
      await api.post('/admin/cover-finish-rates', coverFinishRateForm.value)
    }
    cancelCoverFinishRate()
    await loadCoverFinishRates()
  } catch {
    coverFinishRatesError.value = 'Failed to save cover finish rate.'
  } finally {
    coverFinishRateSaving.value = false
  }
}

async function deleteCoverFinishRate(id: string): Promise<void> {
  if (!window.confirm('Delete this cover finish rate?')) return
  coverFinishRatesError.value = null
  try {
    await api.delete(`/admin/cover-finish-rates/${id}`)
    await loadCoverFinishRates()
  } catch {
    coverFinishRatesError.value = 'Failed to delete cover finish rate.'
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

function startAddBindingRate(): void {
  bindingRateForm.value = { bindingTypeId: '', surcharge: 0 }
  editingBindingRateId.value = null
  showAddBindingRate.value = true
}

function startEditBindingRate(rate: BindingRate): void {
  bindingRateForm.value = { bindingTypeId: rate.bindingType.id, surcharge: rate.surcharge }
  editingBindingRateId.value = rate.id
  showAddBindingRate.value = false
}

function cancelBindingRate(): void {
  showAddBindingRate.value = false
  editingBindingRateId.value = null
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
          <div>
            <h2 class="text-base font-semibold text-gray-900">Page Rates</h2>
            <p class="text-xs text-gray-400 mt-0.5">Per-page cost by print type × paper stock combination</p>
          </div>
          <button
            class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            @click="startAddPageRate"
          >Add</button>
        </div>

        <div v-if="pageRatesError" class="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {{ pageRatesError }}
        </div>

        <div v-if="showAddPageRate || editingPageRateId !== null" class="px-6 py-4 bg-indigo-50 border-b border-gray-100">
          <p class="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
            {{ editingPageRateId !== null ? 'Edit Page Rate' : 'Add Page Rate' }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Print Type</label>
              <select v-model="pageRateForm.printTypeId" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="" disabled>Select…</option>
                <option v-for="pt in printTypes" :key="pt.id" :value="pt.id">{{ pt.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Paper Stock</label>
              <select v-model="pageRateForm.paperStockId" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="" disabled>Select…</option>
                <option v-for="ps in paperStocks" :key="ps.id" :value="ps.id">{{ ps.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Rate per Page ($)</label>
              <input v-model.number="pageRateForm.ratePerPage" type="number" min="0" step="0.001" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div class="flex gap-2 mt-3">
            <button :disabled="pageRateSaving || !pageRateForm.printTypeId || !pageRateForm.paperStockId" class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60" @click="savePageRate">
              {{ pageRateSaving ? 'Saving…' : 'Save' }}
            </button>
            <button class="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" @click="cancelPageRate">Cancel</button>
          </div>
        </div>

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
                <th class="px-6 py-3">Print Type</th>
                <th class="px-6 py-3">Paper Stock</th>
                <th class="px-6 py-3">Rate/Page</th>
                <th class="px-6 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="pageRates.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-sm text-gray-400">No page rates yet.</td>
              </tr>
              <tr v-for="rate in pageRates" :key="rate.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 text-gray-800">{{ rate.printType.name }}</td>
                <td class="px-6 py-3 text-gray-800">{{ rate.paperStock.name }}</td>
                <td class="px-6 py-3 font-medium text-gray-900">${{ Number(rate.ratePerPage).toFixed(4) }}/page</td>
                <td class="px-6 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors" @click="startEditPageRate(rate)">Edit</button>
                    <button class="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors" @click="deletePageRate(rate.id)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ======== COVER STYLE RATES ======== -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-gray-900">Cover Style Rates</h2>
            <p class="text-xs text-gray-400 mt-0.5">Base per-copy cost by cover style (Softcover, Hardcover, etc.)</p>
          </div>
          <button
            class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            @click="startAddCoverStyleRate"
          >Add</button>
        </div>

        <div v-if="coverStyleRatesError" class="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {{ coverStyleRatesError }}
        </div>

        <div v-if="showAddCoverStyleRate || editingCoverStyleRateId !== null" class="px-6 py-4 bg-indigo-50 border-b border-gray-100">
          <p class="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
            {{ editingCoverStyleRateId !== null ? 'Edit Cover Style Rate' : 'Add Cover Style Rate' }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Cover Style</label>
              <select v-model="coverStyleRateForm.coverStyleId" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="" disabled>Select…</option>
                <option v-for="cs in coverStyles" :key="cs.id" :value="cs.id">{{ cs.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Base Price ($)</label>
              <input v-model.number="coverStyleRateForm.basePrice" type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div class="flex gap-2 mt-3">
            <button :disabled="coverStyleRateSaving || !coverStyleRateForm.coverStyleId" class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60" @click="saveCoverStyleRate">
              {{ coverStyleRateSaving ? 'Saving…' : 'Save' }}
            </button>
            <button class="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" @click="cancelCoverStyleRate">Cancel</button>
          </div>
        </div>

        <div v-if="coverStyleRatesLoading" class="flex justify-center py-12">
          <svg class="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm min-w-[420px]">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th class="px-6 py-3">Cover Style</th>
                <th class="px-6 py-3">Base Price</th>
                <th class="px-6 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="coverStyleRates.length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-sm text-gray-400">No cover style rates yet.</td>
              </tr>
              <tr v-for="rate in coverStyleRates" :key="rate.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 text-gray-800">{{ rate.coverStyle.name }}</td>
                <td class="px-6 py-3 font-medium text-gray-900">{{ formatPrice(rate.basePrice) }}</td>
                <td class="px-6 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors" @click="startEditCoverStyleRate(rate)">Edit</button>
                    <button class="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors" @click="deleteCoverStyleRate(rate.id)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ======== COVER FINISH RATES ======== -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-gray-900">Cover Finish Rates</h2>
            <p class="text-xs text-gray-400 mt-0.5">Add-on per-copy cost by cover finish (Gloss, Matte, etc.)</p>
          </div>
          <button
            class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            @click="startAddCoverFinishRate"
          >Add</button>
        </div>

        <div v-if="coverFinishRatesError" class="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {{ coverFinishRatesError }}
        </div>

        <div v-if="showAddCoverFinishRate || editingCoverFinishRateId !== null" class="px-6 py-4 bg-indigo-50 border-b border-gray-100">
          <p class="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
            {{ editingCoverFinishRateId !== null ? 'Edit Cover Finish Rate' : 'Add Cover Finish Rate' }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Cover Finish</label>
              <select v-model="coverFinishRateForm.coverFinishId" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="" disabled>Select…</option>
                <option v-for="cf in coverFinishes" :key="cf.id" :value="cf.id">{{ cf.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Add-On Price ($)</label>
              <input v-model.number="coverFinishRateForm.addOnPrice" type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div class="flex gap-2 mt-3">
            <button :disabled="coverFinishRateSaving || !coverFinishRateForm.coverFinishId" class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60" @click="saveCoverFinishRate">
              {{ coverFinishRateSaving ? 'Saving…' : 'Save' }}
            </button>
            <button class="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" @click="cancelCoverFinishRate">Cancel</button>
          </div>
        </div>

        <div v-if="coverFinishRatesLoading" class="flex justify-center py-12">
          <svg class="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm min-w-[420px]">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th class="px-6 py-3">Cover Finish</th>
                <th class="px-6 py-3">Add-On Price</th>
                <th class="px-6 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="coverFinishRates.length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-sm text-gray-400">No cover finish rates yet.</td>
              </tr>
              <tr v-for="rate in coverFinishRates" :key="rate.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 text-gray-800">{{ rate.coverFinish.name }}</td>
                <td class="px-6 py-3 font-medium text-gray-900">{{ formatPrice(rate.addOnPrice) }}</td>
                <td class="px-6 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors" @click="startEditCoverFinishRate(rate)">Edit</button>
                    <button class="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors" @click="deleteCoverFinishRate(rate.id)">Delete</button>
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
          <div>
            <h2 class="text-base font-semibold text-gray-900">Binding Rates</h2>
            <p class="text-xs text-gray-400 mt-0.5">Per-copy surcharge by binding type</p>
          </div>
          <button
            class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            @click="startAddBindingRate"
          >Add</button>
        </div>

        <div v-if="bindingRatesError" class="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {{ bindingRatesError }}
        </div>

        <div v-if="showAddBindingRate || editingBindingRateId !== null" class="px-6 py-4 bg-indigo-50 border-b border-gray-100">
          <p class="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
            {{ editingBindingRateId !== null ? 'Edit Binding Rate' : 'Add Binding Rate' }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Binding Type</label>
              <select v-model="bindingRateForm.bindingTypeId" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="" disabled>Select…</option>
                <option v-for="bt in bindingTypes" :key="bt.id" :value="bt.id">{{ bt.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Surcharge ($)</label>
              <input v-model.number="bindingRateForm.surcharge" type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div class="flex gap-2 mt-3">
            <button :disabled="bindingRateSaving || !bindingRateForm.bindingTypeId" class="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60" @click="saveBindingRate">
              {{ bindingRateSaving ? 'Saving…' : 'Save' }}
            </button>
            <button class="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" @click="cancelBindingRate">Cancel</button>
          </div>
        </div>

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
                <th class="px-6 py-3">Binding Type</th>
                <th class="px-6 py-3">Surcharge</th>
                <th class="px-6 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="bindingRates.length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-sm text-gray-400">No binding rates yet.</td>
              </tr>
              <tr v-for="rate in bindingRates" :key="rate.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 text-gray-800">{{ rate.bindingType.name }}</td>
                <td class="px-6 py-3 font-medium text-gray-900">{{ formatPrice(rate.surcharge) }}</td>
                <td class="px-6 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors" @click="startEditBindingRate(rate)">Edit</button>
                    <button class="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors" @click="deleteBindingRate(rate.id)">Delete</button>
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

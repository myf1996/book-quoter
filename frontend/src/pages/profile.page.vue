<script setup lang="ts">
/**
 * ProfilePage — lets the authenticated user view/edit their profile
 * and change their password.
 * Redirects to / if the user is not authenticated.
 */
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { api } from '@/utils/helpers.utils'

interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
}

const router = useRouter()
const authStore = useAuthStore()

// --- Profile info state ---
const profile = ref<UserProfile | null>(null)
const isEditingName = ref(false)
const editedName = ref('')
const profileSaving = ref(false)
const profileSaved = ref(false)
const profileError = ref<string | null>(null)

// --- Change password state ---
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordSaving = ref(false)
const passwordSuccess = ref(false)
const passwordError = ref<string | null>(null)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const avatarLetter = computed(() =>
  (profile.value?.name ?? authStore.user?.name ?? '?').charAt(0).toUpperCase(),
)

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function startEditName(): void {
  editedName.value = profile.value?.name ?? ''
  profileSaved.value = false
  profileError.value = null
  isEditingName.value = true
}

function cancelEditName(): void {
  isEditingName.value = false
  editedName.value = ''
  profileError.value = null
}

async function saveName(): Promise<void> {
  if (!editedName.value.trim() || editedName.value.trim().length < 2) {
    profileError.value = 'Name must be at least 2 characters.'
    return
  }
  profileSaving.value = true
  profileError.value = null
  try {
    await authStore.updateProfile(editedName.value.trim())
    if (profile.value) profile.value = { ...profile.value, name: editedName.value.trim() }
    isEditingName.value = false
    profileSaved.value = true
    setTimeout(() => { profileSaved.value = false }, 3000)
  } catch {
    profileError.value = 'Failed to update name. Please try again.'
  } finally {
    profileSaving.value = false
  }
}

async function changePassword(): Promise<void> {
  passwordError.value = null
  passwordSuccess.value = false

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = 'All fields are required.'
    return
  }
  if (newPassword.value.length < 8) {
    passwordError.value = 'New password must be at least 8 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'New password and confirmation do not match.'
    return
  }

  passwordSaving.value = true
  try {
    await api.patch('/auth/password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    passwordSuccess.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } } }
    passwordError.value =
      axiosErr.response?.data?.message ?? 'Failed to change password. Please try again.'
  } finally {
    passwordSaving.value = false
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push({ path: '/' })
    return
  }
  try {
    const { data } = await api.get<UserProfile>('/auth/me')
    profile.value = data
  } catch {
    // If fetch fails, fall back to store user info
    if (authStore.user) {
      profile.value = { ...authStore.user, createdAt: '' }
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top navigation -->
    <nav class="bg-white border-b border-gray-100 px-4 py-3">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <span class="text-lg font-bold text-gray-900">Book Quoter</span>
        <div class="flex items-center gap-3">
          <template v-if="authStore.isAuthenticated">
            <a
              href="/profile"
              class="text-sm text-indigo-600 font-medium hidden sm:inline hover:text-indigo-800 transition-colors"
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
              @click="authStore.logout(); router.push({ path: '/' })"
            >
              Logout
            </button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Back nav -->
    <div class="max-w-5xl mx-auto px-4 pt-6">
      <a
        href="/"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        &#8592; Back to Quoter
      </a>
    </div>

    <!-- Page content -->
    <div class="max-w-5xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Section 1: Profile Info -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Profile Info</h2>

          <!-- Avatar -->
          <div class="flex justify-center mb-6">
            <div
              class="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold select-none"
            >
              {{ avatarLetter }}
            </div>
          </div>

          <!-- Name -->
          <div class="mb-4">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Full Name
            </label>
            <div v-if="!isEditingName" class="flex items-center gap-2">
              <span class="text-base font-bold text-gray-900">{{ profile?.name ?? '—' }}</span>
              <button
                class="p-1 text-gray-400 hover:text-indigo-600 transition-colors rounded"
                title="Edit name"
                @click="startEditName"
              >
                <!-- Pencil icon -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                  />
                </svg>
              </button>
            </div>
            <div v-else class="space-y-2">
              <input
                v-model="editedName"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your full name"
                @keyup.enter="saveName"
                @keyup.escape="cancelEditName"
              />
              <div class="flex items-center gap-2">
                <button
                  :disabled="profileSaving"
                  class="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  @click="saveName"
                >
                  {{ profileSaving ? 'Saving…' : 'Save' }}
                </button>
                <button
                  class="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  @click="cancelEditName"
                >
                  Cancel
                </button>
              </div>
              <p v-if="profileError" class="text-xs text-red-500">{{ profileError }}</p>
            </div>
            <p
              v-if="profileSaved"
              class="text-xs text-green-600 mt-1 font-medium"
            >
              Name updated!
            </p>
          </div>

          <!-- Email (read-only) -->
          <div class="mb-4">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Email Address
            </label>
            <p class="text-sm text-gray-700">{{ profile?.email ?? '—' }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Email cannot be changed.</p>
          </div>

          <!-- Member since -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Member Since
            </label>
            <p class="text-sm text-gray-700">
              {{ profile?.createdAt ? formatMemberSince(profile.createdAt) : '—' }}
            </p>
          </div>
        </div>

        <!-- Section 2: Change Password -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>

          <form class="space-y-4" @submit.prevent="changePassword">
            <div>
              <label
                for="current-password"
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Current Password
              </label>
              <div class="relative">
                <input
                  id="current-password"
                  v-model="currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
                  :aria-label="showCurrentPassword ? 'Hide password' : 'Show password'"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  <svg v-if="!showCurrentPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label
                for="new-password"
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                New Password
              </label>
              <div class="relative">
                <input
                  id="new-password"
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
                  :aria-label="showNewPassword ? 'Hide password' : 'Show password'"
                  @click="showNewPassword = !showNewPassword"
                >
                  <svg v-if="!showNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label
                for="confirm-password"
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Confirm New Password
              </label>
              <div class="relative">
                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
                  :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <p v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</p>
            <p v-if="passwordSuccess" class="text-sm text-green-600 font-medium">
              Password changed successfully!
            </p>

            <button
              type="submit"
              :disabled="passwordSaving"
              class="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {{ passwordSaving ? 'Updating…' : 'Update Password' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

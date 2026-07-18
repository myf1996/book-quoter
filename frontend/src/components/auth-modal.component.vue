<script setup lang="ts">
/**
 * AuthModal — login / register tabs shown when an unauthenticated user tries to finish a quote.
 * On successful auth, calls the optional onSuccess callback and closes itself.
 */
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps<{
  modelValue: boolean
  onSuccess?: () => void
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

type Tab = 'login' | 'register'

const authStore = useAuthStore()
const activeTab = ref<Tab>('login')
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)

function validateName(value: string): string | null {
  if (!value) return 'Name is required'
  if (value.trim().length < 2) return 'Name must be at least 2 characters'
  return null
}

function validateEmail(value: string): string | null {
  if (!value) return 'Email is required'
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(value)) return 'Enter a valid email address'
  return null
}

function validatePassword(value: string): string | null {
  if (!value) return 'Password is required'
  if (value.length < 8) return 'Password must be at least 8 characters'
  return null
}

function switchTab(tab: Tab): void {
  activeTab.value = tab
  errorMessage.value = null
  showPassword.value = false
  showConfirmPassword.value = false
  name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}

function close(): void {
  emit('update:modelValue', false)
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = null

  if (activeTab.value === 'register') {
    const nameError = validateName(name.value)
    if (nameError) { errorMessage.value = nameError; return }
  }

  const emailError = validateEmail(email.value)
  if (emailError) {
    errorMessage.value = emailError
    return
  }

  const passwordError = validatePassword(password.value)
  if (passwordError) {
    errorMessage.value = passwordError
    return
  }

  if (activeTab.value === 'register' && password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  isLoading.value = true
  try {
    if (activeTab.value === 'login') {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register(name.value, email.value, password.value)
    }
    if (props.onSuccess) {
      props.onSuccess()
    }
    close()
  } catch (err: unknown) {
    if (
      err !== null &&
      typeof err === 'object' &&
      'response' in err &&
      err.response !== null &&
      typeof err.response === 'object' &&
      'data' in err.response &&
      err.response.data !== null &&
      typeof err.response.data === 'object' &&
      'message' in err.response.data
    ) {
      errorMessage.value = String((err.response.data as { message: string }).message)
    } else {
      errorMessage.value = 'Something went wrong. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="close"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">
              {{ activeTab === 'login' ? 'Sign in to save your quote' : 'Create an account' }}
            </h2>
            <button
              class="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
              aria-label="Close"
              @click="close"
            >
              &times;
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
            <button
              class="flex-1 py-2 text-sm font-medium rounded-md transition-colors"
              :class="activeTab === 'login'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'"
              @click="switchTab('login')"
            >
              Sign In
            </button>
            <button
              class="flex-1 py-2 text-sm font-medium rounded-md transition-colors"
              :class="activeTab === 'register'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'"
              @click="switchTab('register')"
            >
              Create Account
            </button>
          </div>
        </div>

        <!-- Form body -->
        <div class="p-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div v-if="activeTab === 'register'">
              <label class="block text-sm font-medium text-gray-700 mb-1" for="auth-name">
                Full name
              </label>
              <input
                id="auth-name"
                v-model="name"
                type="text"
                autocomplete="name"
                placeholder="Your name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                :disabled="isLoading"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="auth-email">
                Email address
              </label>
              <input
                id="auth-email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                :disabled="isLoading"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="auth-password">
                Password
              </label>
              <div class="relative">
                <input
                  id="auth-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Minimum 8 characters"
                  class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="activeTab === 'register'">
              <label class="block text-sm font-medium text-gray-700 mb-1" for="auth-confirm-password">
                Confirm password
              </label>
              <div class="relative">
                <input
                  id="auth-confirm-password"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Repeat your password"
                  class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  :disabled="isLoading"
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

            <div v-if="activeTab === 'login'" class="text-right">
              <a
                href="/forgot-password"
                class="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Forgot your password?
              </a>
            </div>

            <!-- Error message -->
            <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              class="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              :disabled="isLoading"
            >
              <svg
                v-if="isLoading"
                class="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ activeTab === 'login' ? 'Sign In' : 'Create Account' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

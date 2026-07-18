<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/utils/helpers.utils'

type Step = 'email' | 'otp' | 'password' | 'done'

const step = ref<Step>('email')
const otpRequired = ref(false)
const email = ref('')
const otp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const totalSteps = () => (otpRequired.value ? 3 : 2)
const currentStepNumber = () => {
  if (step.value === 'email') return 1
  if (step.value === 'otp') return 2
  if (step.value === 'password') return otpRequired.value ? 3 : 2
  return totalSteps()
}

function goBack(): void {
  errorMessage.value = null
  if (step.value === 'otp') { step.value = 'email'; return }
  if (step.value === 'password') {
    step.value = otpRequired.value ? 'otp' : 'email'
  }
}

async function submitEmail(): Promise<void> {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value || !emailPattern.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address.'
    return
  }
  errorMessage.value = null
  isLoading.value = true
  try {
    const { data } = await api.post<{ otpRequired: boolean }>('/auth/forgot-password', { email: email.value })
    otpRequired.value = data.otpRequired
    step.value = data.otpRequired ? 'otp' : 'password'
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } } }
    errorMessage.value = axiosErr.response?.data?.message ?? 'Something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function submitOtp(): void {
  if (!otp.value || otp.value.length !== 6 || !/^\d{6}$/.test(otp.value)) {
    errorMessage.value = 'Please enter the 6-digit code sent to your email.'
    return
  }
  errorMessage.value = null
  step.value = 'password'
}

async function submitPassword(): Promise<void> {
  errorMessage.value = null
  if (!newPassword.value || newPassword.value.length < 8) {
    errorMessage.value = 'New password must be at least 8 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }
  isLoading.value = true
  try {
    await api.post('/auth/reset-password', {
      email: email.value,
      newPassword: newPassword.value,
      ...(otpRequired.value ? { otp: otp.value } : {}),
    })
    step.value = 'done'
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
    if (axiosErr.response?.status === 401) {
      step.value = 'otp'
      errorMessage.value = 'Invalid or expired OTP. Please try again.'
    } else {
      errorMessage.value = axiosErr.response?.data?.message ?? 'Something went wrong. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md overflow-hidden">

      <!-- Header -->
      <div class="p-6 border-b border-gray-100">
        <h1 class="text-xl font-bold text-gray-900">Reset your password</h1>
        <p class="text-sm text-gray-500 mt-1">
          <span v-if="step !== 'done'">Step {{ currentStepNumber() }} of {{ totalSteps() }}</span>
          <span v-else>Done</span>
        </p>
        <!-- Step indicator dots -->
        <div v-if="step !== 'done'" class="flex gap-2 mt-3">
          <!-- Email dot -->
          <span
            class="h-2 w-2 rounded-full transition-colors"
            :class="step === 'email' || step === 'otp' || step === 'password' ? 'bg-indigo-600' : 'bg-gray-200'"
          />
          <!-- OTP dot — only shown when OTP flow is active -->
          <span
            v-if="otpRequired"
            class="h-2 w-2 rounded-full transition-colors"
            :class="step === 'otp' || step === 'password' ? 'bg-indigo-600' : 'bg-gray-200'"
          />
          <!-- Password dot -->
          <span
            class="h-2 w-2 rounded-full transition-colors"
            :class="step === 'password' ? 'bg-indigo-600' : 'bg-gray-200'"
          />
        </div>
      </div>

      <!-- Body -->
      <div class="p-6">

        <!-- SUCCESS STATE (done) -->
        <div v-if="step === 'done'" class="flex flex-col items-center text-center gap-4 py-4">
          <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-900">Password reset successfully!</p>
            <p class="text-sm text-gray-500 mt-1">You can now sign in with your new password.</p>
          </div>
          <a
            href="/"
            class="inline-block mt-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Sign In
          </a>
        </div>

        <!-- STEP email -->
        <form v-else-if="step === 'email'" class="space-y-4" @submit.prevent="submitEmail">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="fp-email">
              Email address
            </label>
            <input
              id="fp-email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              :disabled="isLoading"
            />
          </div>

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
            <span>Continue</span>
          </button>

          <p class="text-center text-sm text-gray-500">
            Remember your password?
            <a href="/" class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">Sign in</a>
          </p>
        </form>

        <!-- STEP otp -->
        <form v-else-if="step === 'otp'" class="space-y-4" @submit.prevent="submitOtp">
          <p class="text-sm text-gray-500">
            Enter the 6-digit code sent to <span class="font-medium text-gray-700">{{ email }}</span>.
          </p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="fp-otp">Verification code</label>
            <input
              id="fp-otp"
              v-model="otp"
              type="text"
              inputmode="numeric"
              maxlength="6"
              autocomplete="one-time-code"
              placeholder="000000"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            class="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Continue
          </button>

          <button
            type="button"
            class="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            @click="goBack"
          >
            &larr; Back
          </button>
        </form>

        <!-- STEP password -->
        <form v-else class="space-y-4" @submit.prevent="submitPassword">
          <p class="text-sm text-gray-500">
            Enter a new password for <span class="font-medium text-gray-700">{{ email }}</span>.
          </p>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="fp-new-password">
              New password
            </label>
            <div class="relative">
              <input
                id="fp-new-password"
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Minimum 8 characters"
                class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                :disabled="isLoading"
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
            <label class="block text-sm font-medium text-gray-700 mb-1" for="fp-confirm-password">
              Confirm new password
            </label>
            <div class="relative">
              <input
                id="fp-confirm-password"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Repeat your new password"
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
            <span>Reset Password</span>
          </button>

          <button
            type="button"
            class="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            @click="goBack"
          >
            &larr; Back
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

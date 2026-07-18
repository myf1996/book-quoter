<script setup lang="ts">
import { onMounted } from 'vue'
import { useConfigStore } from '@/stores/config.store'
import { useAuthStore } from '@/stores/auth.store'

const configStore = useConfigStore()
const authStore = useAuthStore()

onMounted(() => {
  configStore.fetchConfig()
  // Restore user session from stored token on every page load
  authStore.fetchCurrentUser()
})
</script>

<template>
  <RouterView />
</template>

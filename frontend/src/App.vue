<script setup lang="ts">
import { onMounted } from 'vue'
import { useConfigStore } from '@/stores/config.store'

const configStore = useConfigStore()

onMounted(() => {
  configStore.fetchConfig()
})
</script>

<template>
  <RouterView />
</template>

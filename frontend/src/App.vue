<script setup lang="ts">
import { useConfigStore } from '@/stores/config.store'
import { onMounted } from 'vue'

const configStore = useConfigStore()
onMounted(() => configStore.fetchConfig())
</script>

<template>
  <RouterView />
</template>

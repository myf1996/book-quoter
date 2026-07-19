import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { router } from './router'
import { useAuthStore } from '@/stores/auth.store'

const app = createApp(App)
app.use(createPinia())

// Restore auth session before the first navigation so route guards have user data.
// finally() ensures the app mounts even if the token is expired or invalid.
const authStore = useAuthStore()
authStore.fetchCurrentUser().finally(() => {
  app.use(router)
  app.mount('#app')
})

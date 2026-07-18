import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'quoter',
    component: () => import('@/pages/quoter.page.vue'),
  },
  {
    path: '/my-quotes',
    name: 'my-quotes',
    component: () => import('@/pages/my-quotes.page.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/profile.page.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('@/pages/forgot-password.page.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Redirect unauthenticated users away from auth-required routes
router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'quoter' }
  }
})

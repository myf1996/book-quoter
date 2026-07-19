import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
  }
}

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
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/pages/admin/admin-dashboard.page.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('@/pages/admin/admin-products.page.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/pricing',
    name: 'admin-pricing',
    component: () => import('@/pages/admin/admin-pricing.page.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/pages/admin/admin-users.page.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/quotes',
    name: 'admin-quotes',
    component: () => import('@/pages/admin/admin-quotes.page.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Redirect unauthenticated users away from auth-required routes
// Redirect non-admin users away from admin-only routes
router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'quoter' }
  }
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    return { path: '/' }
  }
})

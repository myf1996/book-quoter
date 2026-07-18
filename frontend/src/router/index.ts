import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'quoter',
    component: () => import('@/pages/quoter.page.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

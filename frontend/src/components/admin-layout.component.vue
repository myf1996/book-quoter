<script setup lang="ts">
/**
 * AdminLayout — shell component for all admin pages.
 * Provides a collapsible sidebar on mobile and a fixed sidebar on desktop (lg+).
 */
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

function isActive(path: string): boolean {
  return path === '/admin' ? route.path === '/admin' : route.path.startsWith(path)
}

function closeMobileMenu(): void {
  mobileMenuOpen.value = false
}

const navLinks = [
  {
    href: '/admin',
    label: 'Dashboard',
    path: '/admin',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    href: '/admin/products',
    label: 'Products',
    path: '/admin/products',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    href: '/admin/pricing',
    label: 'Pricing',
    path: '/admin/pricing',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    href: '/admin/users',
    label: 'Users',
    path: '/admin/users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    href: '/admin/quotes',
    label: 'Quotes',
    path: '/admin/quotes',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    href: '/admin/coupons',
    label: 'Coupons',
    path: '/admin/coupons',
    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z',
  },
]
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Mobile backdrop -->
    <Transition name="fade">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-20 bg-black/50 lg:hidden"
        @click="closeMobileMenu"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'w-56 bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-30 transition-transform duration-200 ease-in-out',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div class="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
        <div>
          <span class="text-lg font-bold tracking-tight">Book Quoter</span>
          <span class="block text-xs text-gray-400 mt-0.5">Admin Panel</span>
        </div>
        <!-- Close button (mobile only) -->
        <button
          class="lg:hidden p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          aria-label="Close menu"
          @click="closeMobileMenu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 py-4 space-y-1 px-3">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive(link.path)
              ? 'bg-indigo-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white',
          ]"
          @click="closeMobileMenu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
          </svg>
          {{ link.label }}
        </a>
      </nav>

      <!-- Back to App -->
      <div class="px-3 py-4 border-t border-gray-700">
        <a
          href="/"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          @click="closeMobileMenu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to App
        </a>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 bg-gray-50 min-h-screen overflow-y-auto lg:ml-56">
      <!-- Mobile top bar -->
      <div class="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 lg:hidden">
        <button
          class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
          @click="mobileMenuOpen = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="text-sm font-bold text-gray-900">Book Quoter Admin</span>
      </div>

      <slot />
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

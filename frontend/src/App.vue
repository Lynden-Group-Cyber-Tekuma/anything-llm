<script setup>
import { onMounted, onUnmounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { usePWAStore } from '@/stores/pwa'
import { useLogoStore } from '@/stores/logo'
import { usePfpStore } from '@/stores/pfp'
import FullScreenLoader from '@/components/Preloader/FullScreenLoader.vue'
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp/index.vue'
import ErrorBoundary from '@/components/ErrorBoundary/index.vue'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const pwaStore = usePWAStore()
const logoStore = useLogoStore()
const pfpStore = usePfpStore()

// Provide stores to child components
provide('authStore', authStore)
provide('themeStore', themeStore)
provide('pwaStore', pwaStore)
provide('logoStore', logoStore)
provide('pfpStore', pfpStore)

// Initialize stores
onMounted(async () => {
  themeStore.init()
  pwaStore.init()
  await logoStore.fetchLogo()
  if (authStore.user?.id) {
    await pfpStore.fetchPfp(authStore.user.id)
  }
})
</script>

<template>
  <ErrorBoundary @error="console.error" :reset-keys="[$route.path]">
    <Suspense>
      <template #default>
        <div>
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
          <KeyboardShortcutsHelp />
        </div>
      </template>
      <template #fallback>
        <FullScreenLoader />
      </template>
    </Suspense>
  </ErrorBoundary>
</template>

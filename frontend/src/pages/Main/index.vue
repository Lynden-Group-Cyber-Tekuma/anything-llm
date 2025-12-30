<script setup>
import { computed } from 'vue'
import { usePasswordModal } from '@/composables/usePasswordModal'
import { userFromStorage } from '@/utils/request'
import FullScreenLoader from '@/components/Preloader/FullScreenLoader.vue'
import PasswordModal from '@/components/Modals/Password/index.vue'
import Sidebar from '@/components/Sidebar/index.vue'
import SidebarMobileHeader from '@/components/Sidebar/SidebarMobileHeader.vue'
import DefaultChatContainer from '@/components/DefaultChat/index.vue'
import Home from './Home/index.vue'

const { loading, requiresAuth, mode } = usePasswordModal()

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
})

const user = computed(() => userFromStorage())
const showHome = computed(() => !user.value || user.value?.role === 'admin')
</script>

<template>
  <FullScreenLoader v-if="loading" />
  <PasswordModal v-else-if="requiresAuth !== false && requiresAuth !== null" :mode="mode" />
  <div v-else class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <SidebarMobileHeader v-if="isMobile" />
    <Sidebar v-else />
    <Home v-if="showHome" />
    <DefaultChatContainer v-else />
  </div>
</template>

<script setup>
import PasswordModal, { usePasswordModal } from '@/components/Modals/Password'
import { FullScreenLoader } from '@/components/Preloader'
import Home from './Home/index.vue'
import DefaultChatContainer from '@/components/DefaultChat'
import { isMobile } from 'react-device-detect'
import Sidebar, { SidebarMobileHeader } from '@/components/Sidebar'
import { userFromStorage } from '@/utils/request'

const { loading, requiresAuth, mode } = usePasswordModal()

const user = userFromStorage()
</script>

<template>
  <FullScreenLoader v-if="loading" />
  <template v-else-if="requiresAuth !== false">
    <PasswordModal v-if="requiresAuth !== null" :mode="mode" />
  </template>
  <div v-else class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <SidebarMobileHeader v-if="isMobile" />
    <Sidebar v-else />
    <DefaultChatContainer v-if="!!user && user?.role !== 'admin'" />
    <Home v-else />
  </div>
</template>

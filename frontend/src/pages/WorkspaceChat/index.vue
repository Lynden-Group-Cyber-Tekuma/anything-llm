<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import WorkspaceChatContainer from '@/components/WorkspaceChat'
import Sidebar from '@/components/Sidebar'
import Workspace from '@/models/workspace'
import PasswordModal, { usePasswordModal } from '@/components/Modals/Password'
import { isMobile } from 'react-device-detect'
import { FullScreenLoader } from '@/components/Preloader'
import { LAST_VISITED_WORKSPACE } from '@/utils/constants'

const { loading: authLoading, requiresAuth, mode } = usePasswordModal()
const route = useRoute()
const slug = route.params.slug
const workspace = ref(null)
const loading = ref(true)

onMounted(async () => {
  if (!slug) return
  const _workspace = await Workspace.bySlug(slug)
  if (!_workspace) {
    loading.value = false
    return
  }

  const suggestedMessages = await Workspace.getSuggestedMessages(slug)
  const pfpUrl = await Workspace.fetchPfp(slug)
  workspace.value = {
    ..._workspace,
    suggestedMessages,
    pfpUrl,
  }
  loading.value = false
  localStorage.setItem(
    LAST_VISITED_WORKSPACE,
    JSON.stringify({
      slug: _workspace.slug,
      name: _workspace.name,
    })
  )
})
</script>

<template>
  <FullScreenLoader v-if="authLoading" />
  <template v-else-if="requiresAuth !== false">
    <PasswordModal v-if="requiresAuth !== null" :mode="mode" />
  </template>
  <div v-else class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar v-if="!isMobile" />
    <WorkspaceChatContainer :loading="loading" :workspace="workspace" />
  </div>
</template>

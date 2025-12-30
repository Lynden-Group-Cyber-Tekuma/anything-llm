<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLogo } from '@/composables/useLogo'
import Workspace from '@/models/workspace'

const router = useRouter()
const { logo } = useLogo()
const workspaces = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { workspaces: ws } = await Workspace.all()
    workspaces.value = ws || []
  } finally {
    loading.value = false
  }
})

function goToWorkspace(slug) {
  router.push(`/workspace/${slug}`)
}
</script>

<template>
  <div class="w-64 bg-theme-bg-sidebar h-full flex flex-col border-r border-theme-sidebar-border">
    <!-- Logo -->
    <div class="p-4 flex items-center justify-center">
      <router-link to="/">
        <img :src="logo" alt="Logo" class="h-10 object-contain" />
      </router-link>
    </div>

    <!-- Workspace List -->
    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="loading" class="text-theme-text-secondary text-sm p-2">
        Loading workspaces...
      </div>
      <div v-else-if="workspaces.length === 0" class="text-theme-text-secondary text-sm p-2">
        No workspaces yet
      </div>
      <div v-else class="space-y-1">
        <button
          v-for="workspace in workspaces"
          :key="workspace.id"
          @click="goToWorkspace(workspace.slug)"
          class="w-full text-left p-2 rounded hover:bg-theme-sidebar-item-hover text-theme-text-primary text-sm truncate"
        >
          {{ workspace.name }}
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-theme-sidebar-border">
      <router-link
        to="/settings/llm-preference"
        class="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary text-sm"
      >
        Settings
      </router-link>
    </div>
  </div>
</template>

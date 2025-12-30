<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar/index.vue'
import Workspace from '@/models/workspace'

const route = useRoute()
const workspace = ref(null)
const loading = ref(true)

const currentTab = computed(() => route.params.tab || 'general-appearance')

onMounted(async () => {
  try {
    const { workspace: ws } = await Workspace.bySlug(route.params.slug)
    workspace.value = ws
  } finally {
    loading.value = false
  }
})

const tabs = [
  { id: 'general-appearance', title: 'General Appearance' },
  { id: 'chat-settings', title: 'Chat Settings' },
  { id: 'vector-database', title: 'Vector Database' },
  { id: 'members', title: 'Members' },
  { id: 'agent-config', title: 'Agent Configuration' }
]
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b border-theme-modal-border">
        <h1 class="text-xl font-semibold text-theme-text-primary">
          Workspace Settings
        </h1>
        <p v-if="workspace" class="text-theme-text-secondary">
          {{ workspace.name }}
        </p>
      </div>

      <div class="flex-1 flex overflow-hidden">
        <!-- Tabs Sidebar -->
        <div class="w-64 border-r border-theme-modal-border p-4">
          <nav class="space-y-1">
            <router-link
              v-for="tab in tabs"
              :key="tab.id"
              :to="`/workspace/${route.params.slug}/settings/${tab.id}`"
              :class="[
                'block px-4 py-2 rounded-lg text-sm transition-colors',
                currentTab === tab.id
                  ? 'bg-primary-button text-white'
                  : 'text-theme-text-secondary hover:bg-theme-sidebar-item-hover'
              ]"
            >
              {{ tab.title }}
            </router-link>
          </nav>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="loading" class="text-theme-text-secondary">Loading...</div>
          <div v-else class="max-w-2xl">
            <h2 class="text-lg font-semibold text-theme-text-primary mb-4">
              {{ tabs.find(t => t.id === currentTab)?.title }}
            </h2>
            <p class="text-theme-text-secondary">
              Settings content for {{ currentTab }} will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar/index.vue'
import SidebarMobileHeader from '@/components/Sidebar/SidebarMobileHeader.vue'
import Workspace from '@/models/workspace'

const route = useRoute()
const workspace = ref(null)
const messages = ref([])
const newMessage = ref('')
const loading = ref(true)

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
})

onMounted(async () => {
  try {
    const { workspace: ws } = await Workspace.bySlug(route.params.slug)
    workspace.value = ws
  } finally {
    loading.value = false
  }
})

async function sendMessage() {
  if (!newMessage.value.trim()) return

  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: newMessage.value
  }
  messages.value.push(userMessage)
  newMessage.value = ''

  // Add a placeholder for the assistant response
  const assistantMessage = {
    id: Date.now() + 1,
    role: 'assistant',
    content: 'Processing your message...'
  }
  messages.value.push(assistantMessage)
}
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <SidebarMobileHeader v-if="isMobile" />
    <Sidebar v-else />

    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-theme-modal-border">
        <h1 v-if="workspace" class="text-lg font-semibold text-theme-text-primary">
          {{ workspace.name }}
        </h1>
        <div v-else class="h-6 w-48 bg-theme-bg-secondary rounded animate-pulse" />
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="messages.length === 0" class="text-center text-theme-text-secondary py-8">
          <p>Start a conversation by sending a message below.</p>
        </div>
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'p-4 rounded-lg max-w-3xl',
            message.role === 'user'
              ? 'bg-primary-button/10 ml-auto'
              : 'bg-theme-bg-secondary'
          ]"
        >
          <p class="text-theme-text-primary">{{ message.content }}</p>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-theme-modal-border">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Send a message..."
            class="flex-1 p-3 rounded-lg bg-theme-bg-chat-input text-theme-text-primary placeholder:text-theme-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-button"
          />
          <button
            type="submit"
            class="px-6 py-3 bg-primary-button text-white rounded-lg hover:bg-primary-button/80"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

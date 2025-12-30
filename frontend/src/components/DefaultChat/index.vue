<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const message = ref('')

function handleSubmit() {
  if (!message.value.trim()) return
  // Handle chat submission
  message.value = ''
}
</script>

<template>
  <div class="flex-1 flex flex-col bg-theme-bg-chat">
    <!-- Chat Messages Area -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="text-center text-theme-text-secondary py-8">
        <p>Start a conversation by selecting a workspace</p>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 border-t border-theme-modal-border">
      <form @submit.prevent="handleSubmit" class="flex gap-2">
        <input
          v-model="message"
          type="text"
          placeholder="Type your message..."
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
</template>

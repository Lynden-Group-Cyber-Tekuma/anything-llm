<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Trash } from '@phosphor-icons/vue'
import Workspace from '@/models/workspace'

const DELETE_EVENT = 'delete-message'

// Composable for watching delete events
export function useWatchDeleteMessage({ chatId = null, role = 'user' }) {
  const isDeleted = ref(false)
  const completeDelete = ref(false)

  function onEndAnimation() {
    if (!isDeleted.value) return
    completeDelete.value = true
  }

  async function onDeleteEvent(e) {
    if (e.detail.chatId === chatId) {
      isDeleted.value = true
      // Do this to prevent double-emission of the PUT/DELETE api call
      // because then there will be a race condition and it will make an error log for nothing
      // as one call will complete and the other will fail.
      if (role === 'assistant') await Workspace.deleteChat(chatId)
      return false
    }
  }

  onMounted(() => {
    if (!chatId) return
    window.addEventListener(DELETE_EVENT, onDeleteEvent)
  })

  onUnmounted(() => {
    window.removeEventListener(DELETE_EVENT, onDeleteEvent)
  })

  return { isDeleted, completeDelete, onEndAnimation }
}

// DeleteMessage component
const props = defineProps({
  chatId: String,
  isEditing: Boolean,
  role: String
})

function emitDeleteEvent() {
  window.dispatchEvent(new CustomEvent(DELETE_EVENT, { detail: { chatId: props.chatId } }))
}
</script>

<template>
  <button
    v-if="chatId && !isEditing && role !== 'user'"
    @click="emitDeleteEvent"
    class="border-none flex items-center gap-x-1 w-full"
    role="menuitem"
  >
    <Trash :size="21" weight="fill" />
    <p>Delete</p>
  </button>
</template>

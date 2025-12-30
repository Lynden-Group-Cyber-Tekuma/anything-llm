<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Trash, DotsThreeVertical, TreeView } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  chatId: String,
  forkThread: Function,
  isEditing: Boolean,
  role: String
})

const { t } = useI18n()
const open = ref(false)
const menuRef = ref(null)

const toggleMenu = () => {
  open.value = !open.value
}

const handleFork = () => {
  props.forkThread(props.chatId)
  open.value = false
}

const handleDelete = () => {
  window.dispatchEvent(
    new CustomEvent('delete-message', { detail: { chatId: props.chatId } })
  )
  open.value = false
}

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div v-if="chatId && !isEditing && role !== 'user'" class="mt-2 -ml-0.5 relative" ref="menuRef">
    <button
      @click="toggleMenu"
      class="border-none text-[var(--theme-sidebar-footer-icon-fill)] hover:text-[var(--theme-sidebar-footer-icon-fill)] transition-colors duration-200"
      data-tooltip-id="action-menu"
      :data-tooltip-content="t('chat_window.more_actions')"
      :aria-label="t('chat_window.more_actions')"
    >
      <DotsThreeVertical :size="24" weight="bold" />
    </button>
    <div
      v-if="open"
      class="absolute -top-1 left-7 mt-1 border-[1.5px] border-white/40 rounded-lg bg-theme-action-menu-bg flex flex-col shadow-[0_4px_14px_rgba(0,0,0,0.25)] text-white z-99 md:z-10"
    >
      <button
        @click="handleFork"
        class="border-none rounded-t-lg flex items-center text-white gap-x-2 hover:bg-theme-action-menu-item-hover py-1.5 px-2 transition-colors duration-200 w-full text-left"
      >
        <TreeView :size="18" />
        <span class="text-sm">{{ t('chat_window.fork') }}</span>
      </button>
      <button
        @click="handleDelete"
        class="border-none flex rounded-b-lg items-center text-white gap-x-2 hover:bg-theme-action-menu-item-hover py-1.5 px-2 transition-colors duration-200 w-full text-left"
      >
        <Trash :size="18" />
        <span class="text-sm">{{ t('chat_window.delete') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Workspace from '@/models/workspace'
import paths from '@/utils/paths'
import showToast from '@/utils/toast'
import { PhPencilSimple, PhTrash } from '@phosphor-icons/vue'

const props = defineProps({
  containerRef: {
    type: Object,
    required: true
  },
  workspace: {
    type: Object,
    required: true
  },
  thread: {
    type: Object,
    required: true
  },
  onRemove: {
    type: Function,
    required: true
  },
  close: {
    type: Function,
    required: true
  },
  currentThreadSlug: {
    type: String,
    default: null
  }
})

const menuRef = ref(null)

// Click outside handler
function outsideClick(e) {
  if (!menuRef.value) return false
  if (
    !menuRef.value?.contains(e.target) &&
    !props.containerRef?.contains(e.target)
  ) {
    props.close()
  }
  return false
}

// Escape key handler
function isEsc(e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    props.close()
  }
}

function cleanupListeners() {
  window.removeEventListener('click', outsideClick)
  window.removeEventListener('keyup', isEsc)
}

onMounted(() => {
  if (!menuRef.value || !props.containerRef) return
  window.document.addEventListener('click', outsideClick)
  window.document.addEventListener('keyup', isEsc)
})

onUnmounted(() => {
  cleanupListeners()
})

async function renameThread() {
  const name = window
    .prompt('What would you like to rename this thread to?')
    ?.trim()
  if (!name || name.length === 0) {
    props.close()
    return
  }

  const { message } = await Workspace.threads.update(
    props.workspace.slug,
    props.thread.slug,
    { name }
  )
  if (message) {
    showToast(`Thread could not be updated! ${message}`, 'error', {
      clear: true
    })
    props.close()
    return
  }

  props.thread.name = name
  props.close()
}

async function handleDelete() {
  if (
    !window.confirm(
      'Are you sure you want to delete this thread? All of its chats will be deleted. You cannot undo this.'
    )
  ) {
    return
  }

  const success = await Workspace.threads.delete(
    props.workspace.slug,
    props.thread.slug
  )

  if (!success) {
    showToast('Thread could not be deleted!', 'error', { clear: true })
    return
  }

  if (success) {
    showToast('Thread deleted successfully!', 'success', { clear: true })
    props.onRemove(props.thread.id)
    // Redirect if deleting the active thread
    if (props.currentThreadSlug === props.thread.slug) {
      window.location.href = paths.workspace.chat(props.workspace.slug)
    }
    return
  }
}
</script>

<template>
  <div
    ref="menuRef"
    class="absolute w-fit z-[20] top-[25px] right-[10px] bg-zinc-900 light:bg-theme-bg-sidebar light:border-[1px] light:border-theme-sidebar-border rounded-lg p-1"
  >
    <button
      @click="renameThread"
      type="button"
      class="w-full rounded-md flex items-center p-2 gap-x-2 hover:bg-slate-500/20 text-slate-300 light:text-theme-text-primary"
    >
      <PencilSimple :size="18" />
      <p class="text-sm">Rename</p>
    </button>
    <button
      @click="handleDelete"
      type="button"
      class="w-full rounded-md flex items-center p-2 gap-x-2 hover:bg-red-500/20 text-slate-300 light:text-theme-text-primary hover:text-red-100"
    >
      <PhTrash :size="18" />
      <p class="text-sm">Delete Thread</p>
    </button>
  </div>
</template>

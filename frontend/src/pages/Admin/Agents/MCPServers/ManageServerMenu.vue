<template>
  <div class="relative" ref="menuRef">
    <button
      type="button"
      @click="open = !open"
      class="p-1.5 rounded-lg text-white hover:bg-theme-action-menu-item-hover transition-colors duration-300"
    >
      <Gear class="h-5 w-5" weight="bold" />
    </button>
    <div
      v-if="open"
      class="absolute w-[150px] top-1 left-7 mt-1 border-[1.5px] border-white/40 rounded-lg bg-theme-action-menu-bg flex flex-col shadow-[0_4px_14px_rgba(0,0,0,0.25)] text-white z-99 md:z-10"
    >
      <button
        type="button"
        @click="handleToggleServer"
        class="border-none flex items-center rounded-lg gap-x-2 hover:bg-theme-action-menu-item-hover py-1.5 px-2 transition-colors duration-200 w-full text-left"
      >
        <span class="text-sm">
          {{ running ? 'Stop MCP Server' : 'Start MCP Server' }}
        </span>
      </button>
      <button
        type="button"
        @click="deleteServer"
        class="border-none flex items-center rounded-lg gap-x-2 hover:bg-theme-action-menu-item-hover py-1.5 px-2 transition-colors duration-200 w-full text-left"
      >
        <span class="text-sm">Delete MCP Server</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import showToast from '@/utils/toast'
import { Gear } from '@phosphor-icons/vue'
import MCPServers from '@/models/mcpServers'

const props = defineProps({
  server: {
    type: Object,
    required: true
  },
  toggleServer: {
    type: Function,
    required: true
  },
  onDelete: {
    type: Function,
    required: true
  }
})

const open = ref(false)
const running = ref(props.server.running)
const menuRef = ref(null)

async function deleteServer() {
  if (
    !window.confirm(
      'Are you sure you want to delete this MCP server? It will be removed from your config file and you will need to add it back manually.'
    )
  )
    return
  const { success, error } = await MCPServers.deleteServer(props.server.name)
  if (success) {
    showToast('MCP server deleted successfully.', 'success')
    props.onDelete(props.server.name)
  } else {
    showToast(error || 'Failed to delete MCP server.', 'error')
  }
}

async function handleToggleServer() {
  if (
    !window.confirm(
      running.value
        ? 'Are you sure you want to stop this MCP server? It will be started automatically when you next start the server.'
        : 'Are you sure you want to start this MCP server? It will be started automatically when you next start the server.'
    )
  )
    return

  const { success, error } = await MCPServers.toggleServer(props.server.name)
  if (success) {
    const newState = !running.value
    running.value = newState
    props.toggleServer(props.server.name)
    showToast(
      `MCP server ${props.server.name} ${newState ? 'started' : 'stopped'} successfully.`,
      'success',
      { clear: true }
    )
  } else {
    showToast(error || 'Failed to toggle MCP server.', 'error', {
      clear: true
    })
  }
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

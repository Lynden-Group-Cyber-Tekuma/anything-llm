<template>
  <div>
    <div class="text-theme-text-primary flex items-center justify-between gap-x-2 mt-4">
      <div class="flex items-center gap-x-2">
        <img :src="MCPLogo" class="w-6 h-6 light:invert" alt="MCP Logo" />
        <p class="text-lg font-medium">MCP Servers</p>
      </div>
      <div class="flex items-center gap-x-3">
        <a
          href="https://docs.anythingllm.com/mcp-compatibility/overview"
          target="_blank"
          rel="noopener noreferrer"
          class="border-none text-theme-text-secondary hover:text-cta-button"
        >
          <BookOpenText :size="16" />
        </a>
        <button
          type="button"
          @click="refreshMCPServers"
          :disabled="loadingMcpServers"
          class="border-none text-theme-text-secondary hover:text-cta-button flex items-center gap-x-1"
        >
          <ArrowClockwise
            :size="16"
            :class="{ 'animate-spin': loadingMcpServers }"
          />
          <p class="text-sm">
            {{ loadingMcpServers ? 'Loading...' : 'Refresh' }}
          </p>
        </button>
      </div>
    </div>
    <slot :loading-mcp-servers="loadingMcpServers" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { titleCase } from 'text-case'
import { PhBookOpenText, PhArrowClockwise } from '@phosphor-icons/vue'
import MCPLogo from '@/media/agents/mcp-logo.svg'
import MCPServers from '@/models/mcpServers'
import showToast from '@/utils/toast'

const props = defineProps({
  setMcpServers: {
    type: Function,
    required: true
  },
  setSelectedMcpServer: {
    type: Function,
    required: true
  }
})

const loadingMcpServers = ref(false)

onMounted(async () => {
  loadingMcpServers.value = true
  const { servers = [] } = await MCPServers.listServers()
  props.setMcpServers(servers)
  loadingMcpServers.value = false
})

const refreshMCPServers = () => {
  if (
    window.confirm(
      'Are you sure you want to refresh the list of MCP servers? This will restart all MCP servers and reload their tools.'
    )
  ) {
    loadingMcpServers.value = true
    MCPServers.forceReload()
      .then(({ servers = [] }) => {
        props.setSelectedMcpServer(null)
        props.setMcpServers(servers)
      })
      .catch((err) => {
        console.error(err)
        showToast('Failed to refresh MCP servers.', 'error', { clear: true })
      })
      .finally(() => {
        loadingMcpServers.value = false
      })
  }
}
</script>

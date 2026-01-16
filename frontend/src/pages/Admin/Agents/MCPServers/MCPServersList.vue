<template>
  <div v-if="isLoading" class="text-theme-text-secondary text-center text-xs flex flex-col gap-y-2">
    <p>Loading MCP Servers from configuration file...</p>
    <a
      href="https://docs.anythingllm.com/mcp-compatibility/overview"
      target="_blank"
      rel="noopener noreferrer"
      class="text-theme-text-secondary underline hover:text-cta-button"
    >
      Learn more about MCP Servers.
    </a>
  </div>

  <div v-else-if="servers.length === 0" class="text-theme-text-secondary text-center text-xs flex flex-col gap-y-2">
    <p>No MCP servers found</p>
    <a
      href="https://docs.anythingllm.com/mcp-compatibility/overview"
      target="_blank"
      rel="noopener noreferrer"
      class="text-theme-text-secondary underline hover:text-cta-button"
    >
      Learn more about MCP Servers.
    </a>
  </div>

  <div v-else class="bg-theme-bg-secondary text-white rounded-xl w-full md:min-w-[360px]">
    <div
      v-for="(server, index) in servers"
      :key="server.name"
      :class="[
        'py-3 px-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-theme-bg-primary',
        index === 0 ? 'rounded-t-xl' : '',
        index === servers.length - 1 ? 'rounded-b-xl' : 'border-b border-white/10',
        selectedServer?.name === server.name ? 'bg-white/10 light:bg-theme-bg-sidebar' : ''
      ]"
      @click="handleClick?.(server)"
    >
      <div class="text-sm font-light">
        {{ titleCase(server.name.replace(/[_-]/g, ' ')) }}
      </div>
      <div class="flex items-center gap-x-2">
        <div
          :class="[
            'text-sm text-theme-text-secondary font-medium',
            server.running ? 'text-green-500' : 'text-red-500'
          ]"
        >
          {{ server.running ? 'On' : 'Stopped' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { titleCase } from 'text-case'

defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  servers: {
    type: Array,
    default: () => []
  },
  selectedServer: {
    type: Object,
    default: null
  },
  handleClick: {
    type: Function,
    default: null
  }
})
</script>

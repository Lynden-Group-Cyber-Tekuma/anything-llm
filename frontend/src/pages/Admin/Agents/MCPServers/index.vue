<template>
  <div>
    <MCPServerHeader
      :set-mcp-servers="setMcpServers"
      :set-selected-mcp-server="setSelectedMcpServer"
    >
      <template #default="{ loadingMcpServers }">
        <MCPServersList
          :is-loading="loadingMcpServers"
          :servers="mcpServers"
          :selected-server="selectedMcpServer"
          :handle-click="handleClick"
        />
      </template>
    </MCPServerHeader>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MCPServerHeader from './MCPServerHeader.vue'
import MCPServersList from './MCPServersList.vue'

const props = defineProps({
  mcpServers: {
    type: Array,
    default: () => []
  },
  selectedMcpServer: {
    type: Object,
    default: null
  },
  setMcpServers: {
    type: Function,
    required: true
  },
  setSelectedMcpServer: {
    type: Function,
    required: true
  },
  handleClick: {
    type: Function,
    default: null
  }
})
</script>

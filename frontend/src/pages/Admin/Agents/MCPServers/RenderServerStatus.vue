<template>
  <div v-if="!server.running && server.error" class="flex flex-col gap-y-2">
    <p class="text-theme-text-primary text-sm">
      This MCP server is not running - it may be stopped or experiencing an
      error on startup.
    </p>
    <div class="bg-theme-bg-primary rounded-lg p-4">
      <p class="text-red-500 text-sm font-mono">{{ server.error }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  server: {
    type: Object,
    required: true
  }
})
</script>

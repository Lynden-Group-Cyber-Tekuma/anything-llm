<template>
  <div v-if="tools.length > 0" class="flex flex-col gap-y-2">
    <div class="flex flex-col gap-y-2">
      <ServerTool v-for="tool in tools" :key="tool.name" :tool="tool" />
    </div>
  </div>
</template>

<script setup>
import ServerTool from './ServerTool.vue'

defineProps({
  tools: {
    type: Array,
    default: () => []
  }
})
</script>

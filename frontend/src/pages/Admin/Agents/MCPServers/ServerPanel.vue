<template>
  <div class="p-2">
    <div class="flex flex-col gap-y-[18px] max-w-[800px]">
      <div class="flex w-full justify-between">
        <div class="flex items-center gap-x-2">
          <img :src="MCPLogo" class="w-6 h-6 light:invert" />
          <label for="name" class="text-white text-md font-bold">
            {{ titleCase(server.name.replace(/[_-]/g, ' ')) }}
          </label>
          <p v-if="server.tools.length > 0" class="text-theme-text-secondary text-sm">
            {{ server.tools.length }} {{ pluralize('tool', server.tools.length) }} available
          </p>
        </div>
        <ManageServerMenu
          :key="server.name"
          :server="server"
          :toggle-server="toggleServer"
          :on-delete="onDelete"
        />
      </div>
      <RenderServerConfig :config="server.config" />
      <RenderServerStatus :server="server" />
      <RenderServerTools :tools="server.tools" />
    </div>
  </div>
</template>

<script setup>
import { titleCase } from 'text-case'
import MCPLogo from '@/media/agents/mcp-logo.svg'
import pluralize from 'pluralize'
import ManageServerMenu from './ManageServerMenu.vue'
import RenderServerConfig from './RenderServerConfig.vue'
import RenderServerStatus from './RenderServerStatus.vue'
import RenderServerTools from './RenderServerTools.vue'

defineProps({
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
</script>

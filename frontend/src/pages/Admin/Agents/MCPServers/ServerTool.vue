<template>
  <button
    type="button"
    @click="open = !open"
    class="flex flex-col gap-y-2 px-4 py-2 rounded-lg border border-theme-text-secondary"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-x-2">
        <p class="text-theme-text-primary font-mono font-bold text-sm">
          {{ tool.name }}
        </p>
        <p v-if="!open" class="text-theme-text-secondary text-sm">
          {{ truncate(tool.description, 70) }}
        </p>
      </div>
      <div class="border-none text-theme-text-secondary hover:text-cta-button">
        <CaretDown :size="16" />
      </div>
    </div>
    <div v-if="open" class="flex flex-col gap-y-2">
      <div class="flex flex-col gap-y-2">
        <p class="text-theme-text-secondary text-sm text-left">
          {{ tool.description }}
        </p>
      </div>
      <div class="flex flex-col gap-y-2">
        <p class="text-theme-text-primary text-sm text-left">
          Tool call arguments
        </p>
        <div class="flex flex-col gap-y-2">
          <div
            v-for="[key, value] in Object.entries(tool.inputSchema?.properties || {})"
            :key="key"
            class="flex items-center gap-x-2"
          >
            <p class="text-theme-text-secondary text-sm text-left font-bold">
              {{ key }}
              <sup v-if="tool.inputSchema?.required?.includes(key)" class="text-red-500">*</sup>
            </p>
            <p class="text-theme-text-secondary text-sm text-left">
              {{ value.type }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { PhCaretDown } from '@phosphor-icons/vue'
import truncate from 'truncate'

defineProps({
  tool: {
    type: Object,
    required: true
  }
})

const open = ref(false)
</script>

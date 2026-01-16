<template>
  <div v-if="flows.length === 0" class="text-theme-text-secondary text-center text-xs flex flex-col gap-y-2">
    <p>No agent flows found</p>
    <a
      href="https://docs.anythingllm.com/agent-flows/getting-started"
      target="_blank"
      class="text-theme-text-secondary underline hover:text-cta-button"
    >
      Learn more about Agent Flows.
    </a>
  </div>

  <div v-else class="bg-theme-bg-secondary text-white rounded-xl w-full md:min-w-[360px]">
    <div
      v-for="(flow, index) in flows"
      :key="flow.uuid"
      :class="[
        'py-3 px-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-theme-bg-primary',
        index === 0 ? 'rounded-t-xl' : '',
        index === flows.length - 1 ? 'rounded-b-xl' : 'border-b border-white/10',
        selectedFlow?.uuid === flow.uuid ? 'bg-white/10 light:bg-theme-bg-sidebar' : ''
      ]"
      @click="handleClick?.(flow)"
    >
      <div class="text-sm font-light">{{ flow.name }}</div>
      <div class="flex items-center gap-x-2">
        <div class="text-sm text-theme-text-secondary font-medium">
          {{ flow.active ? 'On' : 'Off' }}
        </div>
        <CaretRight
          :size="14"
          weight="bold"
          class="text-theme-text-secondary"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { PhCaretRight } from '@phosphor-icons/vue'

defineProps({
  flows: {
    type: Array,
    default: () => []
  },
  selectedFlow: {
    type: Object,
    default: null
  },
  handleClick: {
    type: Function,
    default: null
  }
})
</script>

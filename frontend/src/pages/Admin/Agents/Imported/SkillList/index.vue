<template>
  <div v-if="skills.length === 0" class="text-theme-text-secondary text-center text-xs flex flex-col gap-y-2">
    <p>No imported skills found</p>
    <p>
      Learn about agent skills in the
      <a
        href="https://docs.anythingllm.com/agent/custom/developer-guide"
        target="_blank"
        class="text-theme-text-secondary underline hover:text-cta-button"
      >
        AnythingLLM Agent Docs
      </a>.
    </p>
  </div>

  <div v-else class="bg-theme-bg-secondary text-white rounded-xl w-full md:min-w-[360px]">
    <div
      v-for="(config, index) in skills"
      :key="config.hubId"
      :class="[
        'py-3 px-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-theme-bg-primary',
        index === 0 ? 'rounded-t-xl' : '',
        index === skills.length - 1 ? 'rounded-b-xl' : 'border-b border-white/10',
        selectedSkill === config.hubId ? 'bg-theme-bg-primary' : ''
      ]"
      @click="handleClick?.({ ...config, imported: true })"
    >
      <div class="text-sm font-light">{{ sentenceCase(config.name) }}</div>
      <div class="flex items-center gap-x-2">
        <div class="text-sm text-theme-text-secondary font-medium">
          {{ config.active ? 'On' : 'Off' }}
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
import { sentenceCase } from 'text-case'

defineProps({
  skills: {
    type: Array,
    default: () => []
  },
  selectedSkill: {
    type: [String, Object],
    default: null
  },
  handleClick: {
    type: Function,
    default: null
  }
})
</script>

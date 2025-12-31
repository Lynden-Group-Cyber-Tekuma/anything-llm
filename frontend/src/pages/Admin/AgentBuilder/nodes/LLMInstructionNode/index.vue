<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-theme-text-primary mb-2">
        Instruction
      </label>
      <textarea
        :value="config?.instruction || ''"
        @input="(e) =>
          onConfigChange({
            ...config,
            instruction: e.target.value,
          })
        "
        class="w-full border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
        rows="3"
        placeholder="Enter instructions for the LLM..."
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-theme-text-primary mb-2">
        Result Variable
      </label>
      <VariableSelect
        :value="config.resultVariable"
        :on-change="(value) => onConfigChange({ ...config, resultVariable: value })"
        :available-variables="availableVariables"
        placeholder="Select or create variable"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import VariableSelect from '../VariableSelect.vue'

defineProps({
  config: {
    type: Object,
    required: true
  },
  onConfigChange: {
    type: Function,
    required: true
  },
  renderVariableSelect: {
    type: Function,
    required: false
  }
})

const getAvailableVariables = inject('getAvailableVariables', () => [])
const availableVariables = computed(() => getAvailableVariables())
</script>

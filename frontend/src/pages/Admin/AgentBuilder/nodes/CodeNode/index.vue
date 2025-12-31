<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-white mb-2">
        Language
      </label>
      <select
        :value="config.language"
        @change="(e) => onConfigChange({ language: e.target.value })"
        class="w-full p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-white focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none"
      >
        <option value="javascript" class="bg-theme-bg-primary">
          JavaScript
        </option>
        <option value="python" class="bg-theme-bg-primary">
          Python
        </option>
        <option value="shell" class="bg-theme-bg-primary">
          Shell
        </option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-white mb-2">
        Code
      </label>
      <textarea
        placeholder="Enter code..."
        :value="config.code"
        @input="(e) => onConfigChange({ code: e.target.value })"
        class="w-full p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-white placeholder:text-white/20 focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none font-mono"
        rows="5"
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-white mb-2">
        Store Result In
      </label>
      <VariableSelect
        :value="config.resultVariable"
        :on-change="(value) => onConfigChange({ resultVariable: value })"
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

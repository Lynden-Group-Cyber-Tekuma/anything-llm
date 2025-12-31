<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-white mb-2">URL</label>
      <input
        type="text"
        placeholder="https://example.com"
        :value="config.url"
        @input="(e) => onConfigChange({ url: e.target.value })"
        class="w-full p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-white placeholder:text-white/20 focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none"
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-white mb-2">
        Action
      </label>
      <select
        :value="config.action"
        @change="(e) => onConfigChange({ action: e.target.value })"
        class="w-full p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-white focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none"
      >
        <option value="read" class="bg-theme-bg-primary">
          Read Content
        </option>
        <option value="click" class="bg-theme-bg-primary">
          Click Element
        </option>
        <option value="type" class="bg-theme-bg-primary">
          Type Text
        </option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-white mb-2">
        CSS Selector
      </label>
      <input
        type="text"
        placeholder="#element-id or .class-name"
        :value="config.selector"
        @input="(e) => onConfigChange({ selector: e.target.value })"
        class="w-full p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-white placeholder:text-white/20 focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none"
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

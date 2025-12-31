<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-white mb-2">
        Operation
      </label>
      <select
        :value="config.operation"
        @change="(e) => onConfigChange({ operation: e.target.value })"
        class="w-full p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-white focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none"
      >
        <option value="read" class="bg-theme-bg-primary">
          Read File
        </option>
        <option value="write" class="bg-theme-bg-primary">
          Write File
        </option>
        <option value="append" class="bg-theme-bg-primary">
          Append to File
        </option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-white mb-2">
        File Path
      </label>
      <input
        type="text"
        placeholder="/path/to/file"
        :value="config.path"
        @input="(e) => onConfigChange({ path: e.target.value })"
        class="w-full p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-white placeholder:text-white/20 focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none"
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    <div v-if="config.operation !== 'read'">
      <label class="block text-sm font-medium text-white mb-2">
        Content
      </label>
      <textarea
        placeholder="File content..."
        :value="config.content"
        @input="(e) => onConfigChange({ content: e.target.value })"
        class="w-full p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-white placeholder:text-white/20 focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none"
        rows="3"
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

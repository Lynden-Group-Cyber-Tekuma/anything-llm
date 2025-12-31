<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-theme-text-primary mb-2">
        URL to Scrape
      </label>
      <input
        type="url"
        :value="config?.url || ''"
        @input="(e) =>
          onConfigChange({
            ...config,
            url: e.target.value,
          })
        "
        class="w-full border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
        placeholder="https://example.com"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-theme-text-primary mb-2">
        Capture Page Content As
      </label>
      <select
        :value="config.captureAs"
        @change="(e) =>
          onConfigChange({ ...config, captureAs: e.target.value })
        "
        class="w-full border-none bg-theme-settings-input-bg text-theme-text-primary text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
      >
        <option
          v-for="captureAs in [
            { label: 'Text content only', value: 'text' },
            { label: 'Raw HTML', value: 'html' },
            { label: 'CSS Query Selector', value: 'querySelector' },
          ]"
          :key="captureAs.value"
          :value="captureAs.value"
          class="bg-theme-settings-input-bg"
        >
          {{ captureAs.label }}
        </option>
      </select>
    </div>

    <div v-if="config.captureAs === 'querySelector'">
      <label class="block text-sm font-medium text-theme-text-primary mb-2">
        Query Selector
      </label>
      <p class="text-xs text-theme-text-secondary mb-2">
        Enter a valid CSS selector to scrape the content of the page.
      </p>
      <input
        :value="config.querySelector"
        @input="(e) =>
          onConfigChange({ ...config, querySelector: e.target.value })
        "
        placeholder=".article-content, #content, .main-content, etc."
        class="w-full border-none bg-theme-settings-input-bg text-theme-text-primary text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
      />
    </div>

    <div class="flex justify-between items-center">
      <div class="flex flex-row items-center gap-x-1 mb-2">
        <label class="block text-sm font-medium text-theme-text-primary">
          Content Summarization
        </label>
        <Info
          :size="16"
          class="text-theme-text-secondary cursor-pointer"
          data-tooltip-id="content-summarization-tooltip"
        />
      </div>
      <div class="flex items-center gap-2 mb-2">
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            :checked="config.enableSummarization ?? true"
            @change="(e) =>
              onConfigChange({
                ...config,
                enableSummarization: e.target.checked,
              })
            "
            class="sr-only peer"
            aria-label="Toggle content summarization"
          />
          <div class="w-11 h-6 bg-theme-settings-input-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-button/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-button"></div>
        </label>
      </div>
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
import { Info } from '@phosphor-icons/vue'
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

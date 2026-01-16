<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  availableProviders: {
    type: Array,
    default: () => []
  },
  selectedLLMProvider: String,
  onSearchChange: Function,
  onProviderClick: Function
})

const { t } = useI18n()
</script>

<template>
  <div class="w-[40%] h-full flex flex-col gap-y-1 border-r-2 border-theme-modal-border py-2 px-[5px]">
    <input
      id="llm-search-input"
      type="search"
      :placeholder="t('chat_window.workspace_llm_manager.search')"
      @change="onSearchChange"
      class="search-input bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder outline-none text-sm rounded-lg px-2 py-2 w-full h-[32px] border-theme-modal-border border border-solid"
    />
    <div class="flex flex-col gap-y-2 overflow-y-scroll">
      <button
        v-for="llm in availableProviders"
        :key="llm.value"
        type="button"
        :data-llm-value="llm.value"
        :class="`border-none hover:cursor-pointer hover:bg-theme-checklist-item-bg-hover flex gap-x-2 items-center p-2 rounded-md ${selectedLLMProvider === llm.value ? 'bg-theme-checklist-item-bg' : ''}`"
        @click="() => onProviderClick(llm.value)"
      >
        <img
          :src="llm.logo"
          :alt="`${llm.name} logo`"
          class="w-6 h-6 rounded-md"
        />
        <div class="flex flex-col">
          <div class="text-xs text-theme-text-primary">{{ llm.name }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

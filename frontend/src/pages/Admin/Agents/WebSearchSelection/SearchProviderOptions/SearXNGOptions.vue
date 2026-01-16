<template>
  <div class="flex gap-x-4">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        SearXNG API Base URL
      </label>
      <input
        type="url"
        name="env::AgentSearXNGApiUrl"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="SearXNG API Base URL"
        :value="settings?.AgentSearXNGApiUrl"
        required
        autocomplete="off"
        spellcheck="false"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})
</script>

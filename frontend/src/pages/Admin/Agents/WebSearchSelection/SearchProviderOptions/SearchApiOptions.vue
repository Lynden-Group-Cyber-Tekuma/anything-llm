<template>
  <div>
    <p class="text-sm text-white/60 my-2">
      You can get a free API key
      <a
        href="https://www.searchapi.io/"
        target="_blank"
        rel="noreferrer"
        class="text-blue-300 underline"
      >
        from SearchApi.
      </a>
    </p>
    <div class="flex gap-x-4">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          API Key
        </label>
        <input
          type="password"
          name="env::AgentSearchApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="SearchApi API Key"
          :value="settings?.AgentSearchApiKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Engine
        </label>
        <select
          name="env::AgentSearchApiEngine"
          required
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          :value="settings?.AgentSearchApiEngine || 'google'"
        >
          <option v-for="{ name, value } in SearchApiEngines" :key="name" :value="value">
            {{ name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
const SearchApiEngines = [
  { name: 'Google Search', value: 'google' },
  { name: 'Google Maps', value: 'google_maps' },
  { name: 'Google Shopping', value: 'google_shopping' },
  { name: 'Google News', value: 'google_news' },
  { name: 'Google Jobs', value: 'google_jobs' },
  { name: 'Google Scholar', value: 'google_scholar' },
  { name: 'Google Finance', value: 'google_finance' },
  { name: 'Google Patents', value: 'google_patents' },
  { name: 'YouTube', value: 'youtube' },
  { name: 'Bing', value: 'bing' },
  { name: 'Bing News', value: 'bing_news' },
  { name: 'Amazon Product Search', value: 'amazon_search' },
  { name: 'Baidu', value: 'baidu' }
]

defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div>
    <p class="text-sm text-white/60 my-2">
      Get a free API key
      <a
        href="https://serpapi.com/"
        target="_blank"
        rel="noreferrer"
        class="text-blue-300 underline"
      >
        from SerpApi.
      </a>
    </p>
    <div class="flex gap-x-4">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          API Key
        </label>
        <input
          type="password"
          name="env::AgentSerpApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="SerpApi API Key"
          :value="settings?.AgentSerpApiKey ? '*'.repeat(20) : ''"
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
          name="env::AgentSerpApiEngine"
          required
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          :value="settings?.AgentSerpApiEngine || 'google'"
        >
          <option v-for="{ name, value } in SerpApiEngines" :key="name" :value="value">
            {{ name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
const SerpApiEngines = [
  { name: 'Google Search', value: 'google' },
  { name: 'Google Images', value: 'google_images_light' },
  { name: 'Google Jobs', value: 'google_jobs' },
  { name: 'Google Maps', value: 'google_maps' },
  { name: 'Google News', value: 'google_news_light' },
  { name: 'Google Patents', value: 'google_patents' },
  { name: 'Google Scholar', value: 'google_scholar' },
  { name: 'Google Shopping', value: 'google_shopping_light' },
  { name: 'Amazon', value: 'amazon' },
  { name: 'Baidu', value: 'baidu' }
]

defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})
</script>

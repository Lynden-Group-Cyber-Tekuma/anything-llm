<template>
  <div>
    <p class="text-sm text-white/60 my-2">
      You can get a free search engine & API key
      <a
        href="https://programmablesearchengine.google.com/controlpanel/create"
        target="_blank"
        rel="noreferrer"
        class="text-blue-300 underline"
      >
        from Google here.
      </a>
    </p>
    <div class="flex gap-x-4">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Search engine ID
        </label>
        <input
          type="text"
          name="env::AgentGoogleSearchEngineId"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Google Search Engine Id"
          :value="settings?.AgentGoogleSearchEngineId"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Programmatic Access API Key
        </label>
        <input
          type="password"
          name="env::AgentGoogleSearchEngineKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Google Search Engine API Key"
          :value="settings?.AgentGoogleSearchEngineKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
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

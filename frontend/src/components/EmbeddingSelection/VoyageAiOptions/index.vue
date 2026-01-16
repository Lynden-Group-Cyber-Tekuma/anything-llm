<script setup>
const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const availableModels = [
  'voyage-large-2-instruct',
  'voyage-finance-2',
  'voyage-multilingual-2',
  'voyage-law-2',
  'voyage-code-2',
  'voyage-large-2',
  'voyage-2',
  'voyage-3',
  'voyage-3-lite',
  'voyage-3-large',
  'voyage-code-3'
]
</script>

<template>
  <div class="w-full flex flex-col gap-y-4">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          API Key
        </label>
        <input
          type="password"
          name="VoyageAiApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Voyage AI API Key"
          :value="settings?.VoyageAiApiKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Model Preference
        </label>
        <select
          name="EmbeddingModelPref"
          required
          :value="settings?.EmbeddingModelPref"
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <optgroup label="Available embedding models">
            <option
              v-for="model in availableModels"
              :key="model"
              :value="model"
            >
              {{ model }}
            </option>
          </optgroup>
        </select>
      </div>
    </div>
  </div>
</template>

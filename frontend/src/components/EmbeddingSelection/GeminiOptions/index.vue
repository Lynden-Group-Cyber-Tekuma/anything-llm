<script setup>
const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const DEFAULT_MODELS = [
  {
    id: 'embedding-001',
    name: 'Embedding 001'
  },
  {
    id: 'text-embedding-004',
    name: 'Text Embedding 004'
  },
  {
    id: 'gemini-embedding-exp-03-07',
    name: 'Gemini Embedding Exp 03 07'
  }
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
          name="GeminiEmbeddingApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Gemini API Key"
          :value="settings?.GeminiEmbeddingApiKey ? '*'.repeat(20) : ''"
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
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <optgroup label="Available embedding models">
            <option
              v-for="model in DEFAULT_MODELS"
              :key="model.id"
              :value="model.id"
              :selected="settings?.EmbeddingModelPref === model.id"
            >
              {{ model.name }}
            </option>
          </optgroup>
        </select>
      </div>
    </div>
  </div>
</template>

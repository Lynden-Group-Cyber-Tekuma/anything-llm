<script setup>
const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-y-4">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Azure Service Endpoint
        </label>
        <input
          type="url"
          name="AzureOpenAiEndpoint"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="https://my-azure.openai.azure.com"
          :value="settings?.AzureOpenAiEndpoint"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          API Key
        </label>
        <input
          type="password"
          name="AzureOpenAiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Azure OpenAI API Key"
          :value="settings?.AzureOpenAiKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Embedding Deployment Name
        </label>
        <input
          type="text"
          name="AzureOpenAiEmbeddingModelPref"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Azure OpenAI embedding model deployment name"
          :value="settings?.AzureOpenAiEmbeddingModelPref"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>
  </div>
</template>

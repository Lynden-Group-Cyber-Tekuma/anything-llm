<script setup>
import { PhInfo } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'

defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const { t } = useI18n()
</script>

<template>
  <div class="w-full flex flex-col gap-y-7 mt-1.5">
    <div class="w-full flex items-center gap-[36px]">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          {{ t('llm.providers.azure_openai.azure_service_endpoint') }}
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
          {{ t('llm.providers.azure_openai.api_key') }}
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
          {{ t('llm.providers.azure_openai.chat_deployment_name') }}
        </label>
        <input
          type="text"
          name="AzureOpenAiModelPref"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Azure OpenAI chat model deployment name"
          :value="settings?.AzureOpenAiModelPref"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>

    <div class="w-full flex items-center gap-[36px]">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          {{ t('llm.providers.azure_openai.chat_model_token_limit') }}
        </label>
        <select
          name="AzureOpenAiTokenLimit"
          :value="settings?.AzureOpenAiTokenLimit || 4096"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          required
        >
          <option :value="4096">4,096 (gpt-3.5-turbo)</option>
          <option :value="16384">16,384 (gpt-3.5-16k)</option>
          <option :value="8192">8,192 (gpt-4)</option>
          <option :value="32768">32,768 (gpt-4-32k)</option>
          <option :value="128000">
            128,000 (gpt-4-turbo,gpt-4o,gpt-4o-mini,o1-mini)
          </option>
          <option :value="200000">200,000 (o1,o1-pro,o3-mini)</option>
          <option :value="1047576">1,047,576 (gpt-4.1)</option>
        </select>
      </div>

      <div class="flex flex-col w-60">
        <div class="flex items-center gap-1 mb-3">
          <label class="text-white text-sm font-semibold block">
            {{ t('llm.providers.azure_openai.model_type') }}
          </label>
          <div
            class="text-theme-text-secondary cursor-pointer hover:bg-theme-bg-primary flex items-center justify-center rounded-full"
            :title="t('llm.providers.azure_openai.model_type_tooltip')"
          >
            <PhInfo :size="18" class="text-theme-text-secondary" />
          </div>
        </div>
        <select
          name="AzureOpenAiModelType"
          :value="settings?.AzureOpenAiModelType || 'default'"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          required
        >
          <option value="default">
            {{ t('llm.providers.azure_openai.default') }}
          </option>
          <option value="reasoning">
            {{ t('llm.providers.azure_openai.reasoning') }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

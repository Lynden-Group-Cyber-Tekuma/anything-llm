<script setup>
import { ref } from 'vue'
import { PhInfo } from '@phosphor-icons/vue'
import LiteLLMModelSelection from './LiteLLMModelSelection.vue'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const basePathValue = ref(props.settings?.LiteLLMBasePath)
const basePath = ref(props.settings?.LiteLLMBasePath)
const apiKeyValue = ref(props.settings?.LiteLLMAPIKey)
const apiKey = ref(props.settings?.LiteLLMAPIKey)

const handleBasePathChange = (e) => {
  basePathValue.value = e.target.value
}

const handleBasePathBlur = () => {
  basePath.value = basePathValue.value
}

const handleApiKeyChange = (e) => {
  apiKeyValue.value = e.target.value
}

const handleApiKeyBlur = () => {
  apiKey.value = apiKeyValue.value
}

const handleScroll = (e) => {
  e.target.blur()
}
</script>

<template>
  <div class="w-full flex flex-col gap-y-7">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Base URL
        </label>
        <input
          type="url"
          name="LiteLLMBasePath"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="http://127.0.0.1:4000"
          :value="settings?.LiteLLMBasePath"
          required
          autocomplete="off"
          spellcheck="false"
          @input="handleBasePathChange"
          @blur="handleBasePathBlur"
        />
      </div>
      <LiteLLMModelSelection
        :settings="settings"
        :basePath="basePath"
        :apiKey="apiKey"
      />
      <div class="flex flex-col w-60">
        <div
          :title="'Maximum length of text chunks, in characters, for embedding.'"
          class="flex gap-x-1 items-center mb-3"
        >
          <PhInfo :size="16" class="text-theme-text-secondary cursor-pointer" />
          <label class="text-white text-sm font-semibold block">
            Max embedding chunk length
          </label>
        </div>
        <input
          type="number"
          name="EmbeddingModelMaxChunkLength"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="8192"
          :min="1"
          @scroll="handleScroll"
          :value="settings?.EmbeddingModelMaxChunkLength"
          autocomplete="off"
        />
      </div>
    </div>
    <div class="w-full flex items-center gap-[36px]">
      <div class="flex flex-col w-60">
        <div class="flex flex-col gap-y-1 mb-4">
          <label class="text-white text-sm font-semibold flex items-center gap-x-2">
            API Key <p class="!text-xs !italic !font-thin">optional</p>
          </label>
        </div>
        <input
          type="password"
          name="LiteLLMAPIKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="sk-mysecretkey"
          :value="settings?.LiteLLMAPIKey ? '*'.repeat(20) : ''"
          autocomplete="off"
          spellcheck="false"
          @input="handleApiKeyChange"
          @blur="handleApiKeyBlur"
        />
      </div>
    </div>
  </div>
</template>

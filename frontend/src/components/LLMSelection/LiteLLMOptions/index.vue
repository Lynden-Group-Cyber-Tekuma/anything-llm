<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'

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
const customModels = ref([])
const loading = ref(true)

const handleScroll = (e) => {
  e.target.blur()
}

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

const findCustomModels = async () => {
  if (!basePath.value) {
    customModels.value = []
    loading.value = false
    return
  }
  loading.value = true
  const { models } = await System.customModels(
    'litellm',
    typeof apiKey.value === 'boolean' ? null : apiKey.value,
    basePath.value
  )
  customModels.value = models || []
  loading.value = false
}

watch(basePath, () => {
  findCustomModels()
})

watch(apiKey, () => {
  findCustomModels()
})

onMounted(() => {
  if (basePath.value) {
    findCustomModels()
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-y-7 mt-1.5">
    <div class="w-full flex items-center gap-[36px]">
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
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Chat Model Selection
        </label>
        <select
          v-if="loading || customModels.length === 0"
          name="LiteLLMModelPref"
          disabled
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled selected>
            {{ basePath?.includes('/v1') ? '-- loading available models --' : '-- waiting for URL --' }}
          </option>
        </select>
        <select
          v-else
          name="LiteLLMModelPref"
          required
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <optgroup v-if="customModels.length > 0" label="Your loaded models">
            <option
              v-for="model in customModels"
              :key="model.id"
              :value="model.id"
              :selected="settings.LiteLLMModelPref === model.id"
            >
              {{ model.id }}
            </option>
          </optgroup>
        </select>
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Token context window
        </label>
        <input
          type="number"
          name="LiteLLMTokenLimit"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="4096"
          :min="1"
          :value="settings?.LiteLLMTokenLimit"
          required
          autocomplete="off"
          @scroll="handleScroll"
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

<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'
import PreLoader from '@/components/Preloader'
import { OLLAMA_COMMON_URLS } from '@/utils/constants'
import { PhCaretDown, PhCaretUp, PhInfo } from '@phosphor-icons/vue'
import { useProviderEndpointAutoDiscovery } from '@/composables/useProviderEndpointAutoDiscovery'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const {
  autoDetecting: loading,
  basePath,
  basePathValue,
  authToken,
  authTokenValue,
  showAdvancedControls,
  setShowAdvancedControls,
  handleAutoDetectClick
} = useProviderEndpointAutoDiscovery({
  provider: 'ollama',
  initialBasePath: props.settings?.OllamaLLMBasePath,
  ENDPOINTS: OLLAMA_COMMON_URLS
})

const performanceMode = ref(props.settings?.OllamaLLMPerformanceMode || 'base')
const maxTokens = ref(props.settings?.OllamaLLMTokenLimit || '')
const customModels = ref([])
const modelsLoading = ref(true)
const showTooltip = ref(false)

const handleScroll = (e) => {
  e.target.blur()
}

const findCustomModels = async () => {
  if (!basePath.value.value) {
    customModels.value = []
    modelsLoading.value = false
    return
  }
  modelsLoading.value = true
  try {
    const { models } = await System.customModels(
      'ollama',
      authToken.value.value,
      basePath.value.value
    )
    customModels.value = models || []
  } catch (error) {
    console.error('Failed to fetch custom models:', error)
    customModels.value = []
  }
  modelsLoading.value = false
}

watch(() => basePath.value.value, () => {
  findCustomModels()
})

watch(() => authToken.value.value, () => {
  findCustomModels()
})

onMounted(() => {
  if (basePath.value.value) {
    findCustomModels()
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-y-7">
    <div class="w-full flex items-start gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-2">
          Ollama Model
        </label>
        <select
          v-if="modelsLoading || customModels.length === 0"
          name="OllamaLLMModelPref"
          disabled
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled selected>
            {{ basePath.value.value ? '--loading available models--' : 'Enter Ollama URL first' }}
          </option>
        </select>
        <select
          v-else
          name="OllamaLLMModelPref"
          required
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <optgroup v-if="customModels.length > 0" label="Your loaded models">
            <option
              v-for="model in customModels"
              :key="model.id"
              :value="model.id"
              :selected="settings.OllamaLLMModelPref === model.id"
            >
              {{ model.id }}
            </option>
          </optgroup>
        </select>
        <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
          {{ modelsLoading || customModels.length === 0
            ? 'Select the Ollama model you want to use. Models will load after entering a valid Ollama URL.'
            : 'Choose the Ollama model you want to use for your conversations.' }}
        </p>
      </div>
    </div>
    <div class="flex justify-start mt-4">
      <button
        @click.prevent="setShowAdvancedControls(!showAdvancedControls.value)"
        class="border-none text-theme-text-primary hover:text-theme-text-secondary flex items-center text-sm"
      >
        {{ showAdvancedControls.value ? 'Hide' : 'Show' }} advanced settings
        <PhCaretUp v-if="showAdvancedControls.value" :size="14" class="ml-1" />
        <PhCaretDown v-else :size="14" class="ml-1" />
      </button>
    </div>

    <div v-show="showAdvancedControls.value">
      <div class="flex flex-col">
        <div class="w-full flex items-start gap-4">
          <div class="flex flex-col w-60">
            <div class="flex justify-between items-center mb-2">
              <label class="text-white text-sm font-semibold">
                Ollama Base URL
              </label>
              <PreLoader v-if="loading.value" size="6" />
              <template v-else>
                <button
                  v-if="!basePathValue.value.value"
                  @click="handleAutoDetectClick"
                  class="bg-primary-button text-xs font-medium px-2 py-1 rounded-lg hover:bg-secondary hover:text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
                >
                  Auto-Detect
                </button>
              </template>
            </div>
            <input
              type="url"
              name="OllamaLLMBasePath"
              class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
              placeholder="http://127.0.0.1:11434"
              :value="basePathValue.value.value"
              required
              autocomplete="off"
              spellcheck="false"
              @input="basePath.onChange"
              @blur="basePath.onBlur"
            />
            <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
              Enter the URL where Ollama is running.
            </p>
          </div>
          <div class="flex flex-col w-60">
            <label class="text-white text-sm font-semibold mb-2 flex items-center">
              Performance Mode
              <Info
                :size="16"
                class="ml-2 text-white cursor-help"
                @mouseenter="showTooltip = true"
                @mouseleave="showTooltip = false"
                title="Base: Ollama automatically limits the context to 2048 tokens. Maximum: Uses the full context window (up to Max Tokens) - not recommended for most users."
              />
            </label>
            <select
              name="OllamaLLMPerformanceMode"
              v-model="performanceMode"
              required
              class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
            >
              <option value="base">Base (Default)</option>
              <option value="maximum">Maximum</option>
            </select>
            <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
              Choose the performance mode for the Ollama model.
            </p>
          </div>
          <div class="flex flex-col w-60">
            <label class="text-white text-sm font-semibold block mb-2">
              Ollama Keep Alive
            </label>
            <select
              name="OllamaLLMKeepAliveSeconds"
              required
              class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
              :value="settings?.OllamaLLMKeepAliveSeconds ?? '300'"
            >
              <option value="0">No cache</option>
              <option value="300">5 minutes</option>
              <option value="3600">1 hour</option>
              <option value="-1">Forever</option>
            </select>
            <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
              Choose how long Ollama should keep your model in memory before
              unloading.
              <a
                class="underline text-blue-300"
                href="https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-keep-a-model-loaded-in-memory-or-make-it-unload-immediately"
                target="_blank"
                rel="noreferrer"
              >
                Learn more &rarr;
              </a>
            </p>
          </div>
        </div>
        <div class="w-full flex items-start gap-4">
          <div class="flex flex-col w-60">
            <label class="text-white text-sm font-semibold block mb-2">
              Max Tokens (Optional)
            </label>
            <input
              type="number"
              name="OllamaLLMTokenLimit"
              v-model="maxTokens"
              class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
              placeholder="Auto-detected from model"
              :min="1"
              autocomplete="off"
              @scroll="handleScroll"
            />
            <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
              Override the context window limit. Leave empty to auto-detect
              from the model (defaults to 4096 if detection fails).
            </p>
          </div>
        </div>
        <div class="w-full flex items-start gap-4 mt-4">
          <div class="flex flex-col w-100">
            <label class="text-white text-sm font-semibold">
              Auth Token
            </label>
            <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
              Enter a <code>Bearer</code> Auth Token for interacting with your
              Ollama server.
              <br />
              Used <b>only</b> if running Ollama behind an authentication
              server.
            </p>
            <input
              type="password"
              name="OllamaLLMAuthToken"
              class="border-none bg-theme-settings-input-bg mt-2 text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg outline-none block w-full p-2.5 focus:outline-primary-button active:outline-primary-button"
              placeholder="Ollama Auth Token"
              :value="settings?.OllamaLLMAuthToken ? '*'.repeat(20) : authTokenValue.value.value"
              @input="authToken.onChange"
              @blur="authToken.onBlur"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

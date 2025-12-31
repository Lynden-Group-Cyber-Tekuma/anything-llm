<script setup>
import { ref } from 'vue'
import { PhCaretDown, PhCaretUp, PhInfo } from '@phosphor-icons/vue'
import Preloader from '@/components/Preloader'
import { OLLAMA_COMMON_URLS } from '@/utils/constants'
import { useProviderEndpointAutoDiscovery } from '@/composables/useProviderEndpointAutoDiscovery'
import OllamaEmbeddingModelSelection from './OllamaEmbeddingModelSelection.vue'

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
  showAdvancedControls,
  setShowAdvancedControls,
  handleAutoDetectClick,
  authToken,
  authTokenValue
} = useProviderEndpointAutoDiscovery({
  provider: 'ollama',
  initialBasePath: props.settings?.EmbeddingBasePath,
  ENDPOINTS: OLLAMA_COMMON_URLS
})

const maxChunkLength = ref(props.settings?.EmbeddingModelMaxChunkLength || 8192)
const batchSize = ref(props.settings?.OllamaEmbeddingBatchSize || 1)

const handleMaxChunkLengthChange = (e) => {
  maxChunkLength.value = Number(e.target.value)
}

const handleBatchSizeChange = (e) => {
  batchSize.value = Number(e.target.value)
}

const handleScroll = (e) => {
  e.target.blur()
}
</script>

<template>
  <div class="w-full flex flex-col gap-y-7">
    <div class="w-full flex items-start gap-[36px] mt-1.5">
      <OllamaEmbeddingModelSelection
        :settings="settings"
        :basePath="basePath.value.value"
      />
      <div class="flex flex-col w-60">
        <div :title="'Maximum length of text chunks, in characters, for embedding.'" class="flex gap-x-1 items-center mb-3">
          <label class="text-white text-sm font-semibold block">
            Max embedding chunk length
          </label>
          <PhInfo :size="16" class="text-theme-text-secondary cursor-pointer" />
        </div>
        <input
          type="number"
          name="EmbeddingModelMaxChunkLength"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="8192"
          :min="1"
          :value="maxChunkLength"
          @input="handleMaxChunkLengthChange"
          @scroll="handleScroll"
          required
          autocomplete="off"
        />
      </div>
    </div>
    <div class="flex justify-start mt-4">
      <button
        @click.prevent="setShowAdvancedControls(!showAdvancedControls.value)"
        class="border-none text-theme-text-primary hover:text-theme-text-secondary flex items-center text-sm"
      >
        {{ showAdvancedControls.value ? 'Hide' : 'Show' }} Advanced Settings
        <PhCaretUp v-if="showAdvancedControls.value" :size="14" class="ml-1" />
        <PhCaretDown v-else :size="14" class="ml-1" />
      </button>
    </div>

    <div v-show="showAdvancedControls.value">
      <div class="w-full flex items-start gap-4">
        <div class="flex flex-col w-60">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white text-sm font-semibold">
              Ollama Base URL
            </label>
            <Preloader v-if="loading.value" :size="6" />
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
            name="EmbeddingBasePath"
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
          <div :title="'Number of text chunks to embed in parallel. Higher values improve speed but use more memory. Default is 1.'" class="flex gap-x-1 items-center mb-3">
            <label class="text-white text-sm font-semibold block">
              Embedding batch size
            </label>
            <PhInfo :size="16" class="text-theme-text-secondary cursor-pointer" />
          </div>
          <input
            type="number"
            name="OllamaEmbeddingBatchSize"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="1"
            :min="1"
            :value="batchSize"
            @input="handleBatchSizeChange"
            @scroll="handleScroll"
            required
            autocomplete="off"
          />
          <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
            Increase this value to process multiple chunks simultaneously for faster embedding.
          </p>
        </div>
        <div>
          <label class="text-white font-semibold block mb-3 text-sm">
            Auth Token (optional)
          </label>
          <input
            type="password"
            name="OllamaLLMAuthToken"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="Enter your Auth Token"
            :value="authTokenValue.value.value"
            @input="authToken.onChange"
            @blur="authToken.onBlur"
            autocomplete="off"
            spellcheck="false"
          />
          <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
            Enter a <code>Bearer</code> Auth Token for interacting with your Ollama server.
            <br />
            Used <b>only</b> if running Ollama behind an authentication server.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

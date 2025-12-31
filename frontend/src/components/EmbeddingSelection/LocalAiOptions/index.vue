<script setup>
import { ref } from 'vue'
import { PhCaretDown, PhCaretUp, PhInfo } from '@phosphor-icons/vue'
import Preloader from '@/components/Preloader'
import { LOCALAI_COMMON_URLS } from '@/utils/constants'
import { useProviderEndpointAutoDiscovery } from '@/composables/useProviderEndpointAutoDiscovery'
import LocalAIModelSelection from './LocalAIModelSelection.vue'

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
  handleAutoDetectClick
} = useProviderEndpointAutoDiscovery({
  provider: 'localai',
  initialBasePath: props.settings?.EmbeddingBasePath,
  ENDPOINTS: LOCALAI_COMMON_URLS
})

const apiKeyValue = ref(props.settings?.LocalAiApiKey)
const apiKey = ref(props.settings?.LocalAiApiKey)

const handleInputChange = (e) => {
  apiKeyValue.value = e.target.value
}

const handleBlur = () => {
  apiKey.value = apiKeyValue.value
}

const handleScroll = (e) => {
  e.target.blur()
}
</script>

<template>
  <div class="w-full flex flex-col gap-y-7">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <LocalAIModelSelection
        :settings="settings"
        :apiKey="apiKey"
        :basePath="basePath.value.value"
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
          placeholder="1000"
          :min="1"
          @scroll="handleScroll"
          :value="settings?.EmbeddingModelMaxChunkLength"
          autocomplete="off"
        />
      </div>
      <div class="flex flex-col w-60">
        <div class="flex flex-col gap-y-1 mb-2">
          <label class="text-white text-sm font-semibold flex items-center gap-x-2">
            Local AI API Key
            <p class="!text-xs !italic !font-thin">optional</p>
          </label>
        </div>
        <input
          type="password"
          name="LocalAiApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="sk-mysecretkey"
          :value="settings?.LocalAiApiKey ? '*'.repeat(20) : ''"
          autocomplete="off"
          spellcheck="false"
          @input="handleInputChange"
          @blur="handleBlur"
        />
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
      <div class="w-full flex items-center gap-4">
        <div class="flex flex-col w-60">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white text-sm font-semibold">
              LocalAI Base URL
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
            placeholder="http://localhost:8080/v1"
            :value="basePathValue.value.value"
            required
            autocomplete="off"
            spellcheck="false"
            @input="basePath.onChange"
            @blur="basePath.onBlur"
          />
        </div>
      </div>
    </div>
  </div>
</template>

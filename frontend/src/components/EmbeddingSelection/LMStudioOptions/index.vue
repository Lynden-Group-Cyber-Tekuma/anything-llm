<script setup>
import { ref } from 'vue'
import { CaretDown, CaretUp, Info } from '@phosphor-icons/vue'
import Preloader from '@/components/Preloader'
import { LMSTUDIO_COMMON_URLS } from '@/utils/constants'
import { useProviderEndpointAutoDiscovery } from '@/composables/useProviderEndpointAutoDiscovery'
import LMStudioModelSelection from './LMStudioModelSelection.vue'

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
  provider: 'lmstudio',
  initialBasePath: props.settings?.EmbeddingBasePath,
  ENDPOINTS: LMSTUDIO_COMMON_URLS
})

const maxChunkLength = ref(props.settings?.EmbeddingModelMaxChunkLength || 8192)

const handleMaxChunkLengthChange = (e) => {
  maxChunkLength.value = Number(e.target.value)
}

const handleScroll = (e) => {
  e.target.blur()
}
</script>

<template>
  <div class="w-full flex flex-col gap-y-7">
    <div class="w-full flex items-start gap-[36px] mt-1.5">
      <LMStudioModelSelection :settings="settings" :basePath="basePath.value.value" />
      <div class="flex flex-col w-60">
        <div
          :title="'Maximum length of text chunks, in characters, for embedding.'"
          class="flex gap-x-1 items-center mb-3"
        >
          <Info :size="16" class="text-theme-text-secondary cursor-pointer" />
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
          :value="maxChunkLength"
          @input="handleMaxChunkLengthChange"
          @scroll="handleScroll"
          required
          autocomplete="off"
        />
        <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
          Maximum length of text chunks, in characters, for embedding.
        </p>
      </div>
    </div>
    <div class="flex justify-start mt-4">
      <button
        @click.prevent="setShowAdvancedControls(!showAdvancedControls.value)"
        class="border-none text-theme-text-primary hover:text-theme-text-secondary flex items-center text-sm"
      >
        {{ showAdvancedControls.value ? 'Hide' : 'Show' }} Manual Endpoint Input
        <CaretUp v-if="showAdvancedControls.value" :size="14" class="ml-1" />
        <CaretDown v-else :size="14" class="ml-1" />
      </button>
    </div>

    <div v-show="showAdvancedControls.value">
      <div class="w-full flex items-start gap-4">
        <div class="flex flex-col w-60">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white text-sm font-semibold">
              LM Studio Base URL
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
            placeholder="http://localhost:1234/v1"
            :value="basePathValue.value.value"
            required
            autocomplete="off"
            spellcheck="false"
            @input="basePath.onChange"
            @blur="basePath.onBlur"
          />
          <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
            Enter the URL where LM Studio is running.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

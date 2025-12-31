<script setup>
import { ref, watch, onMounted } from 'vue'
import { PhInfo, PhCaretDown, PhCaretUp } from '@phosphor-icons/vue'
import { RouterLink } from 'vue-router'
import paths from '@/utils/paths'
import System from '@/models/system'
import PreLoader from '@/components/Preloader'
import { LOCALAI_COMMON_URLS } from '@/utils/constants'
import { useProviderEndpointAutoDiscovery } from '@/composables/useProviderEndpointAutoDiscovery'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  },
  showAlert: {
    type: Boolean,
    default: false
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
  initialBasePath: props.settings?.LocalAiBasePath,
  ENDPOINTS: LOCALAI_COMMON_URLS
})

const apiKeyValue = ref(props.settings?.LocalAiApiKey)
const apiKey = ref(props.settings?.LocalAiApiKey)
const customModels = ref([])
const modelsLoading = ref(true)

const handleScroll = (e) => {
  e.target.blur()
}

const handleApiKeyChange = (e) => {
  apiKeyValue.value = e.target.value
}

const handleApiKeyBlur = () => {
  apiKey.value = apiKeyValue.value
}

const findCustomModels = async () => {
  if (!basePath.value.value || !basePath.value.value.includes('/v1')) {
    customModels.value = []
    modelsLoading.value = false
    return
  }
  modelsLoading.value = true
  const { models } = await System.customModels(
    'localai',
    typeof apiKey.value === 'boolean' ? null : apiKey.value,
    basePath.value.value
  )
  customModels.value = models || []
  modelsLoading.value = false
}

watch(() => basePath.value.value, () => {
  findCustomModels()
})

watch(apiKey, () => {
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
    <div v-if="showAlert" class="flex flex-col md:flex-row md:items-center gap-x-2 text-white mb-6 bg-blue-800/30 w-fit rounded-lg px-4 py-2">
      <div class="gap-x-2 flex items-center">
        <PhInfo :size="12" class="hidden md:visible" />
        <p class="text-sm md:text-base">
          LocalAI as your LLM requires you to set an embedding service to
          use.
        </p>
      </div>
      <RouterLink
        :to="paths.settings.embedder.modelPreference()"
        class="text-sm md:text-base my-2 underline"
      >
        Manage embedding &rarr;
      </RouterLink>
    </div>
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div v-if="!settings?.credentialsOnly" class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-2">
          Chat Model Selection
        </label>
        <select
          v-if="modelsLoading || customModels.length === 0"
          name="LocalAiModelPref"
          disabled
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled selected>
            {{ basePath.value.value?.includes('/v1') ? '-- loading available models --' : '-- waiting for URL --' }}
          </option>
        </select>
        <select
          v-else
          name="LocalAiModelPref"
          required
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <optgroup v-if="customModels.length > 0" label="Your loaded models">
            <option
              v-for="model in customModels"
              :key="model.id"
              :value="model.id"
              :selected="settings.LocalAiModelPref === model.id"
            >
              {{ model.id }}
            </option>
          </optgroup>
        </select>
      </div>
      <div v-if="!settings?.credentialsOnly" class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-2">
          Token context window
        </label>
        <input
          type="number"
          name="LocalAiTokenLimit"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="4096"
          :min="1"
          :value="settings?.LocalAiTokenLimit"
          required
          autocomplete="off"
          @scroll="handleScroll"
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
          @input="handleApiKeyChange"
          @blur="handleApiKeyBlur"
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
              Local AI Base URL
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
            name="LocalAiBasePath"
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

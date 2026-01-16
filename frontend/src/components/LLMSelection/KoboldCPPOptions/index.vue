<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'
import PreLoader from '@/components/Preloader'
import { KOBOLDCPP_COMMON_URLS } from '@/utils/constants'
import { PhCaretDown, PhCaretUp } from '@phosphor-icons/vue'
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
  showAdvancedControls,
  setShowAdvancedControls,
  handleAutoDetectClick
} = useProviderEndpointAutoDiscovery({
  provider: 'koboldcpp',
  initialBasePath: props.settings?.KoboldCPPBasePath,
  ENDPOINTS: KOBOLDCPP_COMMON_URLS
})

const tokenLimit = ref(props.settings?.KoboldCPPTokenLimit || 4096)
const maxTokens = ref(props.settings?.KoboldCPPMaxTokens || 2048)
const customModels = ref([])
const modelsLoading = ref(true)

const handleScroll = (e) => {
  e.target.blur()
}

const findCustomModels = async () => {
  if (!basePath.value.value || !basePath.value.value.includes('/v1')) {
    customModels.value = []
    modelsLoading.value = false
    return
  }
  modelsLoading.value = true
  try {
    const { models } = await System.customModels(
      'koboldcpp',
      null,
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
          KoboldCPP Model
        </label>
        <select
          v-if="modelsLoading || customModels.length === 0"
          name="KoboldCPPModelPref"
          disabled
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled selected>
            {{ basePath.value.value?.includes('/v1') ? '--loading available models--' : 'Enter KoboldCPP URL first' }}
          </option>
        </select>
        <select
          v-else
          name="KoboldCPPModelPref"
          required
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option
            v-for="model in customModels"
            :key="model.id"
            :value="model.id"
            :selected="settings.KoboldCPPModelPref === model.id"
          >
            {{ model.id }}
          </option>
        </select>
        <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
          {{ modelsLoading || customModels.length === 0
            ? 'Select the KoboldCPP model you want to use. Models will load after entering a valid KoboldCPP URL.'
            : 'Choose the KoboldCPP model you want to use for your conversations.' }}
        </p>
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-2">
          Token context window
        </label>
        <input
          type="number"
          name="KoboldCPPTokenLimit"
          v-model="tokenLimit"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="4096"
          :min="1"
          required
          autocomplete="off"
          @scroll="handleScroll"
        />
        <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
          Maximum number of tokens for context and response.
        </p>
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-2">
          Max response tokens
        </label>
        <input
          type="number"
          name="KoboldCPPMaxTokens"
          v-model="maxTokens"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="2048"
          :min="1"
          required
          autocomplete="off"
          @scroll="handleScroll"
        />
        <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
          Maximum number of tokens for the response.
        </p>
      </div>
    </div>
    <div class="flex justify-start mt-4">
      <button
        @click.prevent="setShowAdvancedControls(!showAdvancedControls.value)"
        class="border-none text-theme-text-primary hover:text-theme-text-secondary flex items-center text-sm"
      >
        {{ showAdvancedControls.value ? 'Hide' : 'Show' }} Manual Endpoint Input
        <PhCaretUp v-if="showAdvancedControls.value" :size="14" class="ml-1" />
        <PhCaretDown v-else :size="14" class="ml-1" />
      </button>
    </div>

    <div v-show="showAdvancedControls.value">
      <div class="w-full flex items-start gap-4">
        <div class="flex flex-col w-60">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white text-sm font-semibold">
              KoboldCPP Base URL
            </label>
            <PreLoader v-if="loading.value" size="6" />
            <template v-else>
              <button
                v-if="!basePathValue.value.value"
                @click="handleAutoDetectClick"
                class="border-none bg-primary-button text-xs font-medium px-2 py-1 rounded-lg hover:bg-secondary hover:text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
              >
                Auto-Detect
              </button>
            </template>
          </div>
          <input
            type="url"
            name="KoboldCPPBasePath"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="http://127.0.0.1:5000/v1"
            :value="basePathValue.value.value"
            required
            autocomplete="off"
            spellcheck="false"
            @input="basePath.onChange"
            @blur="basePath.onBlur"
          />
          <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
            Enter the URL where KoboldCPP is running.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import PreLoader from '@/components/Preloader'
import { useProviderEndpointAutoDiscovery } from '@/composables/useProviderEndpointAutoDiscovery'
import System from '@/models/system'
import { NVIDIA_NIM_COMMON_URLS } from '@/utils/constants'

/**
 * This component is used to select a remote NVIDIA NIM model endpoint
 * This is the default component and way to connect to NVIDIA NIM
 * as the "managed" provider can only work in the Desktop context.
 */
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
  handleAutoDetectClick
} = useProviderEndpointAutoDiscovery({
  provider: 'nvidia-nim',
  initialBasePath: props.settings?.NvidiaNimLLMBasePath,
  ENDPOINTS: NVIDIA_NIM_COMMON_URLS
})

const models = ref([])
const modelsLoading = ref(true)

const findCustomModels = async () => {
  modelsLoading.value = true
  const { models: fetchedModels } = await System.customModels(
    'nvidia-nim',
    null,
    basePath.value.value
  )
  models.value = fetchedModels
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
  <div class="flex gap-[36px] mt-1.5">
    <div class="flex flex-col w-60">
      <div class="flex justify-between items-center mb-2">
        <label class="text-white text-sm font-semibold">
          NVIDIA Nim Base URL
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
        name="NvidiaNimLLMBasePath"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="http://localhost:8000/v1"
        :value="basePathValue.value.value"
        required
        autocomplete="off"
        spellcheck="false"
        @input="basePath.onChange"
        @blur="basePath.onBlur"
      />
      <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
        Enter the URL where NVIDIA NIM is running.
      </p>
    </div>
    <div v-if="!settings?.credentialsOnly" class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        Chat Model Selection
      </label>
      <select
        v-if="modelsLoading || models.length === 0"
        name="NvidiaNimLLMModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          -- loading available models --
        </option>
      </select>
      <select
        v-else
        name="NvidiaNimLLMModelPref"
        required
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option
          v-for="model in models"
          :key="model.id"
          :value="model.id"
          :selected="settings?.NvidiaNimLLMModelPref === model.id"
        >
          {{ model.name }}
        </option>
      </select>
    </div>
  </div>
</template>

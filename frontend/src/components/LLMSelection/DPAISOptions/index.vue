<script setup>
import { ref, watch, onMounted } from 'vue'
import { CaretDown, CaretUp } from '@phosphor-icons/vue'
import System from '@/models/system'
import PreLoader from '@/components/Preloader'
import { DPAIS_COMMON_URLS } from '@/utils/constants'
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
  provider: 'dpais',
  initialBasePath: props.settings?.DellProAiStudioBasePath,
  ENDPOINTS: DPAIS_COMMON_URLS
})

const customModels = ref([])
const modelsLoading = ref(true)

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
  const { models } = await System.customModels(
    'dpais',
    null,
    basePath.value.value,
    2000
  )
  customModels.value = models || []
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
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <template v-if="!settings?.credentialsOnly">
        <div class="flex flex-col w-60">
          <label class="text-white text-sm font-semibold block mb-2">
            Chat Model Selection
          </label>
          <select
            v-if="modelsLoading || customModels.length === 0"
            name="DellProAiStudioModelPref"
            disabled
            class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
          >
            <option disabled selected>
              -- loading available models --
            </option>
          </select>
          <select
            v-else
            name="DellProAiStudioModelPref"
            required
            class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
          >
            <optgroup v-if="customModels.length > 0" label="Your loaded models">
              <option
                v-for="model in customModels"
                :key="model.id"
                :value="model.id"
                :selected="settings.DellProAiStudioModelPref === model.id"
              >
                {{ model.id }}
              </option>
            </optgroup>
          </select>
        </div>
        <div class="flex flex-col w-60">
          <label class="text-white text-sm font-semibold block mb-2">
            Token context window
          </label>
          <input
            type="number"
            name="DellProAiStudioTokenLimit"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="4096"
            :min="1"
            :value="settings?.DellProAiStudioTokenLimit"
            required
            autocomplete="off"
            @scroll="handleScroll"
          />
        </div>
      </template>
    </div>
    <div class="flex justify-start mt-4">
      <button
        @click.prevent="setShowAdvancedControls(!showAdvancedControls.value)"
        class="border-none text-theme-text-primary hover:text-theme-text-secondary flex items-center text-sm"
      >
        {{ showAdvancedControls.value ? 'Hide' : 'Show' }} advanced settings
        <CaretUp v-if="showAdvancedControls.value" :size="14" class="ml-1" />
        <CaretDown v-else :size="14" class="ml-1" />
      </button>
    </div>
    <div v-show="showAdvancedControls.value">
      <div class="w-full flex items-center gap-4">
        <div class="flex flex-col w-fit">
          <div class="flex justify-between items-center mb-2 gap-x-2">
            <label class="text-white text-sm font-semibold">
              Dell Pro AI Studio Base URL
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
            name="DellProAiStudioBasePath"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="http://localhost:8553/v1/openai"
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

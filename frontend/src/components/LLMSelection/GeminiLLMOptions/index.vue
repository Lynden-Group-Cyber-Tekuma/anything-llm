<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.GeminiLLMApiKey)
const geminiApiKey = ref(props.settings?.GeminiLLMApiKey)
const groupedModels = ref({})
const loading = ref(true)

const handleInputChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  geminiApiKey.value = inputValue.value
}

const findCustomModels = async () => {
  loading.value = true
  const { models } = await System.customModels('gemini', geminiApiKey.value)

  if (models?.length > 0) {
    const modelsByOrganization = models.reduce((acc, model) => {
      acc[model.experimental ? 'Experimental' : 'Stable'] =
        acc[model.experimental ? 'Experimental' : 'Stable'] || []
      acc[model.experimental ? 'Experimental' : 'Stable'].push(model)
      return acc
    }, {})
    groupedModels.value = modelsByOrganization
  }
  loading.value = false
}

const sortedOrganizations = (models) => {
  return Object.keys(models).sort((a, b) => {
    if (a === 'Stable') return -1
    if (b === 'Stable') return 1
    return a.localeCompare(b)
  })
}

watch(geminiApiKey, () => {
  findCustomModels()
})

onMounted(() => {
  if (geminiApiKey.value) {
    findCustomModels()
  }
})
</script>

<template>
  <div class="w-full flex flex-col">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Google AI API Key
        </label>
        <input
          type="password"
          name="GeminiLLMApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Google Gemini API Key"
          :value="settings?.GeminiLLMApiKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
          @input="handleInputChange"
          @blur="handleBlur"
        />
      </div>

      <div v-if="!settings?.credentialsOnly" class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Chat Model Selection
        </label>
        <select
          v-if="loading"
          name="GeminiLLMModelPref"
          disabled
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled selected>
            -- loading available models --
          </option>
        </select>
        <select
          v-else
          name="GeminiLLMModelPref"
          required
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <optgroup
            v-for="organization in sortedOrganizations(groupedModels)"
            :key="organization"
            :label="organization"
          >
            <option
              v-for="model in groupedModels[organization]"
              :key="model.id"
              :value="model.id"
              :selected="settings?.GeminiLLMModelPref === model.id"
            >
              {{ model.id }}
            </option>
          </optgroup>
        </select>
      </div>
      <!--

      Safety setting is not supported for Gemini yet due to the openai compatible Gemini API.
      We are not using the generativeAPI endpoint and therefore cannot set the safety threshold.

      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Safety Setting
        </label>
        <select
          name="GeminiSafetySetting"
          :value="settings?.GeminiSafetySetting || 'BLOCK_MEDIUM_AND_ABOVE'"
          required
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option value="BLOCK_NONE">None</option>
          <option value="BLOCK_ONLY_HIGH">Block few</option>
          <option value="BLOCK_MEDIUM_AND_ABOVE">
            Block some (default)
          </option>
          <option value="BLOCK_LOW_AND_ABOVE">Block most</option>
        </select>
      </div> -->
    </div>
  </div>
</template>

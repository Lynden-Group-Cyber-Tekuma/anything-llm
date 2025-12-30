<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.XAIApiKey)
const apiKey = ref(props.settings?.XAIApiKey)
const customModels = ref([])
const loading = ref(true)

const handleInputChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  apiKey.value = inputValue.value
}

const findCustomModels = async () => {
  if (!apiKey.value) {
    customModels.value = []
    loading.value = true
    return
  }

  try {
    loading.value = true
    const { models } = await System.customModels('xai', apiKey.value)
    customModels.value = models || []
  } catch (error) {
    console.error('Failed to fetch custom models:', error)
    customModels.value = []
  } finally {
    loading.value = false
  }
}

watch(apiKey, () => {
  findCustomModels()
})

onMounted(() => {
  if (apiKey.value) {
    findCustomModels()
  }
})
</script>

<template>
  <div class="flex gap-[36px] mt-1.5">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        xAI API Key
      </label>
      <input
        type="password"
        name="XAIApiKey"
        class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="xAI API Key"
        :value="settings?.XAIApiKey ? '*'.repeat(20) : ''"
        required
        autocomplete="off"
        spellcheck="false"
        @input="handleInputChange"
        @blur="handleBlur"
      />
    </div>
    <div v-if="!settings?.credentialsOnly" class="flex flex-col w-60">
      <label class="text-theme-text-primary text-sm font-semibold block mb-3">
        Chat Model Selection
      </label>
      <select
        v-if="loading"
        name="XAIModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg text-theme-text-primary border-theme-border text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          --loading available models--
        </option>
      </select>
      <select
        v-else
        name="XAIModelPref"
        required
        class="border-none bg-theme-settings-input-bg text-theme-text-primary border-theme-border text-sm rounded-lg block w-full p-2.5"
      >
        <optgroup v-if="customModels.length > 0" label="Available models">
          <option
            v-for="model in customModels"
            :key="model.id"
            :value="model.id"
            :selected="settings?.XAIModelPref === model.id"
          >
            {{ model.id }}
          </option>
        </optgroup>
      </select>
      <p class="text-xs leading-[18px] font-base text-theme-text-primary opacity-60 mt-2">
        {{ loading ? 'Enter a valid API key to view all available models for your account.' : 'Select the xAI model you want to use for your conversations.' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.ZAiApiKey)
const apiKey = ref(props.settings?.ZAiApiKey)
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
    const { models } = await System.customModels('zai', apiKey.value)
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
        Z.AI API Key
      </label>
      <input
        type="password"
        name="ZAiApiKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="Z.AI API Key"
        :value="settings?.ZAiApiKey ? '*'.repeat(20) : ''"
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
        name="ZAiModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          --loading available models--
        </option>
      </select>
      <select
        v-else
        name="ZAiModelPref"
        required
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <optgroup v-if="customModels.length > 0" label="Available models">
          <option
            v-for="model in customModels"
            :key="model.id"
            :value="model.id"
            :selected="settings?.ZAiModelPref === model.id"
          >
            {{ model.id }}
          </option>
        </optgroup>
      </select>
      <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
        {{ loading ? 'Enter a valid API key to view all available models for your account.' : 'Select the Z.AI model you want to use for your conversations.' }}
      </p>
    </div>
  </div>
</template>

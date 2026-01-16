<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.MoonshotAiApiKey)
const moonshotAiKey = ref(props.settings?.MoonshotAiApiKey)
const models = ref([])
const loading = ref(true)

const handleInputChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  moonshotAiKey.value = inputValue.value
}

const findCustomModels = async () => {
  if (!moonshotAiKey.value) {
    models.value = []
    loading.value = true
    return
  }

  loading.value = true
  const { models: availableModels } = await System.customModels(
    'moonshotai',
    typeof moonshotAiKey.value === 'boolean' ? null : moonshotAiKey.value
  )

  if (availableModels?.length > 0) {
    models.value = availableModels
  }

  loading.value = false
}

watch(moonshotAiKey, () => {
  findCustomModels()
})

onMounted(() => {
  if (moonshotAiKey.value) {
    findCustomModels()
  }
})
</script>

<template>
  <div class="flex gap-[36px] mt-1.5">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        API Key
      </label>
      <input
        type="password"
        name="MoonshotAiApiKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="Moonshot AI API Key"
        :value="settings?.MoonshotAiApiKey ? '*'.repeat(20) : ''"
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
        v-if="!moonshotAiKey"
        name="MoonshotAiModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          -- Enter API key --
        </option>
      </select>
      <select
        v-else-if="loading"
        name="MoonshotAiModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          -- loading available models --
        </option>
      </select>
      <select
        v-else
        name="MoonshotAiModelPref"
        required
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option
          v-for="model in models"
          :key="model.id"
          :value="model.id"
          :selected="settings?.MoonshotAiModelPref === model.id"
        >
          {{ model.id }}
        </option>
      </select>
    </div>
  </div>
</template>

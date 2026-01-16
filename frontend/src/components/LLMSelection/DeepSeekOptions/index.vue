<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.DeepSeekApiKey)
const deepSeekApiKey = ref(props.settings?.DeepSeekApiKey)
const models = ref([])
const loading = ref(true)

const handleInputChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  deepSeekApiKey.value = inputValue.value
}

const findCustomModels = async () => {
  if (!deepSeekApiKey.value) {
    models.value = []
    loading.value = true
    return
  }

  loading.value = true
  const { models: fetchedModels } = await System.customModels(
    'deepseek',
    typeof deepSeekApiKey.value === 'boolean' ? null : deepSeekApiKey.value
  )
  models.value = fetchedModels || []
  loading.value = false
}

watch(deepSeekApiKey, () => {
  findCustomModels()
})

onMounted(() => {
  if (deepSeekApiKey.value) {
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
        name="DeepSeekApiKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="DeepSeek API Key"
        :value="settings?.DeepSeekApiKey ? '*'.repeat(20) : ''"
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
        name="DeepSeekModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          -- loading available models --
        </option>
      </select>
      <select
        v-else
        name="DeepSeekModelPref"
        required
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option
          v-for="model in models"
          :key="model.id"
          :value="model.id"
          :selected="settings?.DeepSeekModelPref === model.id"
        >
          {{ model.name }}
        </option>
      </select>
    </div>
  </div>
</template>

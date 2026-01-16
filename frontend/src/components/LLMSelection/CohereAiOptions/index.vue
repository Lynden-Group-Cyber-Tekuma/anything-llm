<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.CohereApiKey)
const cohereApiKey = ref(props.settings?.CohereApiKey)
const models = ref([])
const loading = ref(true)

const handleInputChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  cohereApiKey.value = inputValue.value
}

const findCustomModels = async () => {
  if (!cohereApiKey.value) {
    models.value = []
    loading.value = true
    return
  }

  loading.value = true
  const { models: fetchedModels } = await System.customModels(
    'cohere',
    typeof cohereApiKey.value === 'boolean' ? null : cohereApiKey.value
  )
  models.value = fetchedModels || []
  loading.value = false
}

watch(cohereApiKey, () => {
  findCustomModels()
})

onMounted(() => {
  if (cohereApiKey.value) {
    findCustomModels()
  }
})
</script>

<template>
  <div class="w-full flex flex-col">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Cohere API Key
        </label>
        <input
          type="password"
          name="CohereApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Cohere API Key"
          :value="settings?.CohereApiKey ? '*'.repeat(20) : ''"
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
          name="CohereModelPref"
          disabled
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled selected>
            -- loading available models --
          </option>
        </select>
        <select
          v-else
          name="CohereModelPref"
          required
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option
            v-for="model in models"
            :key="model.id"
            :value="model.id"
            :selected="settings?.CohereModelPref === model.id"
          >
            {{ model.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import System from '@/models/system'

const props = defineProps({
  apiKey: {
    type: String,
    default: null
  },
  settings: {
    type: Object,
    default: () => ({})
  }
})

const models = ref([])
const loading = ref(true)

async function findCustomModels() {
  if (!props.apiKey) {
    models.value = []
    loading.value = true
    return
  }

  loading.value = true
  const { models: fetchedModels } = await System.customModels(
    'cohere-embedder',
    typeof props.apiKey === 'boolean' ? null : props.apiKey
  )
  models.value = fetchedModels || []
  loading.value = false
}

watch(() => props.apiKey, () => {
  findCustomModels()
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col w-60">
    <label class="text-white text-sm font-semibold block mb-3">
      Model Preference
    </label>
    <select
      v-if="loading"
      name="EmbeddingModelPref"
      disabled
      class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
    >
      <option disabled selected>
        -- loading available models --
      </option>
    </select>
    <select
      v-else
      name="EmbeddingModelPref"
      required
      class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
    >
      <option
        v-for="model in models"
        :key="model.id"
        :value="model.id"
        :selected="settings?.EmbeddingModelPref === model.id"
      >
        {{ model.name }}
      </option>
    </select>
  </div>
</template>

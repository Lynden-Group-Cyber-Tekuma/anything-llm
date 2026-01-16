<script setup>
import { ref, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const models = ref([])
const loading = ref(true)
const selectedModel = ref(props.settings?.EmbeddingModelPref || '')

onMounted(async () => {
  loading.value = true
  const response = await System.customModels('openrouter-embedder')
  const fetchedModels = response?.models || []
  models.value = fetchedModels

  if (
    props.settings?.EmbeddingModelPref &&
    fetchedModels.some((m) => m.id === props.settings.EmbeddingModelPref)
  ) {
    selectedModel.value = props.settings.EmbeddingModelPref
  } else if (fetchedModels.length > 0) {
    selectedModel.value = fetchedModels[0].id
  }

  loading.value = false
})
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
      v-model="selectedModel"
      class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
    >
      <option v-for="model in models" :key="model.id" :value="model.id">
        {{ model.name }}
      </option>
    </select>
  </div>
</template>

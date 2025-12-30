<script setup>
import { ref, watch } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  },
  basePath: {
    type: String,
    default: null
  }
})

const customModels = ref([])
const loading = ref(true)

async function findCustomModels() {
  if (!props.basePath) {
    customModels.value = []
    loading.value = false
    return
  }
  loading.value = true
  try {
    const { models } = await System.customModels('ollama', null, props.basePath)
    customModels.value = models || []
  } catch (error) {
    console.error('Failed to fetch custom models:', error)
    customModels.value = []
  }
  loading.value = false
}

watch(() => props.basePath, () => {
  findCustomModels()
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col w-60">
    <label class="text-white text-sm font-semibold block mb-2">
      Ollama Embedding Model
    </label>
    <select
      v-if="loading || customModels.length === 0"
      name="EmbeddingModelPref"
      disabled
      class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
    >
      <option disabled selected>
        {{ basePath ? '--loading available models--' : 'Enter Ollama URL first' }}
      </option>
    </select>
    <select
      v-else
      name="EmbeddingModelPref"
      required
      class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
    >
      <optgroup v-if="customModels.length > 0" label="Your loaded models">
        <option
          v-for="model in customModels"
          :key="model.id"
          :value="model.id"
          :selected="settings.EmbeddingModelPref === model.id"
        >
          {{ model.id }}
        </option>
      </optgroup>
    </select>
    <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
      {{ loading || customModels.length === 0
        ? 'Select the Ollama model for embeddings. Models will load after entering a valid Ollama URL.'
        : 'Choose the Ollama model you want to use for generating embeddings.'
      }}
    </p>
  </div>
</template>

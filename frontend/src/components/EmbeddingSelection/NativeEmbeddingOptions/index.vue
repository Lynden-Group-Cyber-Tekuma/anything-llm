<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const loading = ref(true)
const availableModels = ref([])
const selectedModel = ref(props.settings?.EmbeddingModelPref)

const selectedModelInfo = computed(() => {
  if (!availableModels.value?.length || !selectedModel.value) return null
  return availableModels.value.find((model) => model.id === selectedModel.value)
})

onMounted(async () => {
  try {
    const { models } = await System.customModels('native-embedder')
    if (models?.length > 0) {
      availableModels.value = models
      const _selectedModel =
        models.find((model) => model.id === props.settings?.EmbeddingModelPref) ??
        models[0]
      selectedModel.value = _selectedModel.id
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-y-4">
    <div class="w-full flex flex-col mt-1.5">
      <div class="flex flex-col w-96">
        <label class="text-white text-sm font-semibold block mb-3">
          Model Preference
        </label>
        <select
          name="EmbeddingModelPref"
          required
          :value="selectedModel"
          @change="(e) => selectedModel = e.target.value"
          class="border-none bg-theme-settings-input-bg border-gray-500 text-theme-text-primary text-sm rounded-lg block w-60 p-2.5"
        >
          <option
            v-if="loading"
            value="--loading-available-models--"
            disabled
            selected
          >
            --loading available models--
          </option>
          <optgroup v-else label="Available embedding models">
            <option
              v-for="model in availableModels"
              :key="model.id"
              :value="model.id"
              :selected="selectedModel === model.id"
            >
              {{ model.name }}
            </option>
          </optgroup>
        </select>
      </div>
      <div v-if="selectedModelInfo" class="flex flex-col gap-y-2 mt-2">
        <p class="text-theme-text-secondary text-xs font-normal block">
          {{ selectedModelInfo.description }}
        </p>
        <p class="text-theme-text-secondary text-xs font-normal block">
          Trained on: {{ selectedModelInfo.lang }}
        </p>
        <p class="text-theme-text-secondary text-xs font-normal block">
          Download Size: {{ selectedModelInfo.size }}
        </p>
        <RouterLink
          :to="selectedModelInfo.modelCard"
          target="_blank"
          rel="noopener noreferrer"
          class="text-theme-text-secondary text-xs font-normal block underline hover:text-theme-text-primary"
        >
          View model card on Hugging Face &rarr;
        </RouterLink>
      </div>
    </div>
  </div>
</template>

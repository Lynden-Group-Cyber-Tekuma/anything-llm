<script setup>
import { ref, watch } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  },
  apiKey: {
    type: String,
    default: null
  },
  basePath: {
    type: String,
    default: null
  }
})

const customModels = ref([])
const loading = ref(true)

async function findCustomModels() {
  if (!props.basePath || !props.basePath.includes('/v1')) {
    customModels.value = []
    loading.value = false
    return
  }
  loading.value = true
  const { models } = await System.customModels(
    'localai',
    typeof props.apiKey === 'boolean' ? null : props.apiKey,
    props.basePath
  )
  customModels.value = models || []
  loading.value = false
}

watch(() => [props.basePath, props.apiKey], () => {
  findCustomModels()
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col w-60">
    <label class="text-white text-sm font-semibold block mb-2">
      Embedding Model Name
    </label>
    <select
      v-if="loading || customModels.length === 0"
      name="EmbeddingModelPref"
      disabled
      class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
    >
      <option disabled selected>
        {{ basePath?.includes('/v1') ? '-- loading available models --' : '-- waiting for URL --' }}
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
          :selected="settings?.EmbeddingModelPref === model.id"
        >
          {{ model.id }}
        </option>
      </optgroup>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Warning } from '@phosphor-icons/vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  },
  basePath: {
    type: String,
    default: null
  },
  apiKey: {
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
  const { models } = await System.customModels(
    'litellm',
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
    <div v-if="loading || customModels.length === 0">
      <label class="text-white text-sm font-semibold block mb-3">
        Embedding Model Selection
      </label>
      <select
        name="EmbeddingModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          {{ basePath?.includes('/v1') ? '-- loading available models --' : '-- waiting for URL --' }}
        </option>
      </select>
    </div>
    <div v-else>
      <div class="flex items-center">
        <label class="text-white text-sm font-semibold block mb-3">
          Embedding Model Selection
        </label>
        <div class="flex items-center justify-center -mt-3 ml-1">
          <Warning
            :size="14"
            class="ml-1 text-orange-500 cursor-pointer"
            :title="'Be sure to select a valid embedding model. Chat models are not embedding models. See https://litellm.vercel.app/docs/embedding/supported_embedding for more information.'"
          />
        </div>
      </div>
      <select
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
    </div>
  </div>
</template>

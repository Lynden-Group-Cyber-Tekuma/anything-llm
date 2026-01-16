<script setup>
import { ref, watch } from 'vue'
import System from '@/models/system'

const props = defineProps({
  apiKey: {
    type: [String, Boolean],
    default: null
  },
  settings: {
    type: Object,
    default: () => ({})
  }
})

const groupedModels = ref({})
const loading = ref(true)

async function findCustomModels() {
  loading.value = true
  const { models } = await System.customModels(
    'elevenlabs-tts',
    typeof props.apiKey === 'boolean' ? null : props.apiKey
  )

  if (models?.length > 0) {
    const modelsByOrganization = models.reduce((acc, model) => {
      acc[model.organization] = acc[model.organization] || []
      acc[model.organization].push(model)
      return acc
    }, {})
    groupedModels.value = modelsByOrganization
  }

  loading.value = false
}

watch(() => props.apiKey, () => {
  findCustomModels()
}, { immediate: true })
</script>

<template>
  <div v-if="loading" class="flex flex-col w-60">
    <label class="text-white text-sm font-semibold block mb-3">
      Chat Model Selection
    </label>
    <select
      name="TTSElevenLabsVoiceModel"
      disabled
      class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
    >
      <option disabled selected>
        -- loading available models --
      </option>
    </select>
  </div>
  <div v-else class="flex flex-col w-60">
    <label class="text-white text-sm font-semibold block mb-3">
      Chat Model Selection
    </label>
    <select
      name="TTSElevenLabsVoiceModel"
      required
      class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
    >
      <optgroup
        v-for="organization in Object.keys(groupedModels).sort()"
        :key="organization"
        :label="organization"
      >
        <option
          v-for="model in groupedModels[organization]"
          :key="model.id"
          :value="model.id"
          :selected="model.id === settings?.TTSElevenLabsVoiceModel"
        >
          {{ model.name }}
        </option>
      </optgroup>
    </select>
  </div>
</template>

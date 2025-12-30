<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.FireworksAiLLMApiKey)
const fireworksAiApiKey = ref(props.settings?.FireworksAiLLMApiKey)
const groupedModels = ref({})
const loading = ref(true)

const handleInputChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  fireworksAiApiKey.value = inputValue.value
}

const findCustomModels = async () => {
  if (!fireworksAiApiKey.value) {
    groupedModels.value = {}
    loading.value = true
    return
  }

  loading.value = true
  const { models } = await System.customModels('fireworksai', fireworksAiApiKey.value)

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

watch(fireworksAiApiKey, () => {
  findCustomModels()
})

onMounted(() => {
  if (fireworksAiApiKey.value) {
    findCustomModels()
  }
})
</script>

<template>
  <div class="flex gap-[36px] mt-1.5">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        Fireworks AI API Key
      </label>
      <input
        type="password"
        name="FireworksAiLLMApiKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="Fireworks AI API Key"
        :value="settings?.FireworksAiLLMApiKey ? '*'.repeat(20) : ''"
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
        v-if="loading || Object.keys(groupedModels).length === 0"
        name="FireworksAiLLMModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          -- loading available models --
        </option>
      </select>
      <select
        v-else
        name="FireworksAiLLMModelPref"
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
            :selected="settings?.FireworksAiLLMModelPref === model.id"
          >
            {{ model.name }}
          </option>
        </optgroup>
      </select>
    </div>
  </div>
</template>

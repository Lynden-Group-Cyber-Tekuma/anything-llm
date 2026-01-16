<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.TogetherAiApiKey)
const apiKey = ref(props.settings?.TogetherAiApiKey)
const groupedModels = ref({})
const loading = ref(true)

const handleInputChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  apiKey.value = inputValue.value
}

const findCustomModels = async () => {
  loading.value = true
  try {
    const key = apiKey.value === '*'.repeat(20) ? null : apiKey.value
    const { models } = await System.customModels('togetherai', key)
    if (models?.length > 0) {
      const modelsByOrganization = models.reduce((acc, model) => {
        if (model.type !== 'chat') return acc // Only show chat models in dropdown
        const org = model.organization || 'Unknown'
        acc[org] = acc[org] || []
        acc[org].push({
          id: model.id,
          name: model.name || model.id,
          organization: org,
          maxLength: model.maxLength
        })
        return acc
      }, {})
      groupedModels.value = modelsByOrganization
    }
  } catch (error) {
    console.error('Error fetching Together AI models:', error)
  }
  loading.value = false
}

watch(apiKey, () => {
  findCustomModels()
})

onMounted(() => {
  if (apiKey.value) {
    findCustomModels()
  }
})
</script>

<template>
  <div class="flex gap-[36px] mt-1.5">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        Together AI API Key
      </label>
      <input
        type="password"
        name="TogetherAiApiKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="Together AI API Key"
        :value="settings?.TogetherAiApiKey ? '*'.repeat(20) : ''"
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
        name="TogetherAiModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          -- loading available models --
        </option>
      </select>
      <select
        v-else
        name="TogetherAiModelPref"
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
            :selected="settings?.TogetherAiModelPref === model.id"
          >
            {{ model.name }}
          </option>
        </optgroup>
      </select>
    </div>
  </div>
</template>

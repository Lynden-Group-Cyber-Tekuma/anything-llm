<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.OpenAiKey)
const openAIKey = ref(props.settings?.OpenAiKey)
const groupedModels = ref({})
const loading = ref(true)

const handleInputChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  openAIKey.value = inputValue.value
}

const findCustomModels = async () => {
  loading.value = true
  const { models } = await System.customModels(
    'openai',
    typeof openAIKey.value === 'boolean' ? null : openAIKey.value
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

watch(openAIKey, () => {
  findCustomModels()
})

onMounted(() => {
  if (openAIKey.value) {
    findCustomModels()
  }
})
</script>

<template>
  <div class="flex gap-[36px] mt-1.5">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        API Key
      </label>
      <input
        type="password"
        name="OpenAiKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="OpenAI API Key"
        :value="settings?.OpenAiKey ? '*'.repeat(20) : ''"
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
        name="OpenAiModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          -- loading available models --
        </option>
      </select>
      <select
        v-else
        name="OpenAiModelPref"
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
            :selected="settings?.OpenAiModelPref === model.id"
          >
            {{ model.name }}
          </option>
        </optgroup>
      </select>
    </div>
  </div>
</template>

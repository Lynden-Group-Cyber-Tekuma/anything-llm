<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.MistralApiKey)
const mistralKey = ref(props.settings?.MistralApiKey)
const customModels = ref([])
const loading = ref(true)

const loadingMessage = computed(() => {
  return mistralKey.value
    ? '-- loading available models --'
    : '-- waiting for API key --'
})

const handleInputChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  mistralKey.value = inputValue.value
}

const findCustomModels = async () => {
  if (!mistralKey.value) {
    customModels.value = []
    loading.value = false
    return
  }

  loading.value = true
  const { models } = await System.customModels(
    'mistral',
    typeof mistralKey.value === 'boolean' ? null : mistralKey.value
  )
  customModels.value = models || []
  loading.value = false
}

watch(mistralKey, () => {
  findCustomModels()
})

onMounted(() => {
  if (mistralKey.value) {
    findCustomModels()
  }
})
</script>

<template>
  <div class="flex gap-[36px] mt-1.5">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        Mistral API Key
      </label>
      <input
        type="password"
        name="MistralApiKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="Mistral API Key"
        :value="settings?.MistralApiKey ? '*'.repeat(20) : ''"
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
        v-if="loading || customModels.length === 0"
        name="MistralModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          {{ loadingMessage }}
        </option>
      </select>
      <select
        v-else
        name="MistralModelPref"
        required
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <optgroup v-if="customModels.length > 0" label="Available Mistral Models">
          <option
            v-for="model in customModels"
            :key="model.id"
            :value="model.id"
            :selected="settings?.MistralModelPref === model.id"
          >
            {{ model.id }}
          </option>
        </optgroup>
      </select>
    </div>
  </div>
</template>

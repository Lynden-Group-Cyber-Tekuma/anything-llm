<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'
import { CaretDown, CaretUp } from '@phosphor-icons/vue'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const DEFAULT_MODELS = [
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet'
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet (New)'
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku'
  },
  {
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet (Old)'
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku'
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus'
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet'
  },
  {
    id: 'claude-2.1',
    name: 'Claude 2.1'
  },
  {
    id: 'claude-2.0',
    name: 'Claude 2.0'
  }
]

const showAdvancedControls = ref(false)
const inputValue = ref(props.settings?.AnthropicApiKey)
const anthropicApiKey = ref(props.settings?.AnthropicApiKey)
const models = ref(DEFAULT_MODELS)
const loading = ref(true)

const handleInputChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  anthropicApiKey.value = inputValue.value
}

const findCustomModels = async () => {
  loading.value = true
  const { models: fetchedModels } = await System.customModels(
    'anthropic',
    typeof anthropicApiKey.value === 'boolean' ? null : anthropicApiKey.value
  )
  if (fetchedModels.length > 0) models.value = fetchedModels
  loading.value = false
}

watch(anthropicApiKey, () => {
  findCustomModels()
})

onMounted(() => {
  if (anthropicApiKey.value) {
    findCustomModels()
  }
})
</script>

<template>
  <div class="w-full flex flex-col">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Anthropic API Key
        </label>
        <input
          type="password"
          name="AnthropicApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Anthropic Claude-2 API Key"
          :value="settings?.AnthropicApiKey ? '*'.repeat(20) : ''"
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
          name="AnthropicModelPref"
          disabled
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled selected>
            -- loading available models --
          </option>
        </select>
        <select
          v-else
          name="AnthropicModelPref"
          required
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option
            v-for="model in models"
            :key="model.id"
            :value="model.id"
            :selected="settings?.AnthropicModelPref === model.id"
          >
            {{ model.name }}
          </option>
        </select>
      </div>
    </div>
    <div class="flex justify-start mt-4">
      <button
        @click.prevent="showAdvancedControls = !showAdvancedControls"
        class="border-none text-theme-text-primary hover:text-theme-text-secondary flex items-center text-sm"
      >
        {{ showAdvancedControls ? 'Hide' : 'Show' }} advanced settings
        <CaretUp v-if="showAdvancedControls" :size="14" class="ml-1" />
        <CaretDown v-else :size="14" class="ml-1" />
      </button>
    </div>
    <div v-show="showAdvancedControls">
      <div class="w-full flex items-start gap-4 mt-1.5">
        <div class="flex flex-col w-60">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white text-sm font-semibold">
              Prompt Caching
            </label>
          </div>
          <select
            name="AnthropicCacheControl"
            class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
          >
            <option
              value="none"
              :selected="settings?.AnthropicCacheControl === 'none'"
            >
              No caching
            </option>
            <option
              value="5m"
              :selected="settings?.AnthropicCacheControl === '5m'"
            >
              5 minutes
            </option>
            <option
              value="1h"
              :selected="settings?.AnthropicCacheControl === '1h'"
            >
              1 hour
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

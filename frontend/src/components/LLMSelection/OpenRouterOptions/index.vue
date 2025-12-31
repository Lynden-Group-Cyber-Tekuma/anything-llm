<script setup>
import { ref, onMounted } from 'vue'
import System from '@/models/system'
import { PhCaretDown, PhCaretUp } from '@phosphor-icons/vue'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const showAdvancedControls = ref(false)
const groupedModels = ref({})
const loading = ref(true)

const handleScroll = (e) => {
  e.target.blur()
}

onMounted(async () => {
  loading.value = true
  const { models } = await System.customModels('openrouter')
  if (models?.length > 0) {
    const modelsByOrganization = models.reduce((acc, model) => {
      acc[model.organization] = acc[model.organization] || []
      acc[model.organization].push(model)
      return acc
    }, {})

    groupedModels.value = modelsByOrganization
  }

  loading.value = false
})
</script>

<template>
  <div class="flex flex-col gap-y-4 mt-1.5">
    <div class="flex gap-[36px]">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          OpenRouter API Key
        </label>
        <input
          type="password"
          name="OpenRouterApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="OpenRouter API Key"
          :value="settings?.OpenRouterApiKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div v-if="!settings?.credentialsOnly" class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Chat Model Selection
        </label>
        <select
          v-if="loading || Object.keys(groupedModels).length === 0"
          name="OpenRouterModelPref"
          disabled
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled selected>
            -- loading available models --
          </option>
        </select>
        <select
          v-else
          name="OpenRouterModelPref"
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
              :selected="settings?.OpenRouterModelPref === model.id"
            >
              {{ model.name }}
            </option>
          </optgroup>
        </select>
      </div>
    </div>
    <div class="flex flex-col gap-y-4">
      <button
        type="button"
        @click="showAdvancedControls = !showAdvancedControls"
        class="border-none text-white hover:text-white/70 flex items-center text-sm"
      >
        {{ showAdvancedControls ? 'Hide' : 'Show' }} advanced controls
        <PhCaretUp v-if="showAdvancedControls" :size="14" class="ml-1" />
        <PhCaretDown v-else :size="14" class="ml-1" />
      </button>
      <div v-show="showAdvancedControls">
        <div class="flex flex-col w-60">
          <label class="text-white text-sm font-semibold block mb-3">
            Stream Timeout (ms)
          </label>
          <input
            type="number"
            name="OpenRouterTimeout"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="Timeout value between token responses to auto-timeout the stream"
            :value="settings?.OpenRouterTimeout ?? 3000"
            autocomplete="off"
            :min="500"
            :step="1"
            @scroll="handleScroll"
          />
        </div>
      </div>
    </div>
  </div>
</template>

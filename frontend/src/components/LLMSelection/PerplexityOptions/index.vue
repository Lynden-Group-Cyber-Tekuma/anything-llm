<script setup>
import { ref, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const customModels = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!props.settings?.credentialsOnly) {
    loading.value = true
    const { models } = await System.customModels('perplexity')
    customModels.value = models || []
    loading.value = false
  }
})
</script>

<template>
  <div class="flex gap-[36px] mt-1.5">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        Perplexity API Key
      </label>
      <input
        type="password"
        name="PerplexityApiKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="Perplexity API Key"
        :value="settings?.PerplexityApiKey ? '*'.repeat(20) : ''"
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
        v-if="loading || customModels.length === 0"
        name="PerplexityModelPref"
        disabled
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          -- loading available models --
        </option>
      </select>
      <select
        v-else
        name="PerplexityModelPref"
        required
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <optgroup v-if="customModels.length > 0" label="Available Perplexity Models">
          <option
            v-for="model in customModels"
            :key="model.id"
            :value="model.id"
            :selected="settings?.PerplexityModelPref === model.id"
          >
            {{ model.id }}
          </option>
        </optgroup>
      </select>
    </div>
  </div>
</template>

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
  const { models } = await System.customModels('novita')
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
  <div class="w-full flex flex-col gap-y-7">
    <div class="w-full flex items-start gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-theme-text-primary text-sm font-semibold block mb-3">
          Novita API Key
        </label>
        <input
          type="password"
          name="NovitaLLMApiKey"
          class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Novita API Key"
          :value="settings?.NovitaLLMApiKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div v-if="!settings?.credentialsOnly" class="flex flex-col w-60">
        <label class="text-theme-text-primary text-sm font-semibold block mb-3">
          Chat Model Selection
        </label>
        <select
          v-if="loading || Object.keys(groupedModels).length === 0"
          name="NovitaLLMModelPref"
          disabled
          class="border-none bg-theme-settings-input-bg text-theme-text-primary border-theme-border text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled selected>
            -- loading available models --
          </option>
        </select>
        <select
          v-else
          name="NovitaLLMModelPref"
          required
          class="border-none bg-theme-settings-input-bg text-theme-text-primary border-theme-border text-sm rounded-lg block w-full p-2.5"
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
              :selected="settings?.NovitaLLMModelPref === model.id"
            >
              {{ model.name }}
            </option>
          </optgroup>
        </select>
      </div>
    </div>
    <div class="flex flex-col gap-y-4">
      <div class="flex justify-start">
        <button
          type="button"
          @click="showAdvancedControls = !showAdvancedControls"
          class="border-none text-theme-text-primary hover:text-theme-text-secondary flex items-center text-sm"
        >
          {{ showAdvancedControls ? 'Hide' : 'Show' }} advanced settings
          <PhCaretUp v-if="showAdvancedControls" :size="14" class="ml-1" />
          <PhCaretDown v-else :size="14" class="ml-1" />
        </button>
      </div>
      <div v-show="showAdvancedControls">
        <div class="flex flex-col w-60">
          <label class="text-theme-text-primary text-sm font-semibold block mb-3">
            Stream Timeout (ms)
          </label>
          <input
            type="number"
            name="NovitaLLMTimeout"
            class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="Timeout value between token responses to auto-timeout the stream"
            :value="settings?.NovitaLLMTimeout ?? 3000"
            autocomplete="off"
            :min="500"
            :step="1"
            @scroll="handleScroll"
          />
          <p class="text-xs leading-[18px] font-base text-theme-text-primary text-opacity-60 mt-2">
            Timeout value between token responses to auto-timeout the stream.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

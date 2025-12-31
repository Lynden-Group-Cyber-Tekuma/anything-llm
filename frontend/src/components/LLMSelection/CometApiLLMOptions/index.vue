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
const models = ref([])
const loading = ref(true)

const handleScroll = (e) => {
  e.target.blur()
}

onMounted(async () => {
  loading.value = true
  const { models: fetched = [] } = await System.customModels('cometapi')
  if (fetched?.length > 0) {
    // De-duplicate by id (case-insensitive) and sort by name for readability
    const seen = new Set()
    const unique = []
    for (const m of fetched) {
      const key = String(m.id || m.name || '').toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(m)
      }
    }
    unique.sort((a, b) =>
      String(a.name || a.id).localeCompare(String(b.name || b.id))
    )
    models.value = unique
  } else {
    models.value = []
  }
  loading.value = false
})
</script>

<template>
  <div class="w-full flex flex-col gap-y-7">
    <div class="w-full flex items-start gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-theme-text-primary text-sm font-semibold block mb-3">
          CometAPI API Key
        </label>
        <input
          type="password"
          name="CometApiLLMApiKey"
          class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="CometAPI API Key"
          :value="settings?.CometApiLLMApiKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div v-if="!settings?.credentialsOnly" class="flex flex-col w-60">
        <label class="text-theme-text-primary text-sm font-semibold block mb-3">
          Chat Model Selection
        </label>
        <input
          v-if="loading || models.length === 0"
          type="text"
          name="CometApiLLMModelPref"
          class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg block w-full p-2.5"
          placeholder="-- loading available models --"
          disabled
        />
        <template v-else>
          <input
            type="text"
            name="CometApiLLMModelPref"
            list="cometapi-models-list"
            required
            class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg block w-full p-2.5"
            placeholder="Type or select a model"
            :value="settings?.CometApiLLMModelPref || ''"
            autocomplete="off"
            spellcheck="false"
          />
          <datalist id="cometapi-models-list">
            <option
              v-for="model in models"
              :key="model.id"
              :value="model.id"
            >
              {{ model.name }}
            </option>
          </datalist>
          <p class="text-xs leading-[18px] font-base text-theme-text-primary text-opacity-60 mt-2">
            You can type the model id directly or pick from suggestions.
          </p>
        </template>
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
            name="CometApiLLMTimeout"
            class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="Timeout value between token responses to auto-timeout the stream"
            :value="settings?.CometApiLLMTimeout ?? 3000"
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

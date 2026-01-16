<script setup>
import { ref, watch, onMounted } from 'vue'
import System from '@/models/system'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const models = ref([])
const loading = ref(!!props.settings?.FoundryBasePath)
const basePath = ref(props.settings?.FoundryBasePath)
const model = ref(props.settings?.FoundryModelPref || '')

const fetchModels = async () => {
  try {
    loading.value = true
    if (!basePath.value) throw new Error('Base path is required')
    const { models: fetchedModels, error } = await System.customModels(
      'foundry',
      null,
      basePath.value
    )
    if (error) throw new Error(error)
    models.value = fetchedModels
  } catch (error) {
    console.error('Error fetching Foundry models:', error)
    models.value = []
  } finally {
    loading.value = false
  }
}

watch(basePath, () => {
  fetchModels()
})

watch(() => props.settings?.FoundryModelPref, (newVal) => {
  model.value = newVal || ''
})

onMounted(() => {
  if (basePath.value) {
    fetchModels()
  }
})
</script>

<template>
  <div class="flex flex-col gap-y-7">
    <div class="flex gap-[36px] mt-1.5 flex-wrap">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Base URL
        </label>
        <input
          type="url"
          name="FoundryBasePath"
          v-model="basePath"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="eg: http://127.0.0.1:8080"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Chat Model
        </label>
        <select
          v-if="loading"
          name="FoundryModelPref"
          required
          disabled
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        >
          <option>---- Loading ----</option>
        </select>
        <select
          v-else
          name="FoundryModelPref"
          v-model="model"
          required
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        >
          <template v-if="models.length > 0">
            <option value="">-- Select a model --</option>
            <option
              v-for="m in models"
              :key="m.id"
              :value="m.id"
            >
              {{ m.id }}
            </option>
          </template>
          <option v-else disabled value="">
            No models found
          </option>
        </select>
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Token Context Window
        </label>
        <input
          type="number"
          name="FoundryModelTokenLimit"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="4096"
          :value="settings?.FoundryModelTokenLimit"
          autocomplete="off"
          :min="0"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import useGetProviderModels, {
  DISABLED_PROVIDERS,
} from '@/hooks/useGetProvidersModels'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  provider: String,
  setHasChanges: Function,
  selectedLLMModel: String,
  setSelectedLLMModel: Function
})

const { t } = useI18n()
const { defaultModels, customModels, loading } = useGetProviderModels(props.provider)
</script>

<template>
  <div v-if="!DISABLED_PROVIDERS.includes(provider)">
    <!-- Loading state -->
    <div v-if="loading">
      <div class="flex flex-col">
        <label for="name" class="block input-label">
          {{ t('chat_window.workspace_llm_manager.available_models', { provider }) }}
        </label>
        <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
          {{ t('chat_window.workspace_llm_manager.available_models_description') }}
        </p>
      </div>
      <select
        required
        disabled
        class="border-theme-modal-border border border-solid bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
      >
        <option disabled selected>
          -- waiting for models --
        </option>
      </select>
    </div>

    <!-- Loaded state -->
    <div v-else>
      <div class="flex flex-col">
        <label for="name" class="block input-label">
          {{ t('chat_window.workspace_llm_manager.available_models', { provider }) }}
        </label>
        <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
          {{ t('chat_window.workspace_llm_manager.available_models_description') }}
        </p>
      </div>

      <select
        id="workspace-llm-model-select"
        required
        :value="selectedLLMModel"
        @change="(e) => {
          setHasChanges(true)
          setSelectedLLMModel(e.target.value)
        }"
        class="border-theme-modal-border border border-solid bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
      >
        <optgroup v-if="defaultModels.length > 0" label="General models">
          <option
            v-for="model in defaultModels"
            :key="model"
            :value="model"
            :selected="selectedLLMModel === model"
          >
            {{ model }}
          </option>
        </optgroup>
        <optgroup v-if="Array.isArray(customModels) && customModels.length > 0" label="Discovered models">
          <option
            v-for="model in customModels"
            :key="model.id"
            :value="model.id"
            :selected="selectedLLMModel === model.id"
          >
            {{ model.id }}
          </option>
        </optgroup>
        <!-- For providers like TogetherAi where we partition model by creator entity -->
        <template v-if="!Array.isArray(customModels) && Object.keys(customModels).length > 0">
          <optgroup
            v-for="[organization, models] in Object.entries(customModels)"
            :key="organization"
            :label="organization"
          >
            <option
              v-for="model in models"
              :key="model.id"
              :value="model.id"
              :selected="selectedLLMModel === model.id"
            >
              {{ model.name }}
            </option>
          </optgroup>
        </template>
      </select>
    </div>
  </div>
</template>

<template>
  <div v-if="DISABLED_PROVIDERS.includes(provider)" />
  <div v-else-if="loading">
    <div class="flex flex-col mt-6">
      <label for="name" class="block input-label">
        {{ t('chat.model.title') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('chat.model.description') }}
      </p>
    </div>
    <select
      name="chatModel"
      required
      disabled
      class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
    >
      <option disabled selected>
        -- waiting for models --
      </option>
    </select>
  </div>
  <div v-else>
    <div class="flex flex-col mt-6">
      <label for="name" class="block input-label">
        {{ t('chat.model.title') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('chat.model.description') }}
      </p>
    </div>

    <select
      name="chatModel"
      required
      @change="$emit('update:hasChanges', true)"
      class="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
    >
      <optgroup v-if="defaultModels.length > 0" label="General models">
        <option
          v-for="model in defaultModels"
          :key="model"
          :value="model"
          :selected="workspace?.chatModel === model"
        >
          {{ model }}
        </option>
      </optgroup>
      <optgroup
        v-if="Array.isArray(customModels) && customModels.length > 0"
        label="Discovered models"
      >
        <option
          v-for="model in customModels"
          :key="model.id"
          :value="model.id"
          :selected="workspace?.chatModel === model.id"
        >
          {{ model.id }}
        </option>
      </optgroup>
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
            :selected="workspace?.chatModel === model.id"
          >
            {{ model.name }}
          </option>
        </optgroup>
      </template>
    </select>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import useGetProviderModels, {
  DISABLED_PROVIDERS,
} from '@/hooks/useGetProvidersModels';

const props = defineProps({
  provider: {
    type: String,
    required: true,
  },
  workspace: {
    type: Object,
    required: true,
  },
});

defineEmits(['update:hasChanges']);

const { t } = useI18n();
const { defaultModels, customModels, loading } = useGetProviderModels(props.provider);
</script>

<template>
  <div v-if="DISABLED_PROVIDERS.includes(provider)" class="w-full h-10 justify-center items-center flex">
    <p class="text-sm font-base text-white text-opacity-60 text-center">
      Multi-model support is not supported for this provider yet.
      <br />
      Agent's will use
      <router-link
        :to="paths.workspace.settings.chatSettings(slug)"
        class="underline"
      >
        the model set for the workspace
      </router-link>
      or
      <router-link :to="paths.settings.llmPreference()" class="underline">
        the model set for the system.
      </router-link>
    </p>
  </div>
  <div v-else-if="loading">
    <div class="flex flex-col">
      <label for="name" class="block input-label">
        {{ t('agent.mode.chat.title') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('agent.mode.chat.description') }}
      </p>
    </div>
    <select
      name="agentModel"
      required
      disabled
      class="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
    >
      <option disabled selected>
        {{ t('agent.mode.wait') }}
      </option>
    </select>
  </div>
  <div v-else>
    <div class="flex flex-col">
      <label for="name" class="block input-label">
        {{ t('agent.mode.title') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('agent.mode.description') }}
      </p>
    </div>

    <select
      name="agentModel"
      required
      @change="$emit('update:hasChanges', true)"
      class="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
    >
      <optgroup v-if="defaultModels.length > 0" label="General models">
        <option
          v-for="model in defaultModels.filter(m => supportedModel(provider, m))"
          :key="model"
          :value="model"
          :selected="workspace?.agentModel === model"
        >
          {{ model }}
        </option>
      </optgroup>
      <optgroup
        v-if="Array.isArray(customModels) && customModels.length > 0"
        label="Custom models"
      >
        <option
          v-for="model in customModels.filter(m => supportedModel(provider, m.id))"
          :key="model.id"
          :value="model.id"
          :selected="workspace?.agentModel === model.id"
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
            v-for="model in models.filter(m => supportedModel(provider, m.id))"
            :key="model.id"
            :value="model.id"
            :selected="workspace?.agentModel === model.id"
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
import { useRoute } from 'vue-router';
import useGetProviderModels, {
  DISABLED_PROVIDERS,
} from '@/hooks/useGetProvidersModels';
import paths from '@/utils/paths';

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

const emit = defineEmits(['update:hasChanges']);

const { t } = useI18n();
const route = useRoute();
const slug = route.params.slug;
const { defaultModels, customModels, loading } = useGetProviderModels(props.provider);

function supportedModel(provider, model = '') {
  if (provider === 'openai') {
    return (
      [
        'gpt-3.5-turbo-0301',
        'gpt-4-turbo-2024-04-09',
        'gpt-4-turbo',
        'o1-preview',
        'o1-preview-2024-09-12',
        'o1-mini',
        'o1-mini-2024-09-12',
        'o3-mini',
        'o3-mini-2025-01-31',
      ].includes(model) === false
    );
  }

  return true;
}
</script>

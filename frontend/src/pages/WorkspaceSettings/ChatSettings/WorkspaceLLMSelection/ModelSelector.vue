<template>
  <div v-if="NO_MODEL_SELECTION.includes(selectedLLM)">
    <div v-if="selectedLLM !== 'default'" class="w-full h-10 justify-center items-center flex mt-4">
      <p class="text-sm font-base text-white text-opacity-60 text-center">
        Multi-model support is not supported for this provider yet.
        <br />
        This workspace will use
        <router-link :to="paths.settings.llmPreference()" class="underline">
          the model set for the system.
        </router-link>
      </p>
    </div>
  </div>
  <FreeFormLLMInput
    v-else-if="FREE_FORM_LLM_SELECTION.includes(selectedLLM)"
    :workspace="workspace"
    @update:hasChanges="$emit('update:hasChanges', $event)"
  />
  <ChatModelSelection
    v-else
    :provider="selectedLLM"
    :workspace="workspace"
    @update:hasChanges="$emit('update:hasChanges', $event)"
  />
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import paths from '@/utils/paths';
import ChatModelSelection from './ChatModelSelection/index.vue';
import FreeFormLLMInput from './FreeFormLLMInput.vue';

const NO_MODEL_SELECTION = ['default', 'huggingface'];
const FREE_FORM_LLM_SELECTION = ['bedrock', 'azure', 'generic-openai'];

defineProps({
  selectedLLM: {
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
</script>

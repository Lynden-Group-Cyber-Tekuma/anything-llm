<template>
  <div class="border-b border-white/40 pb-8">
    <div v-if="WARN_PERFORMANCE.includes(selectedLLM)" class="flex flex-col md:flex-row md:items-center gap-x-2 text-white mb-4 bg-blue-800/30 w-fit rounded-lg px-4 py-2">
      <div class="gap-x-2 flex items-center">
        <Gauge class="shrink-0" :size="25" />
        <p class="text-sm">{{ t('agent.performance-warning') }}</p>
      </div>
    </div>

    <div class="flex flex-col">
      <label for="name" class="block input-label">
        {{ t('agent.provider.title') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('agent.provider.description') }}
      </p>
    </div>

    <div class="relative">
      <input type="hidden" name="agentProvider" :value="selectedLLM" />
      <div
        v-if="searchMenuOpen"
        class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 backdrop-blur-sm z-10"
        @click="searchMenuOpen = false"
      />
      <div
        v-if="searchMenuOpen"
        class="absolute top-0 left-0 w-full max-w-[640px] max-h-[310px] min-h-[64px] bg-theme-settings-input-bg rounded-lg flex flex-col justify-between cursor-pointer border-2 border-primary-button z-20"
      >
        <div class="w-full flex flex-col gap-y-1">
          <div class="flex items-center sticky top-0 z-10 border-b border-[#9CA3AF] mx-4 bg-theme-settings-input-bg">
            <MagnifyingGlass
              :size="20"
              weight="bold"
              class="absolute left-4 z-30 text-theme-text-primary -ml-4 my-2"
            />
            <input
              ref="searchInputRef"
              type="text"
              name="llm-search"
              autocomplete="off"
              placeholder="Search available LLM providers"
              class="border-none -ml-4 my-2 bg-transparent z-20 pl-12 h-[38px] w-full px-4 py-1 text-sm outline-none text-theme-text-primary placeholder:text-theme-text-primary placeholder:font-medium"
              @input="searchQuery = $event.target.value"
              @keydown.enter.prevent
            />
            <X
              :size="20"
              weight="bold"
              class="cursor-pointer text-theme-text-primary hover:text-x-button"
              @click="handleXButton"
            />
          </div>
          <div class="flex-1 pl-4 pr-2 flex flex-col gap-y-1 overflow-y-auto white-scrollbar pb-4 max-h-[245px]">
            <AgentLLMItem
              v-for="llm in filteredLLMs"
              :key="llm.name"
              :llm="llm"
              :availableLLMs="LLMS"
              :settings="settings"
              :checked="selectedLLM === llm.value"
              @click="updateLLMChoice(llm.value)"
            />
          </div>
        </div>
      </div>
      <button
        v-else
        class="w-full max-w-[640px] h-[64px] bg-theme-settings-input-bg rounded-lg flex items-center p-[14px] justify-between cursor-pointer border-2 border-transparent hover:border-primary-button transition-all duration-300"
        type="button"
        @click="searchMenuOpen = true"
      >
        <div class="flex gap-x-4 items-center">
          <img
            :src="selectedLLMObject.logo"
            :alt="`${selectedLLMObject.name} logo`"
            class="w-10 h-10 rounded-md"
          />
          <div class="flex flex-col text-left">
            <div class="text-sm font-semibold text-white">
              {{ selectedLLMObject.name }}
            </div>
            <div class="mt-1 text-xs text-description">
              {{ selectedLLMObject.description }}
            </div>
          </div>
        </div>
        <CaretUpDown :size="24" weight="bold" class="text-white" />
      </button>
    </div>
    <div v-if="selectedLLM !== 'none'" class="mt-4 flex flex-col gap-y-1">
      <AgentModelSelection
        :provider="selectedLLM"
        :workspace="workspace"
        @update:hasChanges="$emit('update:hasChanges', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import AnythingLLMIcon from '@/media/logo/anything-llm-icon.png';
import AgentLLMItem from './AgentLLMItem/index.vue';
import { AVAILABLE_LLM_PROVIDERS } from '@/pages/GeneralSettings/LLMPreference';
import { CaretUpDown, Gauge, MagnifyingGlass, X } from '@phosphor-icons/vue';
import AgentModelSelection from '../AgentModelSelection/index.vue';

const ENABLED_PROVIDERS = [
  'openai',
  'anthropic',
  'lmstudio',
  'ollama',
  'localai',
  'groq',
  'azure',
  'koboldcpp',
  'togetherai',
  'openrouter',
  'novita',
  'mistral',
  'perplexity',
  'textgenwebui',
  'generic-openai',
  'bedrock',
  'fireworksai',
  'deepseek',
  'ppio',
  'litellm',
  'apipie',
  'xai',
  'nvidia-nim',
  'gemini',
  'moonshotai',
  'cometapi',
  'foundry',
  'zai',
  'giteeai',
  'cohere',
];
const WARN_PERFORMANCE = [
  'lmstudio',
  'koboldcpp',
  'ollama',
  'localai',
  'textgenwebui',
];

const LLM_DEFAULT = {
  name: 'System Default',
  value: 'none',
  logo: AnythingLLMIcon,
  options: () => null,
  description:
    'Agents will use the workspace or system LLM unless otherwise specified.',
  requiredConfig: [],
};

const LLMS = [
  LLM_DEFAULT,
  ...AVAILABLE_LLM_PROVIDERS.filter((llm) =>
    ENABLED_PROVIDERS.includes(llm.value)
  ),
];

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  workspace: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:hasChanges']);

const { t } = useI18n();
const filteredLLMs = ref([]);
const selectedLLM = ref(props.workspace?.agentProvider ?? 'none');
const searchQuery = ref('');
const searchMenuOpen = ref(false);
const searchInputRef = ref(null);

const selectedLLMObject = computed(() =>
  LLMS.find((llm) => llm.value === selectedLLM.value)
);

function updateLLMChoice(selection) {
  searchQuery.value = '';
  selectedLLM.value = selection;
  searchMenuOpen.value = false;
  emit('update:hasChanges', true);
}

function handleXButton() {
  if (searchQuery.value.length > 0) {
    searchQuery.value = '';
    if (searchInputRef.value) searchInputRef.value.value = '';
  } else {
    searchMenuOpen.value = !searchMenuOpen.value;
  }
}

watch([searchQuery, selectedLLM], () => {
  const filtered = LLMS.filter((llm) =>
    llm.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  filteredLLMs.value = filtered;
});

onMounted(() => {
  const filtered = LLMS.filter((llm) =>
    llm.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  filteredLLMs.value = filtered;
});
</script>

<template>
  <div class="border-b border-white/40 pb-8">
    <div class="flex flex-col">
      <label for="name" class="block input-label">
        {{ t('chat.llm.title') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('chat.llm.description') }}
      </p>
    </div>

    <div class="relative">
      <input type="hidden" name="chatProvider" :value="selectedLLM" />
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
              :placeholder="t('chat.llm.search')"
              class="border-none -ml-4 my-2 bg-transparent z-20 pl-12 h-[38px] w-full px-4 py-1 text-sm outline-none focus:outline-primary-button active:outline-primary-button outline-none text-theme-text-primary placeholder:text-theme-text-primary placeholder:font-medium"
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
            <WorkspaceLLMItem
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
    <ModelSelector
      :selectedLLM="selectedLLM"
      :workspace="workspace"
      @update:hasChanges="$emit('update:hasChanges', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import AnythingLLMIcon from '@/media/logo/anything-llm-icon.png';
import WorkspaceLLMItem from './WorkspaceLLMItem/index.vue';
import { AVAILABLE_LLM_PROVIDERS } from '@/pages/GeneralSettings/LLMPreference';
import { CaretUpDown, MagnifyingGlass, X } from '@phosphor-icons/vue';
import ChatModelSelection from './ChatModelSelection/index.vue';
import ModelSelector from './ModelSelector.vue';

const FREE_FORM_LLM_SELECTION = ['bedrock', 'azure', 'generic-openai'];
const NO_MODEL_SELECTION = ['default', 'huggingface'];
const DISABLED_PROVIDERS = [];

const LLM_DEFAULT = {
  name: 'System default',
  value: 'default',
  logo: AnythingLLMIcon,
  options: () => null,
  description: 'Use the system LLM preference for this workspace.',
  requiredConfig: [],
};

const LLMS = [LLM_DEFAULT, ...AVAILABLE_LLM_PROVIDERS].filter(
  (llm) => !DISABLED_PROVIDERS.includes(llm.value)
);

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
const selectedLLM = ref(props.workspace?.chatProvider ?? 'default');
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

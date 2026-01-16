<template>
  <div>
    <ChatPromptHistory
      ref="promptHistoryRef"
      :workspaceSlug="workspace.slug"
      :show="showPromptHistory"
      @restore="handleRestoreFromHistory"
      @publishClick="handlePublishFromHistory"
      @close="showPromptHistory = false"
    />
    <div class="flex flex-col">
      <div class="flex items-center justify-between">
        <label for="name" class="block input-label">
          {{ t('chat.prompt.title') }}
        </label>
      </div>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('chat.prompt.description') }}
      </p>
      <p class="text-white text-opacity-60 text-xs font-medium mb-2">
        You can insert
        <router-link
          :to="paths.settings.systemPromptVariables()"
          class="text-primary-button"
        >
          prompt variables
        </router-link>
        like:
        <template v-for="(v, i) in availableVariables.slice(0, 3)" :key="v.key">
          <span class="bg-theme-settings-input-bg px-1 py-0.5 rounded">
            {{ `{${v.key}}` }}
          </span>
          <template v-if="i < availableVariables.length - 1">, </template>
        </template>
        <router-link
          v-if="availableVariables.length > 3"
          :to="paths.settings.systemPromptVariables()"
          class="text-primary-button"
        >
          +{{ availableVariables.length - 3 }} more...
        </router-link>
      </p>
    </div>

    <input type="hidden" name="openAiPrompt" :value="prompt" />
    <div class="relative w-full flex flex-col items-end">
      <button
        ref="historyButtonRef"
        type="button"
        class="text-theme-text-secondary hover:text-white light:hover:text-black text-xs font-medium"
        @click.prevent="showPromptHistory = !showPromptHistory"
      >
        {{ showPromptHistory ? 'Hide History' : 'View History' }}
      </button>
      <div class="relative w-full">
        <textarea
          v-if="isEditing"
          ref="promptRef"
          :rows="5"
          :defaultValue="prompt"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInput"
          @paste="handlePaste"
          :style="{
            resize: 'vertical',
            overflowY: 'scroll',
            minHeight: '150px',
          }"
          class="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5 mt-2"
        />
        <div
          v-else
          @click="isEditing = true"
          :style="{
            resize: 'vertical',
            overflowY: 'scroll',
            minHeight: '150px',
          }"
          class="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5 mt-2"
        >
          <Highlighter
            class="whitespace-pre-wrap"
            highlightClassName="bg-cta-button p-0.5 rounded-md"
            :searchWords="availableVariables.map((v) => `{${v.key}}`)"
            :autoEscape="true"
            :caseSensitive="true"
            :textToHighlight="prompt"
          />
        </div>
      </div>
      <div class="w-full flex flex-row items-center justify-between pt-2">
        <button
          v-if="prompt !== defaultSystemPrompt"
          type="button"
          @click="handleRestoreToDefaultSystemPrompt"
          class="text-theme-text-primary hover:text-white light:hover:text-black text-xs font-medium"
        >
          Restore to Default
        </button>
        <PublishPromptCTA
          :hidden="!showPublishButton"
          @click="openPublishModal"
        />
      </div>
    </div>
    <PublishEntityModal
      :show="showPublishModal"
      @close="closePublishModal"
      entityType="system-prompt"
      :entity="prompt"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { getWorkspaceSystemPrompt } from '@/utils/chat';
import SystemPromptVariable from '@/models/systemPromptVariable';
import Highlighter from 'vue-highlight-words';
import paths from '@/utils/paths';
import ChatPromptHistory from './ChatPromptHistory/index.vue';
import PublishEntityModal from '@/components/CommunityHub/PublishEntityModal';
import { useModal } from '@/hooks/useModal';
import System from '@/models/system';

const props = defineProps({
  workspace: {
    type: Object,
    required: true,
  },
  hasChanges: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:hasChanges']);

const { t } = useI18n();
const route = useRoute();

const initialPrompt = getWorkspaceSystemPrompt(props.workspace);
const prompt = ref(initialPrompt);
const savedPrompt = ref(initialPrompt);
const defaultSystemPrompt = ref('');
const isEditing = ref(false);
const showPromptHistory = ref(false);
const availableVariables = ref([]);
const promptRef = ref(null);
const promptHistoryRef = ref(null);
const historyButtonRef = ref(null);

const {
  isOpen: showPublishModal,
  closeModal: closePublishModal,
  openModal: openPublishModal,
} = useModal();

const isDirty = computed(() => prompt.value !== savedPrompt.value);
const hasBeenModified = computed(() => savedPrompt.value?.trim() !== initialPrompt?.trim());
const showPublishButton = computed(() =>
  !isEditing.value && prompt.value?.trim().length >= 10 && (isDirty.value || hasBeenModified.value)
);

onMounted(async () => {
  const { variables } = await SystemPromptVariable.getAll();
  availableVariables.value = variables;
  if (route.query.action === 'focus-system-prompt') {
    isEditing.value = true;
  }
  const { defaultSystemPrompt: dsp } = await System.fetchDefaultSystemPrompt();
  defaultSystemPrompt.value = dsp;
});

watch(() => props.hasChanges, (newVal) => {
  if (!newVal) savedPrompt.value = prompt.value;
});

watch(isEditing, async (newVal) => {
  if (newVal) {
    await nextTick();
    if (promptRef.value) {
      promptRef.value.focus();
    }
  }
});

function handleFocus(e) {
  const length = e.target.value.length;
  e.target.setSelectionRange(length, length);
}

function handleBlur(e) {
  isEditing.value = false;
  prompt.value = e.target.value;
}

function handleInput(e) {
  prompt.value = e.target.value;
  emit('update:hasChanges', true);
}

function handlePaste(e) {
  prompt.value = e.target.value;
  emit('update:hasChanges', true);
}

function handleRestoreFromHistory(historicalPrompt) {
  prompt.value = historicalPrompt;
  showPromptHistory.value = false;
  emit('update:hasChanges', true);
}

function handlePublishFromHistory(historicalPrompt) {
  openPublishModal();
  showPromptHistory.value = false;
  setTimeout(() => (prompt.value = historicalPrompt), 0);
}

async function handleRestoreToDefaultSystemPrompt() {
  const { defaultSystemPrompt: dsp } = await System.fetchDefaultSystemPrompt();
  prompt.value = dsp;
  emit('update:hasChanges', true);
}
</script>

<script>
export function PublishPromptCTA({ hidden = false, onClick }) {
  if (hidden) return null;
  return {
    template: `
      <button
        type="button"
        @click="onClick"
        class="border-none text-primary-button hover:text-white light:hover:text-black text-xs font-medium"
      >
        Publish to Community Hub
      </button>
    `,
    props: ['hidden', 'onClick'],
  };
}
</script>

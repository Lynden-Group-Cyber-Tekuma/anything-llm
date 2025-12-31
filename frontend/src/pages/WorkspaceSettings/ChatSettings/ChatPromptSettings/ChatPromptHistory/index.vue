<template>
  <div
    ref="containerRef"
    :class="[
      'fixed right-3 top-3 bottom-3 w-[375px] bg-theme-action-menu-bg light:bg-theme-home-update-card-bg rounded-xl py-4 px-4 z-[9999] overflow-y-hidden',
      show
        ? 'translate-x-0 opacity-100 visible'
        : 'translate-x-full opacity-0 invisible',
      'transition-all duration-300'
    ]"
  >
    <div class="sticky flex items-center justify-between">
      <div class="text-theme-text-primary text-sm font-semibold">
        {{ t('chat.prompt.history.title') }}
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="history.length > 0"
          type="button"
          class="text-sm font-medium text-theme-text-secondary cursor-pointer hover:text-primary-button border-none"
          @click="handleClearAll"
        >
          {{ t('chat.prompt.history.clearAll') }}
        </button>
        <button
          type="button"
          class="text-theme-text-secondary cursor-pointer hover:text-primary-button border-none"
          @click="$emit('close')"
        >
          <X :size="16" weight="bold" />
        </button>
      </div>
    </div>
    <div class="mt-4 flex flex-col gap-y-[14px] h-full overflow-y-scroll pb-[50px]">
      <LoaderSkeleton v-if="loading" />
      <div
        v-else-if="history.length === 0"
        class="flex text-theme-text-secondary text-sm text-center w-full h-full flex items-center justify-center"
      >
        {{ t('chat.prompt.history.noHistory') }}
      </div>
      <PromptHistoryItem
        v-else
        v-for="item in history"
        :key="item.id"
        :id="item.id"
        v-bind="item"
        @restore="$emit('restore', item.prompt)"
        @publishClick="$emit('publishClick')"
        @updateHistory="setHistory"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { PhX } from '@phosphor-icons/vue';
import PromptHistory from '@/models/promptHistory';
import PromptHistoryItem from './PromptHistoryItem/index.vue';
import LoaderSkeleton from './LoaderSkeleton.vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  workspaceSlug: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['restore', 'close', 'publishClick']);

const { t } = useI18n();
const history = ref([]);
const loading = ref(true);
const containerRef = ref(null);

function loadHistory() {
  if (!props.workspaceSlug) return;
  loading.value = true;
  PromptHistory.forWorkspace(props.workspaceSlug)
    .then((historyData) => {
      history.value = historyData;
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleClearAll() {
  if (!props.workspaceSlug) return;
  if (window.confirm(t('chat.prompt.history.clearAllConfirm'))) {
    PromptHistory.clearAll(props.workspaceSlug)
      .then(({ success }) => {
        if (success) history.value = [];
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

function setHistory(newHistory) {
  history.value = newHistory;
}

watch(() => props.show, (newVal) => {
  if (newVal && props.workspaceSlug) loadHistory();
});

defineExpose({ containerRef });
</script>

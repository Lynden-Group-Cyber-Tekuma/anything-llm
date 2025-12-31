<template>
  <div class="text-white">
    <div class="flex items-center justify-between">
      <div class="text-xs">
        <template v-if="user">
          <span class="text-primary-button">{{ user.username }}</span>
          <span class="mx-1 text-white">•</span>
        </template>
        <span class="text-white opacity-50 light:opacity-100">
          {{ moment(modifiedAt).fromNow() }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="border-none text-sm cursor-pointer text-theme-text-primary hover:text-primary-button"
          @click="$emit('restore')"
        >
          {{ t('chat.prompt.history.restore') }}
        </button>
        <div class="relative">
          <button
            ref="menuButtonRef"
            type="button"
            class="border-none text-theme-text-secondary cursor-pointer hover:text-primary-button flex items-center justify-center"
            @click="showMenu = !showMenu"
          >
            <DotsThreeVertical :size="16" weight="bold" />
          </button>
          <div
            v-if="showMenu"
            ref="menuRef"
            class="absolute right-0 top-6 bg-theme-bg-popup-menu rounded-lg z-50 min-w-[200px]"
          >
            <button
              type="button"
              class="px-[10px] py-[6px] text-sm text-white hover:bg-theme-sidebar-item-hover rounded-t-lg cursor-pointer border-none w-full text-left whitespace-nowrap"
              @click="handlePublish"
            >
              {{ t('chat.prompt.history.publish') }}
            </button>
            <button
              type="button"
              class="px-[10px] py-[6px] text-sm text-white hover:bg-red-500/60 light:hover:bg-red-300/80 rounded-b-lg cursor-pointer border-none w-full text-left whitespace-nowrap"
              @click="handleDelete"
            >
              {{ t('chat.prompt.history.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center mt-1">
      <div class="text-theme-text-primary text-sm font-medium break-all whitespace-pre-wrap">
        <template v-if="prompt.length > MAX_PROMPT_LENGTH && !expanded">
          {{ truncate(prompt, MAX_PROMPT_LENGTH) }}
          <button
            type="button"
            class="text-theme-text-secondary hover:text-primary-button border-none"
            @click="expanded = !expanded"
          >
            {{ t('chat.prompt.history.expand') }}
          </button>
        </template>
        <template v-else>
          {{ prompt }}
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { PhDotsThreeVertical } from '@phosphor-icons/vue';
import PromptHistory from '@/models/promptHistory';
import moment from 'moment';
import truncate from 'truncate';

const MAX_PROMPT_LENGTH = 200;

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  modifiedAt: {
    type: String,
    required: true,
  },
  user: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['restore', 'updateHistory', 'publishClick']);

const { t } = useI18n();
const showMenu = ref(false);
const menuRef = ref(null);
const menuButtonRef = ref(null);
const expanded = ref(false);

async function deleteHistory(id) {
  if (window.confirm(t('chat.prompt.history.deleteConfirm'))) {
    const { success } = await PromptHistory.delete(id);
    if (success) {
      emit('updateHistory', (prevHistory) =>
        prevHistory.filter((item) => item.id !== id)
      );
    }
  }
}

function handlePublish() {
  showMenu.value = false;
  emit('publishClick', props.prompt);
}

function handleDelete() {
  showMenu.value = false;
  deleteHistory(props.id);
}

function handleClickOutside(event) {
  if (
    showMenu.value &&
    menuRef.value &&
    !menuRef.value.contains(event.target) &&
    menuButtonRef.value &&
    !menuButtonRef.value.contains(event.target)
  ) {
    showMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

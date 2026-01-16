<template>
  <div>
    <div class="flex flex-col">
      <label for="chatMode" class="block input-label">
        {{ t('chat.mode.title') }}
      </label>
    </div>

    <div class="flex flex-col gap-y-1 mt-2">
      <div class="w-fit flex gap-x-1 items-center p-1 rounded-lg bg-theme-settings-input-bg">
        <input type="hidden" name="chatMode" :value="chatMode" />
        <button
          type="button"
          :disabled="chatMode === 'chat'"
          @click="handleModeChange('chat')"
          class="transition-bg duration-200 px-6 py-1 text-md text-white/60 disabled:text-white bg-transparent disabled:bg-[#687280] rounded-md"
        >
          {{ t('chat.mode.chat.title') }}
        </button>
        <button
          type="button"
          :disabled="chatMode === 'query'"
          @click="handleModeChange('query')"
          class="transition-bg duration-200 px-6 py-1 text-md text-white/60 disabled:text-white bg-transparent disabled:bg-[#687280] rounded-md"
        >
          {{ t('chat.mode.query.title') }}
        </button>
      </div>
      <p class="text-sm text-white/60">
        <template v-if="chatMode === 'chat'">
          <b>{{ t('chat.mode.chat.title') }}</b>
          {{ t('chat.mode.chat.desc-start') }}
          <i class="font-semibold">{{ t('chat.mode.chat.and') }}</i>
          {{ t('chat.mode.chat.desc-end') }}
        </template>
        <template v-else>
          <b>{{ t('chat.mode.query.title') }}</b>
          {{ t('chat.mode.query.desc-start') }}
          <i class="font-semibold">{{ t('chat.mode.query.only') }}</i>
          {{ t('chat.mode.query.desc-end') }}
        </template>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  workspace: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:hasChanges']);

const { t } = useI18n();
const chatMode = ref(props.workspace?.chatMode || 'chat');

function handleModeChange(mode) {
  chatMode.value = mode;
  emit('update:hasChanges', true);
}
</script>

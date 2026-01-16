<template>
  <div class="mt-4 flex flex-col gap-y-1">
    <label class="block input-label">{{ t('chat.model.title') }}</label>
    <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
      {{ t('chat.model.description') }}
    </p>
    <input
      type="text"
      name="chatModel"
      :defaultValue="workspace?.chatModel || ''"
      @change="$emit('update:hasChanges', true)"
      class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
      placeholder="Enter model name exactly as referenced in the API (e.g., gpt-3.5-turbo)"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  workspace: {
    type: Object,
    required: true,
  },
});

defineEmits(['update:hasChanges']);

const { t } = useI18n();
</script>

<template>
  <div>
    <div class="flex flex-col gap-y-1 mb-4">
      <label for="name" class="block mb-2 input-label">
        {{ t('chat.history.title') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium">
        {{ t('chat.history.desc-start') }}
        <i> {{ t('chat.history.recommend') }} </i>
        {{ t('chat.history.desc-end') }}
      </p>
    </div>
    <input
      name="openAiHistory"
      type="number"
      :min="1"
      :max="45"
      :step="1"
      @wheel="$event.target.blur()"
      :defaultValue="workspace?.openAiHistory ?? 20"
      class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
      placeholder="20"
      required
      autocomplete="off"
      @change="$emit('update:hasChanges', true)"
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

<template>
  <div>
    <div class="flex flex-col">
      <label for="name" class="block input-label">
        {{ t('vector-workspace.doc.title') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('vector-workspace.doc.description') }}
      </p>
    </div>
    <select
      name="similarityThreshold"
      :defaultValue="workspace?.similarityThreshold ?? 0.25"
      class="border-none bg-theme-settings-input-bg text-white text-sm mt-2 rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
      @change="$emit('update:hasChanges', true)"
      required
    >
      <option :value="0.0">{{ t('vector-workspace.doc.zero') }}</option>
      <option :value="0.25">{{ t('vector-workspace.doc.low') }}</option>
      <option :value="0.5">{{ t('vector-workspace.doc.medium') }}</option>
      <option :value="0.75">{{ t('vector-workspace.doc.high') }}</option>
    </select>
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

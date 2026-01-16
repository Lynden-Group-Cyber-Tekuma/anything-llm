<template>
  <div>
    <div class="flex flex-col">
      <label for="name" class="block input-label">
        {{ t('vector-workspace.snippets.title') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('vector-workspace.snippets.description') }}
        <br />
        <i>{{ t('vector-workspace.snippets.recommend') }}</i>
      </p>
    </div>
    <input
      name="topN"
      type="number"
      :min="1"
      :max="200"
      :step="1"
      @wheel="$event.target.blur()"
      :defaultValue="workspace?.topN ?? 4"
      class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5 mt-2"
      placeholder="4"
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

<template>
  <div>
    <div class="flex flex-col">
      <label for="name" class="block input-label">
        {{ t('common.workspaces-name') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('general.names.description') }}
      </p>
    </div>
    <input
      name="name"
      type="text"
      :minlength="2"
      :maxlength="80"
      :defaultValue="workspace?.name"
      class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
      placeholder="My Workspace"
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

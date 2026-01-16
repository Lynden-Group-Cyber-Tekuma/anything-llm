<template>
  <div>
    <h3 class="input-label">{{ t('vector-workspace.identifier') }}</h3>
    <p class="text-white/60 text-xs font-medium py-1"> </p>
    <p class="text-white/60 text-sm">{{ workspace?.slug }}</p>
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

const { t } = useI18n();
</script>

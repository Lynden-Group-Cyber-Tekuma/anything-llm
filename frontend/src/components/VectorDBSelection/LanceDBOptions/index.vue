<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="w-full h-10 items-center flex">
    <p class="text-sm font-base text-white text-opacity-60">
      {{ t('vector.provider.description') }}
    </p>
  </div>
</template>

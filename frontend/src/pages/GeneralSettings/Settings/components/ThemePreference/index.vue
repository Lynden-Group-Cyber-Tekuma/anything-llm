<script setup>
import { useTheme } from '@/hooks/useTheme'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { theme, setTheme, availableThemes } = useTheme()
</script>

<template>
  <div class="flex flex-col gap-y-0.5 my-4">
    <p class="text-sm leading-6 font-semibold text-white">
      {{ t('customization.items.theme.title') }}
    </p>
    <p class="text-xs text-white/60">
      {{ t('customization.items.theme.description') }}
    </p>
    <div class="flex items-center gap-x-4">
      <select
        :value="theme"
        @change="(e) => setTheme(e.target.value)"
        class="border-none bg-theme-settings-input-bg mt-2 text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-fit py-2 px-4"
      >
        <option
          v-for="([key, value]) in Object.entries(availableThemes)"
          :key="key"
          :value="key"
        >
          {{ value }}
        </option>
      </select>
    </div>
  </div>
</template>

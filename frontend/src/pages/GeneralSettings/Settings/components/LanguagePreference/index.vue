<script setup>
import { useLanguageOptions } from '@/hooks/useLanguageOptions'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const {
  currentLanguage,
  supportedLanguages,
  getLanguageName,
  changeLanguage,
} = useLanguageOptions()
</script>

<template>
  <div class="flex flex-col gap-y-0.5 my-4">
    <p class="text-sm leading-6 font-semibold text-white">
      {{ t('customization.items.display-language.title') }}
    </p>
    <p class="text-xs text-white/60">
      {{ t('customization.items.display-language.description') }}
    </p>
    <div class="flex items-center gap-x-4">
      <select
        name="userLang"
        class="border-none bg-theme-settings-input-bg mt-2 text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-fit py-2 px-4"
        :value="currentLanguage || 'en'"
        @change="(e) => changeLanguage(e.target.value)"
      >
        <option
          v-for="lang in supportedLanguages"
          :key="lang"
          :value="lang"
        >
          {{ getLanguageName(lang) }}
        </option>
      </select>
    </div>
  </div>
</template>

<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar />
    <div
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
    >
      <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:pt-6">
        <p class="text-lg leading-6 font-bold text-theme-text-primary md-6 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10 py-4">
          {{ t('security.title') }}
        </p>
      </div>
      <MultiUserMode />
      <PasswordProtection />
    </div>
  </div>
</template>

<script setup>
import { isMobile } from 'react-device-detect'
import { useI18n } from 'vue-i18n'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import MultiUserMode from './MultiUserMode.vue'
import PasswordProtection from './PasswordProtection.vue'

const { t } = useI18n()
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar />
    <div
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
    >
      <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[86px] md:py-6 py-16">
        <div class="w-full flex flex-col gap-y-1 pb-6 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10">
          <div class="items-center">
            <p class="text-lg leading-6 font-bold text-white">
              {{ t('customization.branding.title') }}
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-white text-opacity-60">
            {{ t('customization.branding.description') }}
          </p>
        </div>
        <CustomAppName />
        <CustomLogo />
        <CustomMessages />
        <FooterCustomization />
        <SupportEmail />
        <CustomSiteSettings />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/SettingsSidebar/index.vue'
import { isMobile } from 'react-device-detect'
import FooterCustomization from '../components/FooterCustomization/index.vue'
import SupportEmail from '../components/SupportEmail/index.vue'
import CustomLogo from '../components/CustomLogo/index.vue'
import CustomMessages from '../components/CustomMessages/index.vue'
import { useI18n } from 'vue-i18n'
import CustomAppName from '../components/CustomAppName/index.vue'
import CustomSiteSettings from '../components/CustomSiteSettings/index.vue'

const { t } = useI18n()
</script>

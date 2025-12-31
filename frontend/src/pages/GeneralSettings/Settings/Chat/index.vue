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
              {{ t('customization.chat.title') }}
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-white text-opacity-60">
            {{ t('customization.chat.description') }}
          </p>
        </div>
        <AutoSubmit />
        <AutoSpeak />
        <SpellCheck />
        <ShowScrollbar />
        <ChatRenderHTML />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/SettingsSidebar/index.vue'
import { isMobile } from 'react-device-detect'
import { useI18n } from 'vue-i18n'
import AutoSubmit from '../components/AutoSubmit/index.vue'
import AutoSpeak from '../components/AutoSpeak/index.vue'
import SpellCheck from '../components/SpellCheck/index.vue'
import ShowScrollbar from '../components/ShowScrollbar/index.vue'
import ChatRenderHTML from '../components/ChatRenderHTML/index.vue'

const { t } = useI18n()
</script>

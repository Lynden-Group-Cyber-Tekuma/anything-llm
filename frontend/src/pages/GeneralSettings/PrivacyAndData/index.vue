<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar />
    <div
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] light:border light:border-theme-sidebar-border bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
    >
      <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
        <div class="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
          <div class="items-center flex gap-x-4">
            <p class="text-lg leading-6 font-bold text-theme-text-primary">
              {{ t('privacy.title') }}
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-theme-text-secondary">
            {{ t('privacy.description') }}
          </p>
        </div>
        <div v-if="loading" class="h-1/2 transition-all duration-500 relative md:ml-[2px] md:mr-[8px] md:my-[16px] md:rounded-[26px] p-[18px] h-full overflow-y-scroll">
          <div class="w-full h-full flex justify-center items-center">
            <PreLoader />
          </div>
        </div>
        <div v-else class="overflow-x-auto flex flex-col gap-y-6 pt-6">
          <ProviderPrivacy />
          <TelemetryLogs :settings="settings" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobile } from 'react-device-detect'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import System from '@/models/system'
import PreLoader from '@/components/Preloader/index.vue'
import ProviderPrivacy from '@/components/ProviderPrivacy/index.vue'
import TelemetryLogs from './TelemetryLogs.vue'

const { t } = useI18n()
const settings = ref({})
const loading = ref(true)

onMounted(async () => {
  const _settings = await System.keys()
  settings.value = _settings
  loading.value = false
})
</script>

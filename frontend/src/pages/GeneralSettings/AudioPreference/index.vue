<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar />
    <div
      v-if="loading"
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
    >
      <div class="w-full h-full flex justify-center items-center">
        <PreLoader />
      </div>
    </div>
    <div
      v-else
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
    >
      <SpeechToTextProvider :settings="settings" />
      <TextToSpeechProvider :settings="settings" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { isMobile } from 'react-device-detect'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import System from '@/models/system'
import PreLoader from '@/components/Preloader/index.vue'
import SpeechToTextProvider from './stt.vue'
import TextToSpeechProvider from './tts.vue'

const settings = ref(null)
const loading = ref(true)

onMounted(async () => {
  const _settings = await System.keys()
  settings.value = _settings
  loading.value = false
})
</script>

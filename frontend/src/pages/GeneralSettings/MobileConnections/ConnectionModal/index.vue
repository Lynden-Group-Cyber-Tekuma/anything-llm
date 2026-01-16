<template>
  <ModalWrapper :isOpen="isOpen">
    <div
      class="relative w-full rounded-lg shadow"
      :style="{
        minHeight: '60vh',
        maxWidth: '70vw',
        backgroundImage: `url(${BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    >
      <button
        @click="$emit('close')"
        type="button"
        class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
      >
        <X :size="24" weight="bold" class="text-[#FFF]" />
      </button>

      <div class="flex w-full h-full justify-between p-[35px]">
        <!-- left column -->
        <div class="flex flex-col w-1/2 gap-y-[16px]">
          <p class="text-[#FFF] text-xl font-bold">
            Go mobile. Stay local. AnythingLLM Mobile.
          </p>
          <p class="text-[#FFF] text-lg">
            AnythingLLM for mobile allows you to connect or clone your
            workspace's chats, threads and documents for you to use on the go.
            <br />
            <br />
            Run with local models on your phone privately or relay chats
            directly to this instance seamlessly.
          </p>
        </div>

        <!-- right column -->
        <div class="flex flex-col items-center justify-center shrink-0 w-1/2 gap-y-[16px]">
          <div class="bg-white/10 rounded-lg p-[40px] w-[300px] h-[300px] flex flex-col gap-y-[16px] items-center justify-center">
            <ConnectionQrCode :isOpen="isOpen" />
          </div>
          <p class="text-[#FFF] text-sm w-[300px] text-center">
            Scan the QR code with the AnythingLLM Mobile app to enable live
            sync of your workspaces, chats, threads and documents.
            <br />
            <RouterLink
              :to="paths.documentation.mobileIntroduction()"
              class="text-cta-button font-semibold"
            >
              Learn more
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { PhX } from '@phosphor-icons/vue'
import { RouterLink } from 'vue-router'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import BG from './bg.png'
import paths from '@/utils/paths'
import ConnectionQrCode from './ConnectionQrCode.vue'

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

defineEmits(['close'])
</script>

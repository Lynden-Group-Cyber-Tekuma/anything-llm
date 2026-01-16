<script setup>
import { useLogo } from '@/composables/useLogo'
import illustration from '@/media/illustrations/login-illustration.svg'
import SingleUserAuth from './SingleUserAuth.vue'
import MultiUserAuth from './MultiUserAuth.vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'single'
  }
})

const { loginLogo } = useLogo()
</script>

<template>
  <div class="fixed top-0 left-0 right-0 z-50 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] h-full bg-theme-bg-primary flex flex-col md:flex-row items-center justify-center">
    <div
      :style="{
        background: `
          radial-gradient(circle at center, transparent 40%, black 100%),
          linear-gradient(180deg, #85F8FF 0%, #65A6F2 100%)
        `,
        width: '575px',
        filter: 'blur(150px)',
        opacity: '0.4',
      }"
      class="absolute left-0 top-0 z-0 h-full w-full"
    />
    <div class="hidden md:flex md:w-1/2 md:h-full md:items-center md:justify-center">
      <img
        class="w-full h-full object-contain z-50"
        :src="illustration"
        alt="login illustration"
      />
    </div>
    <div class="flex flex-col items-center justify-center h-full w-full md:w-1/2 z-50 relative md:-mt-20 mt-0 !border-none bg-theme-bg-secondary md:bg-transparent">
      <img
        :src="loginLogo"
        alt="Logo"
        :class="[
          'hidden relative md:flex rounded-2xl w-fit m-4 z-30 absolute max-h-[65px]',
          mode === 'single' ? 'md:top-2' : 'md:top-12'
        ]"
        style="object-fit: contain"
      />
      <SingleUserAuth v-if="mode === 'single'" />
      <MultiUserAuth v-else />
    </div>
  </div>
</template>

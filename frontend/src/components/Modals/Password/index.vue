<script setup>
import { ref, onMounted } from 'vue'
import System from '@/models/system'
import {
  AUTH_TOKEN,
  AUTH_USER,
  AUTH_TIMESTAMP,
} from '@/utils/constants'
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

// Composable: usePasswordModal
export function usePasswordModal(notry = false) {
  const auth = ref({
    loading: true,
    requiresAuth: false,
    mode: 'single',
  })

  onMounted(async () => {
    if (!window) return

    // If the last validity check is still valid
    // we can skip the loading.
    if (!System.needsAuthCheck() && notry === false) {
      auth.value = {
        loading: false,
        requiresAuth: false,
        mode: 'multi',
      }
      return
    }

    const settings = await System.keys()
    if (settings?.MultiUserMode) {
      const currentToken = window.localStorage.getItem(AUTH_TOKEN)
      if (!!currentToken) {
        const valid = notry ? false : await System.checkAuth(currentToken)
        if (!valid) {
          auth.value = {
            loading: false,
            requiresAuth: true,
            mode: 'multi',
          }
          window.localStorage.removeItem(AUTH_USER)
          window.localStorage.removeItem(AUTH_TOKEN)
          window.localStorage.removeItem(AUTH_TIMESTAMP)
          return
        } else {
          auth.value = {
            loading: false,
            requiresAuth: false,
            mode: 'multi',
          }
          return
        }
      } else {
        auth.value = {
          loading: false,
          requiresAuth: true,
          mode: 'multi',
        }
        return
      }
    } else {
      // Running token check in single user Auth mode.
      // If Single user Auth is disabled - skip check
      const requiresAuth = settings?.RequiresAuth || false
      if (!requiresAuth) {
        auth.value = {
          loading: false,
          requiresAuth: false,
          mode: 'single',
        }
        return
      }

      const currentToken = window.localStorage.getItem(AUTH_TOKEN)
      if (!!currentToken) {
        const valid = notry ? false : await System.checkAuth(currentToken)
        if (!valid) {
          auth.value = {
            loading: false,
            requiresAuth: true,
            mode: 'single',
          }
          window.localStorage.removeItem(AUTH_TOKEN)
          window.localStorage.removeItem(AUTH_USER)
          window.localStorage.removeItem(AUTH_TIMESTAMP)
          return
        } else {
          auth.value = {
            loading: false,
            requiresAuth: false,
            mode: 'single',
          }
          return
        }
      } else {
        auth.value = {
          loading: false,
          requiresAuth: true,
          mode: 'single',
        }
        return
      }
    }
  })

  return auth
}
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

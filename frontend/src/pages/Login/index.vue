<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePasswordModal } from '@/composables/usePasswordModal'
import { useSimpleSSO } from '@/composables/useSimpleSSO'
import FullScreenLoader from '@/components/Preloader/FullScreenLoader.vue'
import PasswordModal from '@/components/Modals/Password/index.vue'
import paths from '@/utils/paths'

const route = useRoute()
const router = useRouter()

const hasNtQuery = computed(() => route.query.nt === '1')
const hasTokenQuery = computed(() => 'token' in route.query)

const { loading: ssoLoading, ssoConfig } = useSimpleSSO()
const { loading, requiresAuth, mode } = usePasswordModal(hasNtQuery.value)

// Handle SSO redirects
watch([ssoLoading, ssoConfig], ([ssoLoad, ssoConf]) => {
  if (ssoLoad) return

  if (ssoConf.enabled && ssoConf.noLogin) {
    if (ssoConf.noLoginRedirect && !hasTokenQuery.value) {
      window.location.replace(ssoConf.noLoginRedirect)
    } else {
      router.push(paths.sso.login())
    }
  }
}, { immediate: true })

// Handle auth redirects
watch([loading, requiresAuth], ([load, auth]) => {
  if (load) return

  if (auth === false) {
    router.push(paths.home())
  }
}, { immediate: true })
</script>

<template>
  <FullScreenLoader v-if="loading || ssoLoading" />
  <PasswordModal v-else-if="requiresAuth !== false" :mode="mode" />
</template>

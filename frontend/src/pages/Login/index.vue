<script setup>
import PasswordModal, { usePasswordModal } from '@/components/Modals/Password'
import { FullScreenLoader } from '@/components/Preloader'
import { useRouter } from 'vue-router'
import paths from '@/utils/paths'
import useQuery from '@/hooks/useQuery'
import useSimpleSSO from '@/hooks/useSimpleSSO'
import { watch } from 'vue'

/**
 * Login page that handles both single and multi-user login.
 *
 * If Simple SSO is enabled and no login is allowed, the user will be redirected to the SSO login page
 * which may not have a token so the login will fail.
 */

const query = useQuery()
const router = useRouter()
const { loading: ssoLoading, ssoConfig } = useSimpleSSO()
const { loading, requiresAuth, mode } = usePasswordModal(!!query.get('nt'))

// Handle SSO redirects
watch(
  [ssoLoading, ssoConfig],
  ([isLoading, config]) => {
    if (isLoading) return

    // If simple SSO is enabled and no login is allowed, redirect to the SSO login page.
    if (config.enabled && config.noLogin) {
      // If a noLoginRedirect is provided and no token is provided, redirect to that webpage.
      if (!!config.noLoginRedirect && !query.has('token')) {
        window.location.replace(config.noLoginRedirect)
        return
      }
      // Otherwise, redirect to the SSO login page.
      router.push(paths.sso.login())
    }
  },
  { immediate: true }
)

// Handle auth check redirects
watch(
  [loading, requiresAuth],
  ([isLoading, auth]) => {
    if (isLoading) return
    if (auth === false) {
      router.push(paths.home())
    }
  },
  { immediate: true }
)
</script>

<template>
  <FullScreenLoader v-if="loading || ssoLoading" />
  <PasswordModal v-else-if="requiresAuth !== false" :mode="mode" />
</template>

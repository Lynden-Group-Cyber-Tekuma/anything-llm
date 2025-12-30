<script setup>
import { ref, onMounted } from 'vue'
import { FullScreenLoader } from '@/components/Preloader'
import paths from '@/utils/paths'
import useQuery from '@/hooks/useQuery'
import System from '@/models/system'
import { AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER } from '@/utils/constants'

const query = useQuery()
const redirectPath = query.get('redirectTo') || paths.home()
const ready = ref(false)
const error = ref(null)

onMounted(async () => {
  try {
    if (!query.get('token')) throw new Error('No token provided.')

    // Clear any existing auth data
    window.localStorage.removeItem(AUTH_USER)
    window.localStorage.removeItem(AUTH_TOKEN)
    window.localStorage.removeItem(AUTH_TIMESTAMP)

    const res = await System.simpleSSOLogin(query.get('token'))
    if (!res.valid) throw new Error(res.message)

    window.localStorage.setItem(AUTH_USER, JSON.stringify(res.user))
    window.localStorage.setItem(AUTH_TOKEN, res.token)
    window.localStorage.setItem(AUTH_TIMESTAMP, Number(new Date()))
    ready.value = res.valid

    // Redirect to the specified path
    if (ready.value) {
      window.location.replace(redirectPath)
    }
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <div
    v-if="error"
    class="w-screen h-screen overflow-hidden bg-theme-bg-primary flex items-center justify-center flex-col gap-4"
  >
    <p class="text-theme-text-primary font-mono text-lg">{{ error }}</p>
    <p class="text-theme-text-secondary font-mono text-sm">
      Please contact the system administrator about this error.
    </p>
  </div>
  <FullScreenLoader v-else />
</template>

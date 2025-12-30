<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AUTH_TOKEN, AUTH_USER } from '@/utils/constants'
import paths from '@/utils/paths'
import FullScreenLoader from '@/components/Preloader/FullScreenLoader.vue'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const token = route.query.token

  if (token) {
    // Store the token and redirect
    window.localStorage.setItem(AUTH_TOKEN, token)
    router.push(paths.home())
  } else {
    // No token provided, redirect to login
    router.push(paths.login())
  }
})
</script>

<template>
  <FullScreenLoader />
</template>

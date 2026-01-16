<script setup>
import { useRouter } from 'vue-router'
import { useCanViewChatHistory } from '@/composables/useCanViewChatHistory'
import FullScreenLoader from '@/components/Preloader/FullScreenLoader.vue'
import paths from '@/utils/paths'

/**
 * Protects the view from system set ups who cannot view chat history.
 * If the user cannot view chat history, they are redirected to the home page.
 */

const router = useRouter()
const { loading, viewable } = useCanViewChatHistory()

// Watch for when loading completes and redirect if not viewable
const checkAndRedirect = () => {
  if (!loading.value && !viewable.value) {
    router.push(paths.home())
  }
}

// Check initially and watch for changes
checkAndRedirect()
</script>

<template>
  <FullScreenLoader v-if="loading || !viewable" />
  <slot v-else />
</template>

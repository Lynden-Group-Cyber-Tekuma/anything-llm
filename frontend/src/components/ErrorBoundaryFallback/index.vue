<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { PhHouse, PhArrowPhClockwise, PhCopy, PhCheck } from '@phosphor-icons/vue'

const props = defineProps({
  error: {
    type: Error,
    default: null
  }
})

const emit = defineEmits(['reset'])

const copied = ref(false)

const copyErrorDetails = async () => {
  const details = {
    url: window.location.href,
    error: props.error?.name || 'Unknown Error',
    message: props.error?.message || 'No message available',
    stack: props.error?.stack || 'No stack trace available',
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  }

  const formattedDetails = `
Error Report
============
Timestamp: ${details.timestamp}
URL: ${details.url}
User Agent: ${details.userAgent}

Error: ${details.error}
Message: ${details.message}

Stack Trace:
${details.stack}
  `.trim()

  try {
    await navigator.clipboard.writeText(formattedDetails)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (err) {
    console.error('Failed to copy error details:', err)
  }
}

const resetErrorBoundary = () => {
  emit('reset')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-theme-bg-primary text-theme-text-primary gap-4 p-4 md:p-8 w-full">
    <h1 class="text-xl md:text-2xl font-bold text-center">
      An error occurred.
    </h1>
    <p class="text-theme-text-secondary text-center px-4">
      {{ error?.message }}
    </p>
    <div v-if="import.meta.env.DEV" class="w-full max-w-4xl">
      <div class="flex justify-end mb-2">
        <button
          @click="copyErrorDetails"
          class="flex items-center gap-2 px-3 py-1.5 bg-theme-bg-secondary text-theme-text-primary rounded hover:bg-theme-sidebar-item-hover transition-all duration-200 text-xs font-medium"
          title="Copy error details"
        >
          <template v-if="copied">
            <PhCheck class="w-3.5 h-3.5" weight="bold" />
            Copied!
          </template>
          <template v-else>
            <PhCopy class="w-3.5 h-3.5" />
            Copy Details
          </template>
        </button>
      </div>
      <pre class="w-full text-xs md:text-sm text-theme-text-secondary bg-theme-bg-secondary p-4 md:p-6 rounded-lg overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-[70vh] whitespace-pre-wrap break-words font-mono border border-theme-border shadow-sm">{{ error?.stack }}</pre>
    </div>
    <div class="flex flex-col md:flex-row gap-3 md:gap-4 mt-4 w-full md:w-auto">
      <button
        @click="resetErrorBoundary"
        class="flex items-center justify-center gap-2 px-4 py-2 bg-theme-bg-secondary text-theme-text-primary rounded-lg hover:bg-theme-sidebar-item-hover transition-all duration-300 w-full md:w-auto"
      >
        <PhArrowClockwise class="w-4 h-4" />
        Reset
      </button>
      <RouterLink
        to="/"
        class="flex items-center justify-center gap-2 px-4 py-2 bg-theme-bg-secondary text-theme-text-primary rounded-lg hover:bg-theme-sidebar-item-hover transition-all duration-300 w-full md:w-auto"
      >
        <PhHouse class="w-4 h-4" />
        Home
      </RouterLink>
    </div>
  </div>
</template>

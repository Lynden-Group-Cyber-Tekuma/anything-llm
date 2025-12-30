<script setup>
import { ref, watch, onErrorCaptured } from 'vue'

const props = defineProps({
  resetKeys: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['error'])

const error = ref(null)
const errorInfo = ref(null)

onErrorCaptured((err, instance, info) => {
  error.value = err
  errorInfo.value = info
  emit('error', err)
  return false
})

// Reset error when resetKeys change
watch(() => props.resetKeys, () => {
  error.value = null
  errorInfo.value = null
}, { deep: true })

function reset() {
  error.value = null
  errorInfo.value = null
}
</script>

<template>
  <div v-if="error" class="flex h-screen w-screen flex-col items-center justify-center bg-theme-bg-primary text-theme-text-primary">
    <h1 class="text-2xl font-bold mb-4">Something went wrong</h1>
    <p class="text-theme-text-secondary mb-4">{{ error.message }}</p>
    <button
      @click="reset"
      class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
    >
      Try again
    </button>
  </div>
  <slot v-else />
</template>

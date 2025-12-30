<script setup>
import { ref } from 'vue'

const props = defineProps({
  recoveryCodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['downloadComplete', 'close'])

const downloaded = ref(false)

function downloadRecoveryCodes() {
  const element = document.createElement('a')
  const file = new Blob([props.recoveryCodes.join('\n')], { type: 'text/plain' })
  element.href = URL.createObjectURL(file)
  element.download = 'anythingllm-recovery-codes.txt'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  downloaded.value = true
}

function handleContinue() {
  emit('downloadComplete')
  emit('close')
}
</script>

<template>
  <div class="bg-theme-bg-secondary rounded-lg p-6 max-w-md mx-auto">
    <h2 class="text-xl font-bold text-theme-text-primary mb-4">Save Your Recovery Codes</h2>
    <p class="text-theme-text-secondary mb-4">
      Please save these recovery codes in a safe place. You'll need them to reset your password if you forget it.
    </p>
    <div class="bg-theme-bg-primary rounded p-4 mb-4">
      <code v-for="(code, index) in recoveryCodes" :key="index" class="block text-theme-text-primary">
        {{ code }}
      </code>
    </div>
    <div class="flex flex-col gap-2">
      <button
        @click="downloadRecoveryCodes"
        class="w-full px-4 py-2 bg-primary-button text-white rounded hover:bg-primary-button/80"
      >
        Download Recovery Codes
      </button>
      <button
        v-if="downloaded"
        @click="handleContinue"
        class="w-full px-4 py-2 border border-primary-button text-primary-button rounded hover:bg-primary-button hover:text-white"
      >
        Continue
      </button>
    </div>
  </div>
</template>

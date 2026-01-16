<script setup>
import PiperTTSModelSelection from './PiperTTSModelSelection.vue'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div>
    <p class="text-sm font-base text-white text-opacity-60 mb-4">
      All PiperTTS models will run in your browser locally. This can be
      resource intensive on lower-end devices.
    </p>
    <div class="flex gap-x-4 items-center">
      <PiperTTSModelSelection :settings="settings" />
    </div>
  </div>
</template>

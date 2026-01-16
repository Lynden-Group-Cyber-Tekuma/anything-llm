<template>
  <div>
    <p class="text-sm text-white/60 my-2">
      DuckDuckGo is ready to use without any additional configuration.
    </p>
  </div>
</template>

<script setup>
defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})
</script>

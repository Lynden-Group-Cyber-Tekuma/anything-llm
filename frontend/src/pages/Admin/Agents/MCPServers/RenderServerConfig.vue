<template>
  <div v-if="config" class="flex flex-col gap-y-2">
    <p class="text-theme-text-primary text-sm">Startup Command</p>
    <div class="bg-theme-bg-primary rounded-lg p-4">
      <p class="text-theme-text-secondary text-sm text-left">
        <span class="font-bold">Command:</span> {{ config.command }}
      </p>
      <p class="text-theme-text-secondary text-sm text-left">
        <span class="font-bold">Arguments:</span>
        {{ config.args ? config.args.join(' ') : 'None' }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  config: {
    type: Object,
    default: null
  }
})
</script>

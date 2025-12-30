<script setup>
defineProps({
  size: {
    type: String,
    default: '16'
  }
})
</script>

<template>
  <div
    :class="`h-${size} w-${size} animate-spin rounded-full border-4 border-solid border-primary border-t-transparent`"
  />
</template>

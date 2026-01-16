<script setup>
import Sidebar from '@/components/Sidebar/index.vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar />

    <div class="flex-1 overflow-y-auto">
      <div class="max-w-4xl mx-auto p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-theme-text-primary">{{ title }}</h1>
          <p v-if="description" class="text-theme-text-secondary mt-1">{{ description }}</p>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

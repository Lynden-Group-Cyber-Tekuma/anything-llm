<script setup>
import paths from '@/utils/paths'
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-theme-text-primary text-lg font-semibold">Resources</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <a
        :href="paths.docs()"
        target="_blank"
        rel="noopener noreferrer"
        class="p-4 rounded-lg bg-theme-bg-secondary hover:bg-theme-sidebar-item-hover transition-colors"
      >
        <h3 class="text-theme-text-primary font-medium">Getting Started Guide</h3>
        <p class="text-theme-text-secondary text-sm">Learn how to set up and use AnythingLLM</p>
      </a>
      <a
        :href="paths.apiDocs()"
        target="_blank"
        rel="noopener noreferrer"
        class="p-4 rounded-lg bg-theme-bg-secondary hover:bg-theme-sidebar-item-hover transition-colors"
      >
        <h3 class="text-theme-text-primary font-medium">API Documentation</h3>
        <p class="text-theme-text-secondary text-sm">Integrate AnythingLLM with your applications</p>
      </a>
    </div>
  </div>
</template>

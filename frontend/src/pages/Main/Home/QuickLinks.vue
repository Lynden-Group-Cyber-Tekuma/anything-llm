<script setup>
import { PhBookOpen, PhDiscordLogo, PhGithubLogo } from '@phosphor-icons/vue'
import paths from '@/utils/paths'
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-theme-text-primary text-lg font-semibold">Quick Links</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <a
        :href="paths.docs()"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 p-4 rounded-lg bg-theme-bg-secondary hover:bg-theme-sidebar-item-hover transition-colors"
      >
        <PhBookOpen class="w-6 h-6 text-primary-button" />
        <span class="text-theme-text-primary">Documentation</span>
      </a>
      <a
        :href="paths.discord()"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 p-4 rounded-lg bg-theme-bg-secondary hover:bg-theme-sidebar-item-hover transition-colors"
      >
        <PhDiscordLogo class="w-6 h-6 text-primary-button" />
        <span class="text-theme-text-primary">Discord Community</span>
      </a>
      <a
        :href="paths.github()"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 p-4 rounded-lg bg-theme-bg-secondary hover:bg-theme-sidebar-item-hover transition-colors"
      >
        <PhGithubLogo class="w-6 h-6 text-primary-button" />
        <span class="text-theme-text-primary">GitHub Repository</span>
      </a>
    </div>
  </div>
</template>

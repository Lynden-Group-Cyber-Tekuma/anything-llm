<script setup>
import { RouterLink } from 'vue-router'
import { House, MagnifyingGlass } from '@phosphor-icons/vue'
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-theme-bg-primary text-theme-text-primary gap-4 p-4 md:p-8 w-full">
    <MagnifyingGlass class="w-16 h-16 text-theme-text-secondary" />
    <h1 class="text-xl md:text-2xl font-bold text-center">
      404 - Page Not Found
    </h1>
    <p class="text-theme-text-secondary text-center px-4">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div class="flex flex-col md:flex-row gap-3 md:gap-4 mt-4 w-full md:w-auto">
      <RouterLink
        to="/"
        class="flex items-center justify-center gap-2 px-4 py-2 bg-theme-bg-secondary text-theme-text-primary rounded-lg hover:bg-theme-sidebar-item-hover transition-all duration-300 w-full md:w-auto"
      >
        <House class="w-4 h-4" />
        Go Home
      </RouterLink>
    </div>
  </div>
</template>

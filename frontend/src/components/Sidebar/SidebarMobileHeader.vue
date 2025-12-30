<script setup>
import { ref } from 'vue'
import { useLogo } from '@/composables/useLogo'

const { logo } = useLogo()
const isOpen = ref(false)

function toggleSidebar() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="fixed top-0 left-0 right-0 z-40 bg-theme-bg-sidebar p-4 flex items-center justify-between border-b border-theme-sidebar-border">
    <router-link to="/">
      <img :src="logo" alt="Logo" class="h-8 object-contain" />
    </router-link>
    <button
      @click="toggleSidebar"
      class="text-theme-text-primary p-2"
    >
      <span class="text-2xl">&#9776;</span>
    </button>
  </div>
</template>

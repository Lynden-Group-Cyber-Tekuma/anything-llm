<script setup>
import { PhChats, PhRobot, PhFiles, PhGear } from '@phosphor-icons/vue'
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-theme-text-primary text-lg font-semibold">Explore Features</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-lg bg-theme-bg-secondary">
        <PhChats class="w-8 h-8 text-primary-button mb-2" />
        <h3 class="text-theme-text-primary font-medium">Workspaces</h3>
        <p class="text-theme-text-secondary text-sm">Create isolated workspaces for different projects</p>
      </div>
      <div class="p-4 rounded-lg bg-theme-bg-secondary">
        <PhRobot class="w-8 h-8 text-primary-button mb-2" />
        <h3 class="text-theme-text-primary font-medium">AI Agents</h3>
        <p class="text-theme-text-secondary text-sm">Configure AI agents with custom skills</p>
      </div>
      <div class="p-4 rounded-lg bg-theme-bg-secondary">
        <PhFiles class="w-8 h-8 text-primary-button mb-2" />
        <h3 class="text-theme-text-primary font-medium">Documents</h3>
        <p class="text-theme-text-secondary text-sm">Upload and chat with your documents</p>
      </div>
      <div class="p-4 rounded-lg bg-theme-bg-secondary">
        <PhGear class="w-8 h-8 text-primary-button mb-2" />
        <h3 class="text-theme-text-primary font-medium">Settings</h3>
        <p class="text-theme-text-secondary text-sm">Customize your LLM and embedding preferences</p>
      </div>
    </div>
  </div>
</template>

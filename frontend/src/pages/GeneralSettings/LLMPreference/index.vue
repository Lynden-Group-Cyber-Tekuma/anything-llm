<script setup>
import SettingsLayout from '@/components/SettingsLayout/index.vue'
</script>

<template>
  <SettingsLayout
    title="LLM Preference"
    description="Configure your preferred Large Language Model provider"
  >
    <div class="bg-theme-bg-secondary rounded-lg p-6">
      <p class="text-theme-text-secondary">
        LLM provider configuration interface will be displayed here.
        Choose from providers like OpenAI, Anthropic, Ollama, and more.
      </p>
    </div>
  </SettingsLayout>
</template>

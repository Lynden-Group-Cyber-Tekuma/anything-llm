<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentStep = computed(() => route.params.step || 'home')

const steps = [
  { id: 'home', title: 'Welcome' },
  { id: 'llm-preference', title: 'LLM Provider' },
  { id: 'embedding-preference', title: 'Embedding Provider' },
  { id: 'vector-database', title: 'Vector Database' },
  { id: 'user-setup', title: 'User Setup' },
  { id: 'data-handling', title: 'Data Handling' },
  { id: 'create-workspace', title: 'Create Workspace' }
]

function goToStep(step) {
  router.push(`/onboarding/${step}`)
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-theme-bg-primary flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <h1 class="text-3xl font-bold text-theme-text-primary text-center mb-8">
        Welcome to AnythingLLM
      </h1>

      <!-- Steps indicator -->
      <div class="flex justify-center gap-2 mb-8">
        <div
          v-for="step in steps"
          :key="step.id"
          :class="[
            'w-3 h-3 rounded-full',
            currentStep === step.id ? 'bg-primary-button' : 'bg-theme-bg-secondary'
          ]"
        />
      </div>

      <!-- Content -->
      <div class="bg-theme-bg-secondary rounded-lg p-8">
        <h2 class="text-xl font-semibold text-theme-text-primary mb-4">
          {{ steps.find(s => s.id === currentStep)?.title || 'Setup' }}
        </h2>
        <p class="text-theme-text-secondary mb-6">
          Complete the onboarding steps to configure your AnythingLLM instance.
        </p>

        <div class="flex gap-4">
          <button
            @click="goHome"
            class="px-4 py-2 border border-primary-button text-primary-button rounded hover:bg-primary-button hover:text-white transition-colors"
          >
            Skip for Now
          </button>
          <button
            @click="goHome"
            class="px-4 py-2 bg-primary-button text-white rounded hover:bg-primary-button/80 transition-colors"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

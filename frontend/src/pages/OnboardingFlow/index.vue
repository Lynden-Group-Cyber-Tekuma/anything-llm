<script setup>
import { useRoute } from 'vue-router'
import OnboardingSteps, { OnboardingLayout } from './Steps/index.vue'

const route = useRoute()
const step = route.params.step
const StepComponent = OnboardingSteps[step || 'home']
</script>

<template>
  <template v-if="step === 'home' || !step">
    <component :is="StepComponent" />
  </template>
  <OnboardingLayout v-else v-slot="{ setHeader, setBackBtn, setForwardBtn }">
    <component
      :is="StepComponent"
      :set-header="setHeader"
      :set-back-btn="setBackBtn"
      :set-forward-btn="setForwardBtn"
    />
  </OnboardingLayout>
</template>

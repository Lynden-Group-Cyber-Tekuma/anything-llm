<script setup>
import { computed } from 'vue'
import QuickLinks from './QuickLinks.vue'
import ExploreFeatures from './ExploreFeatures.vue'
import Updates from './Updates.vue'
import Resources from './Resources.vue'
import Checklist from './Checklist.vue'

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
})

const containerStyle = computed(() => ({
  height: isMobile.value ? '100%' : 'calc(100% - 32px)'
}))
</script>

<template>
  <div
    :style="containerStyle"
    class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-container w-full h-full"
  >
    <div class="w-full h-full flex flex-col items-center overflow-y-auto no-scroll">
      <div class="w-full max-w-[1200px] flex flex-col gap-y-[24px] p-4 pt-16 md:p-12 md:pt-11">
        <Checklist />
        <QuickLinks />
        <ExploreFeatures />
        <Updates />
        <Resources />
      </div>
    </div>
  </div>
</template>

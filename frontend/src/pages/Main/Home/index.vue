<script setup>
import QuickLinks from './QuickLinks/index.vue'
import ExploreFeatures from './ExploreFeatures/index.vue'
import Updates from './Updates/index.vue'
import Resources from './Resources/index.vue'
import Checklist from './Checklist/index.vue'
import { isMobile } from 'react-device-detect'
</script>

<template>
  <div
    :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
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

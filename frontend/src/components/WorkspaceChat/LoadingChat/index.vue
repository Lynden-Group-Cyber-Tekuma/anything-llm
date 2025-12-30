<script setup>
import { useDisplay } from '@/composables/useDisplay'

const { isMobile } = useDisplay()
const highlightColor = 'var(--theme-bg-primary)'
const baseColor = 'var(--theme-bg-secondary)'
</script>

<template>
  <div
    class="transition-all duration-500 relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll no-scroll p-4"
    style="height: calc(100% - 32px)"
  >
    <div class="flex justify-start">
      <div
        class="skeleton max-w-full md:max-w-[80%] p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
        :style="{
          height: '100px',
          width: '100%',
          backgroundColor: baseColor,
        }"
      />
    </div>
    <div class="flex justify-end">
      <div
        class="skeleton max-w-full md:max-w-[80%] p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
        :style="{
          height: '100px',
          width: isMobile ? '70%' : '45%',
          backgroundColor: baseColor,
        }"
      />
    </div>
    <div class="flex justify-start">
      <div
        class="skeleton max-w-full md:max-w-[80%] p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
        :style="{
          height: '100px',
          width: isMobile ? '55%' : '30%',
          backgroundColor: baseColor,
        }"
      />
    </div>
    <div class="flex justify-end">
      <div
        class="skeleton max-w-full md:max-w-[80%] p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
        :style="{
          height: '100px',
          width: isMobile ? '88%' : '25%',
          backgroundColor: baseColor,
        }"
      />
    </div>
    <div class="flex justify-start">
      <div
        class="skeleton max-w-full md:max-w-[80%] p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
        :style="{
          height: '160px',
          width: '100%',
          backgroundColor: baseColor,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--theme-bg-secondary) 25%,
    var(--theme-bg-primary) 50%,
    var(--theme-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}
</style>

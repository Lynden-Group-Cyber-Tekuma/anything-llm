<template>
  <div id="workspace-agent-settings-container">
    <div class="w-1/2 flex flex-col gap-y-6">
      <Skeleton
        :height="100"
        width="100%"
        :count="2"
        highlightColor="var(--theme-bg-primary)"
        baseColor="var(--theme-bg-secondary)"
        :enableAnimation="true"
        containerClassName="flex flex-col gap-y-1"
      />
      <div class="bg-white/10 h-[1px] w-full" />
      <Skeleton
        :height="100"
        width="100%"
        :count="2"
        highlightColor="var(--theme-bg-primary)"
        baseColor="var(--theme-bg-secondary)"
        :enableAnimation="true"
        containerClassName="flex flex-col gap-y-1 mt-4"
      />
    </div>
  </div>
</template>

<script setup>
import Skeleton from 'vue-loading-skeleton';
import 'vue-loading-skeleton/dist/style.css';
</script>

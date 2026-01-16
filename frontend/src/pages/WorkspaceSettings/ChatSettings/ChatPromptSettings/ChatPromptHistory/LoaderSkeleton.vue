<template>
  <Skeleton
    height="85px"
    width="100%"
    :highlightColor="highlightColor"
    :baseColor="baseColor"
    :count="8"
  />
</template>

<script setup>
import Skeleton from 'vue-loading-skeleton';
import 'vue-loading-skeleton/dist/style.css';

const highlightColor = 'var(--theme-bg-primary)';
const baseColor = 'var(--theme-bg-secondary)';
</script>

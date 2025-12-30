<script setup>
import RemoteNvidiaNimOptions from './remote.vue'
import ManagedNvidiaNimOptions from './managed.vue'

defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const version = 'remote' // static to "remote" when in docker version.
</script>

<template>
  <RemoteNvidiaNimOptions v-if="version === 'remote'" :settings="settings" />
  <ManagedNvidiaNimOptions v-else :settings="settings" />
</template>

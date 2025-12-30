<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import useUser from '@/composables/useUser'
import paths from '@/utils/paths'
import { ArrowUUpLeft, Wrench } from '@phosphor-icons/vue'

const route = useRoute()
const { user } = useUser()

const isInSettings = computed(() => route.path.startsWith('/settings'))

const shouldShow = computed(() => {
  if (!user.value) return true
  return user.value.role !== 'default'
})
</script>

<template>
  <div v-if="shouldShow" class="flex w-fit">
    <RouterLink
      v-if="isInSettings"
      :to="paths.home()"
      class="transition-all duration-300 p-2 rounded-full bg-theme-sidebar-footer-icon hover:bg-theme-sidebar-footer-icon-hover"
      aria-label="Home"
      title="Back to workspaces"
    >
      <ArrowUUpLeft
        class="h-5 w-5"
        weight="fill"
        color="var(--theme-sidebar-footer-icon-fill)"
      />
    </RouterLink>
    <RouterLink
      v-else
      :to="paths.settings.interface()"
      class="transition-all duration-300 p-2 rounded-full bg-theme-sidebar-footer-icon hover:bg-theme-sidebar-footer-icon-hover"
      aria-label="Settings"
      title="Open settings"
    >
      <Wrench
        class="h-5 w-5"
        weight="fill"
        color="var(--theme-sidebar-footer-icon-fill)"
      />
    </RouterLink>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import paths from '@/utils/paths'
import useUser from '@/composables/useUser'
import useLogo from '@/composables/useLogo'
import Appearance from '@/models/appearance'
import Workspace from '@/models/workspace'
import { LAST_VISITED_WORKSPACE } from '@/utils/constants'
import { safeJsonParse } from '@/utils/request'

const { t } = useI18n()
const { user } = useUser()
const { logo } = useLogo()

const lastVisitedWorkspace = ref(null)
const workspaces = ref([])
const loading = ref(true)

const isMobile = computed(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
const showScrollbar = computed(() => Appearance.getSettings().showScrollbar)
const hasWorkspaces = computed(() => workspaces.value.length > 0)

onMounted(async () => {
  const availableWorkspaces = await Workspace.all()
  const serializedLastVisitedWorkspace = localStorage.getItem(
    LAST_VISITED_WORKSPACE
  )

  if (!serializedLastVisitedWorkspace) {
    workspaces.value = availableWorkspaces
    loading.value = false
    return
  }

  try {
    const lastVisited = safeJsonParse(
      serializedLastVisitedWorkspace,
      null
    )
    if (lastVisited == null) throw new Error('Non-parseable!')
    const isValid = availableWorkspaces.some(
      (ws) => ws.slug === lastVisited?.slug
    )
    if (!isValid) throw new Error('Invalid value!')
    lastVisitedWorkspace.value = lastVisited
  } catch {
    localStorage.removeItem(LAST_VISITED_WORKSPACE)
  } finally {
    workspaces.value = availableWorkspaces
    loading.value = false
  }
})

const containerStyle = computed(() => ({
  height: isMobile.value ? '100%' : 'calc(100% - 32px)'
}))
</script>

<template>
  <div
    :style="containerStyle"
    :class="[
      'relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary light:border-[1px] light:border-theme-sidebar-border w-full h-full overflow-y-scroll',
      showScrollbar ? 'show-scrollbar' : 'no-scroll'
    ]"
  >
    <div v-if="loading" class="w-full h-full flex flex-col items-center justify-center overflow-y-auto no-scroll">
      <!-- Logo skeleton -->
      <div class="w-[140px] h-[140px] mb-5 rounded-lg bg-theme-bg-primary animate-pulse" />
      <!-- Title skeleton -->
      <div class="w-48 h-6 mb-4 rounded bg-theme-bg-primary animate-pulse" />
      <!-- Paragraph skeleton -->
      <div class="w-80 h-4 mb-2 rounded bg-theme-bg-primary animate-pulse" />
      <div class="w-64 h-4 rounded bg-theme-bg-primary animate-pulse" />
      <!-- Button skeleton -->
      <div class="mt-[29px] w-40 h-[34px] rounded-lg bg-theme-bg-primary animate-pulse" />
    </div>

    <div v-else class="w-full h-full flex flex-col items-center justify-center overflow-y-auto no-scroll">
      <img
        :src="logo"
        alt="Custom Logo"
        class="w-[200px] h-fit mb-5 rounded-lg"
      />
      <h1 class="text-white text-2xl font-semibold">
        {{ t('home.welcome') }}, {{ user.username }}!
      </h1>
      <p class="text-theme-home-text-secondary text-base text-center whitespace-pre-line">
        {{ hasWorkspaces ? t('home.chooseWorkspace') : t('home.notAssigned') }}
      </p>
      <RouterLink
        v-if="hasWorkspaces"
        :to="paths.workspace.chat(
          lastVisitedWorkspace?.slug || workspaces[0].slug
        )"
        class="text-sm font-medium mt-[10px] w-fit px-4 h-[34px] flex items-center justify-center rounded-lg cursor-pointer bg-theme-home-button-secondary hover:bg-theme-home-button-secondary-hover text-theme-home-button-secondary-text hover:text-theme-home-button-secondary-hover-text transition-all duration-200"
      >
        {{ t('home.goToWorkspace', {
          workspace: lastVisitedWorkspace?.name || workspaces[0].name,
        }) }}
        &rarr;
      </RouterLink>
    </div>
  </div>
</template>

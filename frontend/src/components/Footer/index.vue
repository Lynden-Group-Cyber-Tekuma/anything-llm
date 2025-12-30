<script setup>
import { ref, onMounted, computed, h } from 'vue'
import System from '@/models/system'
import paths from '@/utils/paths'
import {
  BookOpen,
  DiscordLogo,
  GithubLogo,
  Briefcase,
  Envelope,
  Globe,
  HouseLine,
  Info,
  LinkSimple,
} from '@phosphor-icons/vue'
import SettingsButton from '../SettingsButton/index.vue'

export const MAX_ICONS = 3
export const ICON_COMPONENTS = {
  BookOpen,
  DiscordLogo,
  GithubLogo,
  Envelope,
  LinkSimple,
  HouseLine,
  Globe,
  Briefcase,
  Info,
}

const footerData = ref(false)
const isMobile = computed(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))

onMounted(async () => {
  const { footerData: data } = await System.fetchCustomFooterIcons()
  footerData.value = data
})

const renderIcon = (iconName) => {
  const IconComponent = ICON_COMPONENTS?.[iconName] ?? ICON_COMPONENTS.Info
  return h(IconComponent, {
    weight: 'fill',
    class: 'h-5 w-5',
    color: 'var(--theme-sidebar-footer-icon-fill)',
  })
}
</script>

<template>
  <div v-if="footerData !== false" class="flex justify-center mb-2">
    <div class="flex space-x-4">
      <!-- Default footer icons -->
      <template v-if="!Array.isArray(footerData) || footerData.length === 0">
        <div class="flex w-fit">
          <a
            :href="paths.github()"
            target="_blank"
            rel="noreferrer"
            class="transition-all duration-300 p-2 rounded-full bg-theme-sidebar-footer-icon hover:bg-theme-sidebar-footer-icon-hover"
            aria-label="Find us on GitHub"
            title="View Source Code"
          >
            <GithubLogo
              weight="fill"
              class="h-5 w-5"
              color="var(--theme-sidebar-footer-icon-fill)"
            />
          </a>
        </div>
        <div class="flex w-fit">
          <a
            :href="paths.docs()"
            target="_blank"
            rel="noreferrer"
            class="transition-all duration-300 p-2 rounded-full bg-theme-sidebar-footer-icon hover:bg-theme-sidebar-footer-icon-hover"
            aria-label="Docs"
            title="Open AnythingLLM help docs"
          >
            <BookOpen
              weight="fill"
              class="h-5 w-5"
              color="var(--theme-sidebar-footer-icon-fill)"
            />
          </a>
        </div>
        <div class="flex w-fit">
          <a
            :href="paths.discord()"
            target="_blank"
            rel="noreferrer"
            class="transition-all duration-300 p-2 rounded-full bg-theme-sidebar-footer-icon hover:bg-theme-sidebar-footer-icon-hover"
            aria-label="Join our Discord server"
            title="Join the AnythingLLM Discord"
          >
            <DiscordLogo
              weight="fill"
              class="h-5 w-5"
              color="var(--theme-sidebar-footer-icon-fill)"
            />
          </a>
        </div>
        <SettingsButton v-if="!isMobile" />
      </template>

      <!-- Custom footer icons -->
      <template v-else>
        <a
          v-for="(item, index) in footerData"
          :key="index"
          :href="item.url"
          target="_blank"
          rel="noreferrer"
          class="transition-all duration-300 flex w-fit h-fit p-2 rounded-full bg-theme-sidebar-footer-icon hover:bg-theme-sidebar-footer-icon-hover hover:border-slate-100"
        >
          <component :is="renderIcon(item.icon)" />
        </a>
        <SettingsButton v-if="!isMobile" />
      </template>
    </div>
  </div>
</template>

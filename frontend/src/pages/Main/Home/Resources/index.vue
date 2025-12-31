<script setup>
import { PhBook, PhGithubLogo, PhKeyboard } from '@phosphor-icons/vue'
import { KEYBOARD_SHORTCUTS_HELP_EVENT } from '@/hooks/useKeyboardShortcuts'

const showKeyboardShortcuts = () => {
  window.dispatchEvent(
    new CustomEvent(KEYBOARD_SHORTCUTS_HELP_EVENT, { detail: { show: true } })
  )
}

const resources = [
  {
    title: 'Documentation',
    description: 'Learn how to use AnythingLLM',
    icon: Book,
    href: 'https://docs.anythingllm.com',
    external: true,
  },
  {
    title: 'GitHub',
    description: 'View source code and contribute',
    icon: GithubLogo,
    href: 'https://github.com/Mintplex-Labs/anything-llm',
    external: true,
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'View available keyboard shortcuts',
    icon: Keyboard,
    onClick: showKeyboardShortcuts,
  },
]
</script>

<template>
  <div class="flex flex-col gap-y-4">
    <h2 class="text-lg font-semibold text-theme-text-primary">
      Resources
    </h2>
    <div class="grid grid-cols-1 gap-3">
      <template v-for="resource in resources" :key="resource.title">
        <a
          v-if="resource.external"
          :href="resource.href"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-start gap-x-3 p-3 rounded-lg border border-theme-modal-border hover:border-theme-action-primary/50 hover:bg-theme-bg-secondary/50 transition-all"
        >
          <div class="flex-shrink-0 mt-0.5">
            <component
              :is="resource.icon"
              class="w-5 h-5 text-theme-text-primary group-hover:text-theme-action-primary transition-colors"
              weight="duotone"
            />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-theme-text-primary group-hover:text-theme-action-primary transition-colors">
              {{ resource.title }}
            </h3>
            <p class="text-xs text-theme-text-secondary mt-0.5">
              {{ resource.description }}
            </p>
          </div>
        </a>
        <button
          v-else
          @click="resource.onClick"
          class="group flex items-start gap-x-3 p-3 rounded-lg border border-theme-modal-border hover:border-theme-action-primary/50 hover:bg-theme-bg-secondary/50 transition-all text-left"
        >
          <div class="flex-shrink-0 mt-0.5">
            <component
              :is="resource.icon"
              class="w-5 h-5 text-theme-text-primary group-hover:text-theme-action-primary transition-colors"
              weight="duotone"
            />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-theme-text-primary group-hover:text-theme-action-primary transition-colors">
              {{ resource.title }}
            </h3>
            <p class="text-xs text-theme-text-secondary mt-0.5">
              {{ resource.description }}
            </p>
          </div>
        </button>
      </template>
    </div>
  </div>
</template>

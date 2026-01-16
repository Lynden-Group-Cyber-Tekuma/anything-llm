<script setup>
import { RouterLink } from 'vue-router'
import { PhArrowSquareOut } from '@phosphor-icons/vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  provider: {
    type: Object,
    required: true
  },
  altText: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="flex flex-col items-start gap-y-3 pb-4 border-b border-theme-sidebar-border">
    <div class="text-theme-text-primary text-base font-bold">{{ title }}</div>
    <div class="flex items-start gap-3">
      <img
        :src="provider.logo"
        :alt="altText"
        class="w-8 h-8 rounded flex-shrink-0 mt-0.5"
      />
      <div class="flex flex-col gap-2 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-theme-text-primary text-sm font-semibold">
            {{ provider.name }}
          </span>
        </div>
        <div v-if="provider.policyUrl" class="text-theme-text-secondary text-sm">
          Your usage, chats, and data are subject to the service's
          <RouterLink
            class="text-theme-text-secondary hover:text-theme-text-primary text-sm font-medium underline transition-colors inline-flex items-center gap-1"
            :to="provider.policyUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            privacy policy
            <ArrowSquareOut :size="12" />
          </RouterLink>
          .
        </div>
        <ul v-else-if="provider.description" class="flex flex-col list-none gap-1">
          <li
            v-for="(desc, idx) in provider.description"
            :key="idx"
            class="text-theme-text-secondary text-sm"
          >
            {{ desc }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

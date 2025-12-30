<script setup>
import { computed } from 'vue'
import { usePfpStore } from '@/stores/pfp'
import { storeToRefs } from 'pinia'
import UserDefaultPfp from './user.svg'
import WorkspaceDefaultPfp from './workspace.svg'

const props = defineProps({
  role: {
    type: String,
    required: true
  }
})

const pfpStore = usePfpStore()
const { pfp } = storeToRefs(pfpStore)

const isUser = computed(() => props.role === 'user')
</script>

<template>
  <div class="relative w-[35px] h-[35px] rounded-full flex-shrink-0 overflow-hidden">
    <template v-if="isUser">
      <img
        v-if="pfp"
        :src="pfp"
        alt="User profile picture"
        class="absolute top-0 left-0 w-full h-full object-cover rounded-full border-none"
      />
      <img
        v-else
        :src="UserDefaultPfp"
        alt="User profile picture"
        class="rounded-full border-none"
      />
    </template>
    <img
      v-else
      :src="WorkspaceDefaultPfp"
      alt="system profile picture"
      class="flex items-center justify-center rounded-full border-solid border border-white/40 light:border-theme-sidebar-border light:bg-theme-bg-chat-input"
    />
  </div>
</template>

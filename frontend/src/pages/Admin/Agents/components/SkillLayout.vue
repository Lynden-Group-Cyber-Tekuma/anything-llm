<template>
  <div
    id="workspace-agent-settings-container"
    class="w-screen h-screen overflow-hidden bg-theme-bg-container flex md:mt-0 mt-6"
  >
    <Sidebar />
    <div
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] w-full h-full flex"
    >
      <slot />
      <ContextualSaveBar
        :showing="hasChanges"
        :on-save="handleSubmit"
        :on-cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { isMobile } from 'react-device-detect'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import ContextualSaveBar from '@/components/ContextualSaveBar/index.vue'

defineProps({
  hasChanges: {
    type: Boolean,
    default: false
  },
  handleSubmit: {
    type: Function,
    required: true
  },
  handleCancel: {
    type: Function,
    required: true
  }
})
</script>

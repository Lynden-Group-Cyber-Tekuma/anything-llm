<script setup>
import { useIsAgentSessionActive } from '@/utils/chat/agent'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  setShowing: Function,
  sendCommand: Function
})

const { t } = useI18n()
const isActiveAgentSession = useIsAgentSessionActive()
</script>

<template>
  <button
    v-if="!isActiveAgentSession"
    type="button"
    data-slash-command="/reset"
    @click="() => {
      setShowing(false)
      sendCommand({ text: '/reset', autoSubmit: true })
    }"
    class="border-none w-full hover:cursor-pointer hover:bg-theme-action-menu-item-hover px-2 py-2 rounded-xl flex flex-col justify-start"
  >
    <div class="w-full flex-col text-left flex pointer-events-none">
      <div class="text-white text-sm font-bold">
        {{ t('chat_window.slash_reset') }}
      </div>
      <div class="text-white text-opacity-60 text-sm">
        {{ t('chat_window.preset_reset_description') }}
      </div>
    </div>
  </button>
</template>

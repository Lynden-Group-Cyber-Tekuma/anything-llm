<script setup>
import { useIsAgentSessionActive } from '@/utils/chat/agent'

const props = defineProps({
  setShowing: Function,
  sendCommand: Function
})

const isActiveAgentSession = useIsAgentSessionActive()
</script>

<template>
  <button
    v-if="isActiveAgentSession"
    type="button"
    data-slash-command="/exit"
    @click="() => {
      setShowing(false)
      sendCommand({ text: '/exit', autoSubmit: true })
    }"
    class="border-none w-full hover:cursor-pointer hover:bg-theme-action-menu-item-hover px-2 py-2 rounded-xl flex flex-col justify-start"
  >
    <div class="w-full flex-col text-left flex pointer-events-none">
      <div class="text-white text-sm font-bold">/exit</div>
      <div class="text-white text-opacity-60 text-sm">
        Halt the current agent session.
      </div>
    </div>
  </button>
</template>

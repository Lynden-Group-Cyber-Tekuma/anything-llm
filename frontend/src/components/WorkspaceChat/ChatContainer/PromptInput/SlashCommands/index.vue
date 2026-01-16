<script setup>
import { ref, onMounted, onUnmounted, watch, defineComponent, h } from 'vue'
import SlashCommandIcon from './icons/SlashCommandIcon.vue'
import ResetCommand from './reset.vue'
import EndAgentSession from './endAgentSession.vue'
import SlashPresets from './SlashPresets/index.vue'
import { useI18n } from 'vue-i18n'
import { useSlashCommandKeyboardNavigation } from '@/hooks/useSlashCommandKeyboardNavigation'

const props = defineProps({
  showing: Boolean,
  setShowing: Function,
  sendCommand: Function,
  promptRef: Object
})

const cmdRef = ref(null)
useSlashCommandKeyboardNavigation({ showing: props.showing })

// Handle clicks outside to close
const closeIfOutside = ({ target }) => {
  if (target.id === 'slash-cmd-btn') return
  const isOutside = !cmdRef?.value?.contains(target)
  if (!isOutside) return
  props.setShowing(false)
}

watch(() => props.showing, (newVal) => {
  if (newVal && cmdRef.value) {
    document.addEventListener('click', closeIfOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeIfOutside)
})
</script>

<script>
import { defineComponent, h } from 'vue'
import SlashCommandIcon from './icons/SlashCommandIcon.vue'
import { useI18n } from 'vue-i18n'

// SlashCommandsButton component
export const SlashCommandsButton = defineComponent({
  props: {
    showing: Boolean,
    setShowSlashCommand: Function
  },
  setup(props) {
    const { t } = useI18n()

    return () => h('div', {
      id: 'slash-cmd-btn',
      'data-tooltip-id': 'tooltip-slash-cmd-btn',
      'data-tooltip-content': t('chat_window.slash'),
      onClick: () => props.setShowSlashCommand(!props.showing),
      class: `flex justify-center items-center cursor-pointer ${props.showing ? '!opacity-100' : ''}`
    }, [
      h(SlashCommandIcon, {
        color: 'var(--theme-sidebar-footer-icon-fill)',
        class: 'w-[20px] h-[20px] pointer-events-none opacity-60 hover:opacity-100 light:opacity-100 light:hover:opacity-60'
      })
    ])
  }
})

// useSlashCommands composable
export function useSlashCommands() {
  const showSlashCommand = ref(false)
  const setShowSlashCommand = (value) => { showSlashCommand.value = value }
  return { showSlashCommand, setShowSlashCommand }
}
</script>

<template>
  <div v-show="showing">
    <div class="w-full flex justify-center absolute bottom-[130px] md:bottom-[150px] left-0 z-10 px-4">
      <div
        ref="cmdRef"
        class="w-[600px] bg-theme-action-menu-bg rounded-2xl flex shadow flex-col justify-start items-start gap-2.5 p-2 overflow-y-auto max-h-[300px] no-scroll"
      >
        <ResetCommand :send-command="sendCommand" :set-showing="setShowing" />
        <EndAgentSession :send-command="sendCommand" :set-showing="setShowing" />
        <SlashPresets
          :send-command="sendCommand"
          :set-showing="setShowing"
          :prompt-ref="promptRef"
        />
      </div>
    </div>
  </div>
</template>

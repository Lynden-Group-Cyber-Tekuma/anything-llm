<script setup>
import { ref, onMounted, onUnmounted, watch, defineComponent, h } from 'vue'
import { PhAt } from '@phosphor-icons/vue'
import { useIsAgentSessionActive } from '@/utils/chat/agent'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const props = defineProps({
  showing: Boolean,
  setShowAgents: Function,
  sendCommand: Function,
  promptRef: Object
})

const { t } = useI18n()
const route = useRoute()
const agentSessionActive = useIsAgentSessionActive()
const formRef = ref(null)

// AbilityTag component
const AbilityTag = defineComponent({
  props: {
    text: String
  },
  setup(props) {
    return () => h('div', {
      class: 'px-2 bg-theme-action-menu-item-hover text-theme-text-secondary text-xs w-fit rounded-sm'
    }, [
      h('p', props.text)
    ])
  }
})

// Check URL params to auto-open agent menu
onMounted(() => {
  if (route.query.action === 'set-agent-chat' && !props.showing) {
    handleAgentClick()
  }
})

// Handle clicks outside to close
const closeIfOutside = ({ target }) => {
  if (target.id === 'agent-list-btn') return
  const isOutside = !formRef?.value?.contains(target)
  if (!isOutside) return
  props.setShowAgents(false)
}

watch(() => props.showing, (newVal) => {
  if (newVal && formRef.value) {
    document.addEventListener('click', closeIfOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeIfOutside)
})

const handleAgentClick = () => {
  props.setShowAgents(false)
  props.sendCommand({ text: '@agent ' })
  props.promptRef?.focus()
}
</script>

<script>
import { defineComponent, h } from 'vue'
import { PhAt } from '@phosphor-icons/vue'
import { useIsAgentSessionActive } from '@/utils/chat/agent'
import { useI18n } from 'vue-i18n'

// AvailableAgentsButton component
export const AvailableAgentsButton = defineComponent({
  props: {
    showing: Boolean,
    setShowAgents: Function
  },
  setup(props) {
    const { t } = useI18n()
    const agentSessionActive = useIsAgentSessionActive()

    if (agentSessionActive.value) return () => null

    return () => h('div', {
      id: 'agent-list-btn',
      'data-tooltip-id': 'tooltip-agent-list-btn',
      'data-tooltip-content': t('chat_window.agents'),
      'aria-label': t('chat_window.agents'),
      onClick: () => props.setShowAgents(!props.showing),
      class: `flex justify-center items-center cursor-pointer ${props.showing ? '!opacity-100' : ''}`
    }, [
      h(At, {
        color: 'var(--theme-sidebar-footer-icon-fill)',
        class: 'w-[22px] h-[22px] pointer-events-none text-theme-text-primary opacity-60 hover:opacity-100 light:opacity-100 light:hover:opacity-60'
      })
    ])
  }
})

// useAvailableAgents composable
export function useAvailableAgents() {
  const showAgents = ref(false)
  const setShowAgents = (value) => { showAgents.value = value }
  return { showAgents, setShowAgents }
}
</script>

<template>
  <div v-if="!agentSessionActive" v-show="showing">
    <div class="w-full flex justify-center absolute bottom-[130px] md:bottom-[150px] left-0 z-10 px-4">
      <div
        ref="formRef"
        class="w-[600px] p-2 bg-theme-action-menu-bg rounded-2xl shadow flex-col justify-center items-start gap-2.5 inline-flex"
      >
        <button
          @click="handleAgentClick"
          class="border-none w-full hover:cursor-pointer hover:bg-theme-action-menu-item-hover px-2 py-2 rounded-xl flex flex-col justify-start group"
        >
          <div class="w-full flex-col text-left flex pointer-events-none">
            <div class="text-theme-text-primary text-sm">
              <b>{{ t('chat_window.at_agent') }}</b>
              {{ t('chat_window.default_agent_description') }}
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              <AbilityTag text="rag-search" />
              <AbilityTag text="web-scraping" />
              <AbilityTag text="web-browsing" />
              <AbilityTag text="save-file-to-browser" />
              <AbilityTag text="list-documents" />
              <AbilityTag text="summarize-document" />
              <AbilityTag text="chart-generation" />
            </div>
          </div>
        </button>
        <button
          type="button"
          disabled
          class="w-full rounded-xl flex flex-col justify-start group"
        >
          <div class="w-full flex-col text-center flex pointer-events-none">
            <div class="text-theme-text-secondary text-xs italic">
              {{ t('chat_window.custom_agents_coming_soon') }}
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

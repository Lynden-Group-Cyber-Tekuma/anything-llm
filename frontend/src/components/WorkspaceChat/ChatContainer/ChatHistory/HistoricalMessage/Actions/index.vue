<script setup>
import { ref, defineComponent, h } from 'vue'
import useCopyText from '@/hooks/useCopyText'
import { PhCheck, PhThumbsUp, PhArrowsClockwise, PhCopy } from '@phosphor-icons/vue'
import Workspace from '@/models/workspace'
import { EditMessageAction } from './EditMessage/index.vue'
import RenderMetrics from './RenderMetrics/index.vue'
import ActionMenu from './ActionMenu/index.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  message: String,
  feedbackScore: Boolean,
  chatId: String,
  slug: String,
  isLastMessage: Boolean,
  regenerateMessage: Function,
  forkThread: Function,
  isEditing: Boolean,
  role: String,
  metrics: {
    type: Object,
    default: () => ({})
  },
  alignmentCls: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()
const selectedFeedback = ref(props.feedbackScore)

const handleFeedback = async (newFeedback) => {
  const updatedFeedback =
    selectedFeedback.value === newFeedback ? null : newFeedback
  await Workspace.updateChatFeedback(props.chatId, props.slug, updatedFeedback)
  selectedFeedback.value = updatedFeedback
}

// FeedbackButton component
const FeedbackButton = defineComponent({
  props: {
    isSelected: Boolean,
    handleFeedback: Function,
    tooltipContent: String,
    IconComponent: Object
  },
  setup(props) {
    return () => h('div', { class: 'mt-3 relative' }, [
      h('button', {
        onClick: props.handleFeedback,
        'data-tooltip-id': 'feedback-button',
        'data-tooltip-content': props.tooltipContent,
        class: 'text-zinc-300',
        'aria-label': props.tooltipContent
      }, [
        h(props.IconComponent, {
          color: 'var(--theme-sidebar-footer-icon-fill)',
          size: 20,
          class: 'mb-1',
          weight: props.isSelected ? 'fill' : 'regular'
        })
      ])
    ])
  }
})

// CopyMessage component
const CopyMessage = defineComponent({
  props: {
    message: String
  },
  setup(props) {
    const { copied, copyText } = useCopyText()
    const { t } = useI18n()

    return () => h('div', { class: 'mt-3 relative' }, [
      h('button', {
        onClick: () => copyText(props.message),
        'data-tooltip-id': 'copy-assistant-text',
        'data-tooltip-content': t('chat_window.copy'),
        class: 'text-zinc-300',
        'aria-label': t('chat_window.copy')
      }, [
        copied.value
          ? h(Check, {
              color: 'var(--theme-sidebar-footer-icon-fill)',
              size: 20,
              class: 'mb-1'
            })
          : h(Copy, {
              color: 'var(--theme-sidebar-footer-icon-fill)',
              size: 20,
              class: 'mb-1'
            })
      ])
    ])
  }
})

// RegenerateMessage component
const RegenerateMessage = defineComponent({
  props: {
    regenerateMessage: Function,
    chatId: String
  },
  setup(props) {
    const { t } = useI18n()

    if (!props.chatId) return () => null

    return () => h('div', { class: 'mt-3 relative' }, [
      h('button', {
        onClick: () => props.regenerateMessage(props.chatId),
        'data-tooltip-id': 'regenerate-assistant-text',
        'data-tooltip-content': t('chat_window.regenerate_response'),
        class: 'border-none text-zinc-300',
        'aria-label': t('chat_window.regenerate')
      }, [
        h(ArrowsClockwise, {
          color: 'var(--theme-sidebar-footer-icon-fill)',
          size: 20,
          class: 'mb-1',
          weight: 'fill'
        })
      ])
    ])
  }
})
</script>

<template>
  <div :class="`flex w-full justify-between items-center ${alignmentCls}`">
    <div class="flex justify-start items-center gap-x-[8px]">
      <CopyMessage :message="message" />
      <div class="md:group-hover:opacity-100 transition-all duration-300 md:opacity-0 flex justify-start items-center gap-x-[8px]">
        <EditMessageAction
          :chat-id="chatId"
          :role="role"
          :is-editing="isEditing"
        />
        <RegenerateMessage
          v-if="isLastMessage && !isEditing"
          :regenerate-message="regenerateMessage"
          :slug="slug"
          :chat-id="chatId"
        />
        <FeedbackButton
          v-if="chatId && role !== 'user' && !isEditing"
          :is-selected="selectedFeedback === true"
          :handle-feedback="() => handleFeedback(true)"
          tooltip-id="feedback-button"
          :tooltip-content="t('chat_window.good_response')"
          :icon-component="ThumbsUp"
        />
        <ActionMenu
          :chat-id="chatId"
          :fork-thread="forkThread"
          :is-editing="isEditing"
          :role="role"
        />
      </div>
    </div>
    <RenderMetrics :metrics="metrics" />
  </div>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'
import { Info, Warning } from '@phosphor-icons/vue'
import UserIcon from '@/components/UserIcon/index.vue'
import Actions from './Actions/index.vue'
import renderMarkdown from '@/utils/chat/markdown'
import { userFromStorage } from '@/utils/request'
import Citations from '../Citation/index.vue'
import { v4 } from 'uuid'
import DOMPurify from '@/utils/chat/purify'
import { EditMessageForm, useEditMessage } from './Actions/EditMessage/index.vue'
import { useWatchDeleteMessage } from './Actions/DeleteMessage/index.vue'
import TTSMessage from './Actions/TTSButton/index.vue'
import ThoughtContainer, {
  THOUGHT_REGEX_CLOSE,
  THOUGHT_REGEX_COMPLETE,
  THOUGHT_REGEX_OPEN,
} from '../ThoughtContainer/index.vue'
import paths from '@/utils/paths'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { chatQueryRefusalResponse } from '@/utils/chat'

const props = defineProps({
  uuid: {
    type: String,
    default: () => v4()
  },
  message: String,
  role: String,
  workspace: Object,
  sources: {
    type: Array,
    default: () => []
  },
  attachments: {
    type: Array,
    default: () => []
  },
  error: {
    type: [Boolean, String],
    default: false
  },
  feedbackScore: {
    type: Boolean,
    default: null
  },
  chatId: {
    type: String,
    default: null
  },
  isLastMessage: {
    type: Boolean,
    default: false
  },
  regenerateMessage: Function,
  saveEditedMessage: Function,
  forkThread: Function,
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
const { isEditing } = useEditMessage({ chatId: props.chatId, role: props.role })
const { isDeleted, completeDelete, onEndAnimation } = useWatchDeleteMessage({
  chatId: props.chatId,
  role: props.role,
})

const adjustTextArea = (event) => {
  const element = event.target
  element.style.height = 'auto'
  element.style.height = element.scrollHeight + 'px'
}

const isRefusalMessage = computed(() => {
  return props.role === 'assistant' && props.message === chatQueryRefusalResponse(props.workspace)
})

// ProfileImage component
const ProfileImage = defineComponent({
  props: {
    role: String,
    workspace: Object
  },
  setup(props) {
    if (props.role === 'assistant' && props.workspace?.pfpUrl) {
      return () => h('div', { class: 'relative w-[35px] h-[35px] rounded-full flex-shrink-0 overflow-hidden' }, [
        h('img', {
          src: props.workspace.pfpUrl,
          alt: 'Workspace profile picture',
          class: 'absolute top-0 left-0 w-full h-full object-cover rounded-full bg-white'
        })
      ])
    }

    return () => h(UserIcon, {
      user: {
        uid: props.role === 'user' ? userFromStorage()?.username : props.workspace?.slug
      },
      role: props.role
    })
  }
})

// ChatAttachments component
const ChatAttachments = defineComponent({
  props: {
    attachments: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    if (!props.attachments.length) return () => null

    return () => h('div', { class: 'flex flex-wrap gap-2' },
      props.attachments.map((item) =>
        h('img', {
          key: item.name,
          src: item.contentString,
          class: 'max-w-[300px] rounded-md'
        })
      )
    )
  }
})

// RenderChatContent component
const RenderChatContent = defineComponent({
  props: {
    role: String,
    message: String,
    expanded: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // If the message is not from the assistant, we can render it directly
    // as normal since the user cannot think (lol)
    if (props.role !== 'assistant') {
      return () => h('span', {
        class: 'flex flex-col gap-y-1',
        innerHTML: DOMPurify.sanitize(renderMarkdown(props.message))
      })
    }

    return () => {
      let thoughtChain = null
      let msgToRender = props.message
      if (!props.message) return null

      // If the message is a perfect thought chain, we can render it directly
      // Complete == open and close tags match perfectly.
      if (props.message.match(THOUGHT_REGEX_COMPLETE)) {
        thoughtChain = props.message.match(THOUGHT_REGEX_COMPLETE)?.[0]
        msgToRender = props.message.replace(THOUGHT_REGEX_COMPLETE, '')
      }

      // If the message is a thought chain but not a complete thought chain (matching opening tags but not closing tags),
      // we can render it as a thought chain if we can at least find a closing tag
      // This can occur when the assistant starts with <thinking> and then <response>'s later.
      if (
        props.message.match(THOUGHT_REGEX_OPEN) &&
        props.message.match(THOUGHT_REGEX_CLOSE)
      ) {
        const closingTag = props.message.match(THOUGHT_REGEX_CLOSE)?.[0]
        const splitMessage = props.message.split(closingTag)
        thoughtChain = splitMessage[0] + closingTag
        msgToRender = splitMessage[1]
      }

      return h('div', {}, [
        thoughtChain ? h(ThoughtContainer, { content: thoughtChain, expanded: props.expanded }) : null,
        h('span', {
          class: 'flex flex-col gap-y-1',
          innerHTML: DOMPurify.sanitize(renderMarkdown(msgToRender))
        })
      ])
    }
  }
})
</script>

<template>
  <!-- Error state -->
  <div
    v-if="!!error"
    :key="uuid"
    class="flex justify-center items-end w-full bg-theme-bg-chat"
  >
    <div class="py-8 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col">
      <div :class="`flex gap-x-5 ${alignmentCls}`">
        <ProfileImage :role="role" :workspace="workspace" />
        <div class="p-2 rounded-lg bg-red-50 text-red-500">
          <span class="inline-block">
            <Warning class="h-4 w-4 mb-1 inline-block" /> Could not
            respond to message.
          </span>
          <p class="text-xs font-mono mt-2 border-l-2 border-red-300 pl-2 bg-red-200 p-2 rounded-sm">
            {{ error }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Normal message -->
  <div
    v-else-if="!completeDelete"
    :key="uuid"
    @animationend="onEndAnimation"
    :class="`${
      isDeleted ? 'animate-remove' : ''
    } flex justify-center items-end w-full group bg-theme-bg-chat`"
  >
    <div class="py-8 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col">
      <div :class="`flex gap-x-5 ${alignmentCls}`">
        <div class="flex flex-col items-center">
          <ProfileImage :role="role" :workspace="workspace" />
          <div class="mt-1 -mb-10">
            <TTSMessage
              v-if="role === 'assistant'"
              :slug="workspace?.slug"
              :chat-id="chatId"
              :message="message"
            />
          </div>
        </div>
        <EditMessageForm
          v-if="isEditing"
          :role="role"
          :chat-id="chatId"
          :message="message"
          :attachments="attachments"
          :adjust-text-area="adjustTextArea"
          :save-changes="saveEditedMessage"
        />
        <div v-else class="break-words">
          <RenderChatContent
            :role="role"
            :message="message"
            :expanded="isLastMessage"
          />
          <RouterLink
            v-if="isRefusalMessage"
            data-tooltip-id="query-refusal-info"
            :data-tooltip-content="`${t('chat.refusal.tooltip-description')}`"
            class="!no-underline group !flex w-fit"
            :to="paths.chatModes()"
            target="_blank"
          >
            <div class="flex flex-row items-center gap-x-1 group-hover:opacity-100 opacity-60 w-fit">
              <Info class="text-theme-text-secondary" />
              <p class="!m-0 !p-0 text-theme-text-secondary !no-underline text-xs cursor-pointer">
                {{ t('chat.refusal.tooltip-title') }}
              </p>
            </div>
          </RouterLink>
          <ChatAttachments :attachments="attachments" />
        </div>
      </div>
      <div class="flex gap-x-5 ml-14">
        <Actions
          :message="message"
          :feedback-score="feedbackScore"
          :chat-id="chatId"
          :slug="workspace?.slug"
          :is-last-message="isLastMessage"
          :regenerate-message="regenerateMessage"
          :is-editing="isEditing"
          :role="role"
          :fork-thread="forkThread"
          :metrics="metrics"
          :alignment-cls="alignmentCls"
        />
      </div>
      <Citations v-if="role === 'assistant'" :sources="sources" />
    </div>
  </div>
</template>

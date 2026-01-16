<script setup>
import { ref, watch, defineComponent, h } from 'vue'
import { PhWarning } from '@phosphor-icons/vue'
import UserIcon from '@/components/UserIcon/index.vue'
import renderMarkdown from '@/utils/chat/markdown'
import Citations from '../Citation/index.vue'
import ThoughtContainer, {
  THOUGHT_REGEX_CLOSE,
  THOUGHT_REGEX_COMPLETE,
  THOUGHT_REGEX_OPEN,
} from '../ThoughtContainer/index.vue'

const props = defineProps({
  uuid: String,
  reply: String,
  pending: Boolean,
  error: String,
  workspace: Object,
  sources: {
    type: Array,
    default: () => []
  },
  closed: {
    type: Boolean,
    default: true
  }
})

const assistantBackgroundColor = 'bg-theme-bg-chat'

// WorkspaceProfileImage component
export const WorkspaceProfileImage = defineComponent({
  props: {
    workspace: Object
  },
  setup(props) {
    if (!!props.workspace?.pfpUrl) {
      return () => h('div', { class: 'relative w-[35px] h-[35px] rounded-full flex-shrink-0 overflow-hidden' }, [
        h('img', {
          src: props.workspace.pfpUrl,
          alt: 'Workspace profile picture',
          class: 'absolute top-0 left-0 w-full h-full object-cover rounded-full bg-white'
        })
      ])
    }

    return () => h(UserIcon, { user: { uid: props.workspace?.slug }, role: 'assistant' })
  }
})

// RenderAssistantChatContent component
const RenderAssistantChatContent = defineComponent({
  props: {
    message: String
  },
  setup(props) {
    const contentRef = ref('')
    const thoughtChainRef = ref(null)

    watch(() => props.message, (message) => {
      const thinking =
        message.match(THOUGHT_REGEX_OPEN) && !message.match(THOUGHT_REGEX_CLOSE)

      if (thinking && thoughtChainRef.value) {
        thoughtChainRef.value.updateContent(message)
        return
      }

      const completeThoughtChain = message.match(THOUGHT_REGEX_COMPLETE)?.[0]
      const msgToRender = message.replace(THOUGHT_REGEX_COMPLETE, '')

      if (completeThoughtChain && thoughtChainRef.value) {
        thoughtChainRef.value.updateContent(completeThoughtChain)
      }

      contentRef.value = msgToRender
    }, { immediate: true })

    return () => {
      const thinking =
        props.message.match(THOUGHT_REGEX_OPEN) && !props.message.match(THOUGHT_REGEX_CLOSE)

      if (thinking) {
        return h(ThoughtContainer, { ref: thoughtChainRef, content: '', expanded: true })
      }

      return h('div', { class: 'flex flex-col gap-y-1' }, [
        props.message.match(THOUGHT_REGEX_COMPLETE)
          ? h(ThoughtContainer, { ref: thoughtChainRef, content: '', expanded: true })
          : null,
        h('span', {
          class: 'break-words',
          innerHTML: renderMarkdown(contentRef.value)
        })
      ])
    }
  }
})
</script>

<template>
  <div v-if="!reply && sources.length === 0 && !pending && !error"></div>

  <div
    v-else-if="pending"
    :class="`flex justify-center items-end w-full ${assistantBackgroundColor}`"
  >
    <div class="py-6 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col">
      <div class="flex gap-x-5">
        <WorkspaceProfileImage :workspace="workspace" />
        <div class="mt-3 ml-5 dot-falling light:invert"></div>
      </div>
    </div>
  </div>

  <div
    v-else-if="error"
    :class="`flex justify-center items-end w-full ${assistantBackgroundColor}`"
  >
    <div class="py-6 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col">
      <div class="flex gap-x-5">
        <WorkspaceProfileImage :workspace="workspace" />
        <span class="inline-block p-2 rounded-lg bg-red-50 text-red-500">
          <Warning class="h-4 w-4 mb-1 inline-block" /> Could not
          respond to message.
          <span class="text-xs">Reason: {{ error || 'unknown' }}</span>
        </span>
      </div>
    </div>
  </div>

  <div
    v-else
    :key="uuid"
    :class="`flex justify-center items-end w-full ${assistantBackgroundColor}`"
  >
    <div class="py-8 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col">
      <div class="flex gap-x-5">
        <WorkspaceProfileImage :workspace="workspace" />
        <RenderAssistantChatContent
          :key="`${uuid}-prompt-reply-content`"
          :message="reply"
        />
      </div>
      <Citations :sources="sources" />
    </div>
  </div>
</template>

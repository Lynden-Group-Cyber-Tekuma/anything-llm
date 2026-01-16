<script setup>
import { ref, onMounted, watch, inject } from 'vue'
import ChatHistory from './ChatHistory/index.vue'
import { CLEAR_ATTACHMENTS_EVENT, DndUploaderContextKey } from './DnDWrapper'
import PromptInput, {
  PROMPT_INPUT_EVENT,
  PROMPT_INPUT_ID,
} from './PromptInput/index.vue'
import Workspace from '@/models/workspace'
import handleChat, { ABORT_STREAM_EVENT } from '@/utils/chat'
import { isMobile } from 'react-device-detect'
import { SidebarMobileHeader } from '../../Sidebar'
import { useRoute } from 'vue-router'
import { v4 } from 'uuid'
import handleSocketResponse, {
  websocketURI,
  AGENT_SESSION_END,
  AGENT_SESSION_START,
} from '@/utils/chat/agent'
import DnDFileUploaderWrapper from './DnDWrapper'
import SpeechRecognition from 'react-speech-recognition'
import { ChatTooltips } from './ChatTooltips'
import { MetricsProvider } from './ChatHistory/HistoricalMessage/Actions/RenderMetrics/index.vue'

const props = defineProps({
  workspace: Object,
  knownHistory: {
    type: Array,
    default: () => []
  }
})

const route = useRoute()
const threadSlug = route.params.threadSlug || null

const message = ref('')
const loadingResponse = ref(false)
const chatHistory = ref(props.knownHistory)
const socketId = ref(null)
const websocket = ref(null)
const { files, parseAttachments } = inject(DndUploaderContextKey)

// Maintain state of message from whatever is in PromptInput
const handleMessageChange = (event) => {
  message.value = event.target.value
}

// Speech recognition state (using React library for now)
// TODO: Replace with Vue-compatible speech recognition
const listening = ref(false)
const resetTranscript = () => {}

function setMessageEmit(messageContent = '', writeMode = 'replace') {
  if (writeMode === 'append') message.value = message.value + messageContent
  else message.value = messageContent ?? ''

  // Push the update to the PromptInput component
  window.dispatchEvent(
    new CustomEvent(PROMPT_INPUT_EVENT, {
      detail: { messageContent, writeMode },
    })
  )
}

const handleSubmit = async (event) => {
  event.preventDefault()
  if (!message.value || message.value === '') return false
  const prevChatHistory = [
    ...chatHistory.value,
    {
      content: message.value,
      role: 'user',
      attachments: parseAttachments(),
    },
    {
      content: '',
      role: 'assistant',
      pending: true,
      userMessage: message.value,
      animate: true,
    },
  ]

  if (listening.value) {
    endSTTSession()
  }
  chatHistory.value = prevChatHistory
  setMessageEmit('')
  loadingResponse.value = true
}

function endSTTSession() {
  if (typeof SpeechRecognition !== 'undefined') {
    SpeechRecognition.stopListening()
  }
  resetTranscript()
}

const regenerateAssistantMessage = (chatId) => {
  const updatedHistory = chatHistory.value.slice(0, -1)
  const lastUserMessage = updatedHistory.slice(-1)[0]
  Workspace.deleteChats(props.workspace.slug, [chatId])
    .then(() =>
      sendCommand({
        text: lastUserMessage.content,
        autoSubmit: true,
        history: updatedHistory,
        attachments: lastUserMessage?.attachments,
      })
    )
    .catch((e) => console.error(e))
}

const sendCommand = async ({
  text = '',
  autoSubmit = false,
  history = [],
  attachments = [],
  writeMode = 'replace',
} = {}) => {
  if (!autoSubmit) {
    setMessageEmit(text, writeMode)
    return
  }

  if (writeMode === 'append') {
    const currentText = document.getElementById(PROMPT_INPUT_ID)?.value
    text = currentText + text
  }

  if (!text || text === '') return false

  let prevChatHistory
  if (history.length > 0) {
    prevChatHistory = [
      ...history,
      {
        content: '',
        role: 'assistant',
        pending: true,
        userMessage: text,
        attachments,
        animate: true,
      },
    ]
  } else {
    prevChatHistory = [
      ...chatHistory.value,
      {
        content: text,
        role: 'user',
        attachments,
      },
      {
        content: '',
        role: 'assistant',
        pending: true,
        userMessage: text,
        animate: true,
      },
    ]
  }

  chatHistory.value = prevChatHistory
  setMessageEmit('')
  loadingResponse.value = true
}

watch([loadingResponse, chatHistory, () => props.workspace], async () => {
  if (loadingResponse.value !== true) return

  const promptMessage =
    chatHistory.value.length > 0 ? chatHistory.value[chatHistory.value.length - 1] : null
  const remHistory = chatHistory.value.length > 0 ? chatHistory.value.slice(0, -1) : []
  var _chatHistory = [...remHistory]

  // Override hook for new messages to now go to agents until the connection closes
  if (!!websocket.value) {
    if (!promptMessage || !promptMessage?.userMessage) return false
    window.dispatchEvent(new CustomEvent(CLEAR_ATTACHMENTS_EVENT))
    websocket.value.send(
      JSON.stringify({
        type: 'awaitingFeedback',
        feedback: promptMessage?.userMessage,
      })
    )
    return
  }

  if (!promptMessage || !promptMessage?.userMessage) return false

  const attachments = promptMessage?.attachments ?? parseAttachments()
  window.dispatchEvent(new CustomEvent(CLEAR_ATTACHMENTS_EVENT))

  await Workspace.multiplexStream({
    workspaceSlug: props.workspace.slug,
    threadSlug,
    prompt: promptMessage.userMessage,
    chatHandler: (chatResult) =>
      handleChat(
        chatResult,
        (val) => { loadingResponse.value = val },
        (val) => { chatHistory.value = val },
        remHistory,
        _chatHistory,
        (val) => { socketId.value = val }
      ),
    attachments,
  })
})

watch(socketId, () => {
  function handleWSS() {
    try {
      if (!socketId.value || !!websocket.value) return
      const socket = new WebSocket(
        `${websocketURI()}/api/agent-invocation/${socketId.value}`
      )
      socket.supportsAgentStreaming = false

      window.addEventListener(ABORT_STREAM_EVENT, () => {
        window.dispatchEvent(new CustomEvent(AGENT_SESSION_END))
        websocket.value.close()
      })

      socket.addEventListener('message', (event) => {
        loadingResponse.value = true
        try {
          handleSocketResponse(socket, event, (val) => { chatHistory.value = val })
        } catch (e) {
          console.error('Failed to parse data')
          window.dispatchEvent(new CustomEvent(AGENT_SESSION_END))
          socket.close()
        }
        loadingResponse.value = false
      })

      socket.addEventListener('close', (_event) => {
        window.dispatchEvent(new CustomEvent(AGENT_SESSION_END))
        chatHistory.value = [
          ...chatHistory.value.filter((msg) => !!msg.content),
          {
            uuid: v4(),
            type: 'statusResponse',
            content: 'Agent session complete.',
            role: 'assistant',
            sources: [],
            closed: true,
            error: null,
            animate: false,
            pending: false,
          },
        ]
        loadingResponse.value = false
        websocket.value = null
        socketId.value = null
      })
      websocket.value = socket
      window.dispatchEvent(new CustomEvent(AGENT_SESSION_START))
      window.dispatchEvent(new CustomEvent(CLEAR_ATTACHMENTS_EVENT))
    } catch (e) {
      chatHistory.value = [
        ...chatHistory.value.filter((msg) => !!msg.content),
        {
          uuid: v4(),
          type: 'abort',
          content: e.message,
          role: 'assistant',
          sources: [],
          closed: true,
          error: e.message,
          animate: false,
          pending: false,
        },
      ]
      loadingResponse.value = false
      websocket.value = null
      socketId.value = null
    }
  }
  handleWSS()
})
</script>

<template>
  <div
    :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
    class="transition-all duration-500 relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll no-scroll z-[2]"
  >
    <SidebarMobileHeader v-if="isMobile" />
    <DnDFileUploaderWrapper>
      <MetricsProvider>
        <ChatHistory
          :history="chatHistory"
          :workspace="workspace"
          :send-command="sendCommand"
          :update-history="(val) => { chatHistory = val }"
          :regenerate-assistant-message="regenerateAssistantMessage"
          :has-attachments="files.length > 0"
        />
      </MetricsProvider>
      <PromptInput
        :submit="handleSubmit"
        :on-change="handleMessageChange"
        :is-streaming="loadingResponse"
        :send-command="sendCommand"
        :attachments="files"
      />
    </DnDFileUploaderWrapper>
    <ChatTooltips />
  </div>
</template>

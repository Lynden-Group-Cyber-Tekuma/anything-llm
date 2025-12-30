<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { SlashCommandsButton, SlashCommands, useSlashCommands } from './SlashCommands/index.vue'
import debounce from 'lodash.debounce'
import { PaperPlaneRight } from '@phosphor-icons/vue'
import StopGenerationButton from './StopGenerationButton/index.vue'
import { AvailableAgentsButton, AvailableAgents, useAvailableAgents } from './AgentMenu/index.vue'
import TextSizeButton from './TextSizeMenu/index.vue'
import LLMSelectorAction from './LLMSelector/action.vue'
import SpeechToText from './SpeechToText/index.vue'
import AttachmentManager from './Attachments/index.vue'
import AttachItem from './AttachItem/index.vue'
import {
  ATTACHMENTS_PROCESSED_EVENT,
  ATTACHMENTS_PROCESSING_EVENT,
  PASTE_ATTACHMENT_EVENT,
} from '../DnDWrapper'
import useTextSize from '@/hooks/useTextSize'
import { useI18n } from 'vue-i18n'
import Appearance from '@/models/appearance'
import usePromptInputStorage from '@/hooks/usePromptInputStorage'

export const PROMPT_INPUT_ID = 'primary-prompt-input'
export const PROMPT_INPUT_EVENT = 'set_prompt_input'
const MAX_EDIT_STACK_SIZE = 100

const props = defineProps({
  submit: Function,
  onChange: Function,
  isStreaming: Boolean,
  sendCommand: Function,
  attachments: {
    type: Array,
    default: () => []
  }
})

const { t } = useI18n()
const { isDisabled } = useIsDisabled()
const promptInput = ref('')
const { showAgents, setShowAgents } = useAvailableAgents()
const { showSlashCommand, setShowSlashCommand } = useSlashCommands()
const formRef = ref(null)
const textareaRef = ref(null)
const focused = ref(false)
const undoStack = ref([])
const redoStack = ref([])
const { textSizeClass } = useTextSize()

// Synchronizes prompt input value with localStorage, scoped to the current thread
usePromptInputStorage({
  onChange: props.onChange,
  promptInput,
  setPromptInput: (val) => { promptInput.value = val },
})

function handlePromptUpdate(e) {
  const { messageContent, writeMode = 'replace' } = e?.detail ?? {}
  if (writeMode === 'append') promptInput.value = promptInput.value + messageContent
  else promptInput.value = messageContent ?? ''
}

onMounted(() => {
  if (!!window)
    window.addEventListener(PROMPT_INPUT_EVENT, handlePromptUpdate)
})

onUnmounted(() => {
  window?.removeEventListener(PROMPT_INPUT_EVENT, handlePromptUpdate)
})

watch(() => props.isStreaming, (newVal) => {
  if (!newVal && textareaRef.value) textareaRef.value.focus()
  resetTextAreaHeight()
})

function saveCurrentState(adjustment = 0) {
  if (undoStack.value.length >= MAX_EDIT_STACK_SIZE)
    undoStack.value.shift()
  undoStack.value.push({
    value: promptInput.value,
    cursorPositionStart: textareaRef.value.selectionStart + adjustment,
    cursorPositionEnd: textareaRef.value.selectionEnd + adjustment,
  })
}
const debouncedSaveState = debounce(saveCurrentState, 250)

function handleSubmit(e) {
  focused.value = false
  props.submit(e)
}

function resetTextAreaHeight() {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
}

function checkForSlash(e) {
  const input = e.target.value
  if (input === '/') setShowSlashCommand(true)
  if (showSlashCommand.value) setShowSlashCommand(false)
  return
}
const watchForSlash = debounce(checkForSlash, 300)

function checkForAt(e) {
  const input = e.target.value
  if (input === '@') return setShowAgents(true)
  if (showAgents.value) return setShowAgents(false)
}
const watchForAt = debounce(checkForAt, 300)

function captureEnterOrUndo(event) {
  // Is simple enter key press w/o shift key
  if (event.keyCode === 13 && !event.shiftKey) {
    event.preventDefault()
    if (props.isStreaming || isDisabled.value) return
    return props.submit(event)
  }

  // Is undo with Ctrl+Z or Cmd+Z + Shift key = Redo
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === 'z' &&
    event.shiftKey
  ) {
    event.preventDefault()
    if (redoStack.value.length === 0) return

    const nextState = redoStack.value.pop()
    if (!nextState) return

    undoStack.value.push({
      value: promptInput.value,
      cursorPositionStart: textareaRef.value.selectionStart,
      cursorPositionEnd: textareaRef.value.selectionEnd,
    })
    promptInput.value = nextState.value
    setTimeout(() => {
      textareaRef.value.setSelectionRange(
        nextState.cursorPositionStart,
        nextState.cursorPositionEnd
      )
    }, 0)
  }

  // Undo with Ctrl+Z or Cmd+Z
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === 'z' &&
    !event.shiftKey
  ) {
    if (undoStack.value.length === 0) return
    const lastState = undoStack.value.pop()
    if (!lastState) return

    redoStack.value.push({
      value: promptInput.value,
      cursorPositionStart: textareaRef.value.selectionStart,
      cursorPositionEnd: textareaRef.value.selectionEnd,
    })
    promptInput.value = lastState.value
    setTimeout(() => {
      textareaRef.value.setSelectionRange(
        lastState.cursorPositionStart,
        lastState.cursorPositionEnd
      )
    }, 0)
  }
}

function adjustTextArea(event) {
  const element = event.target
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

function handlePasteEvent(e) {
  e.preventDefault()
  if (e.clipboardData.items.length === 0) return false

  // paste any clipboard items that are images
  for (const item of e.clipboardData.items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      window.dispatchEvent(
        new CustomEvent(PASTE_ATTACHMENT_EVENT, {
          detail: { files: [file] },
        })
      )
      continue
    }

    // handle files specifically that are not images as uploads
    if (item.kind === 'file') {
      const file = item.getAsFile()
      window.dispatchEvent(
        new CustomEvent(PASTE_ATTACHMENT_EVENT, {
          detail: { files: [file] },
        })
      )
      continue
    }
  }

  const pasteText = e.clipboardData.getData('text/plain')
  if (pasteText) {
    const textarea = textareaRef.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newPromptInput =
      promptInput.value.substring(0, start) +
      pasteText +
      promptInput.value.substring(end)
    promptInput.value = newPromptInput
    props.onChange({ target: { value: newPromptInput } })

    // Set the cursor position after the pasted text
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + pasteText.length
      adjustTextArea({ target: textarea })
    }, 0)
  }
  return
}

function handleChange(e) {
  debouncedSaveState(-1)
  props.onChange(e)
  watchForSlash(e)
  watchForAt(e)
  adjustTextArea(e)
  promptInput.value = e.target.value
}
</script>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ATTACHMENTS_PROCESSED_EVENT,
  ATTACHMENTS_PROCESSING_EVENT,
} from '../DnDWrapper'

// useIsDisabled composable
function useIsDisabled() {
  const isDisabled = ref(false)

  onMounted(() => {
    if (!window) return
    window.addEventListener(ATTACHMENTS_PROCESSING_EVENT, () => {
      isDisabled.value = true
    })
    window.addEventListener(ATTACHMENTS_PROCESSED_EVENT, () => {
      isDisabled.value = false
    })
  })

  onUnmounted(() => {
    window?.removeEventListener(ATTACHMENTS_PROCESSING_EVENT, () => {
      isDisabled.value = true
    })
    window?.removeEventListener(ATTACHMENTS_PROCESSED_EVENT, () => {
      isDisabled.value = false
    })
  })

  return { isDisabled }
}
</script>

<template>
  <div class="w-full fixed md:absolute bottom-0 left-0 z-10 md:z-0 flex justify-center items-center pwa:pb-5">
    <SlashCommands
      :showing="showSlashCommand"
      :set-showing="setShowSlashCommand"
      :send-command="sendCommand"
      :prompt-ref="textareaRef"
    />
    <AvailableAgents
      :showing="showAgents"
      :set-showing="setShowAgents"
      :send-command="sendCommand"
      :prompt-ref="textareaRef"
    />
    <form
      @submit="handleSubmit"
      class="flex flex-col gap-y-1 rounded-t-lg md:w-3/4 w-full mx-auto max-w-xl items-center"
    >
      <div class="flex items-center rounded-lg md:mb-4 md:w-full">
        <div class="w-[95vw] md:w-[635px] bg-theme-bg-chat-input light:bg-white light:border-solid light:border-[1px] light:border-theme-chat-input-border shadow-sm rounded-2xl pwa:rounded-3xl flex flex-col px-2 overflow-hidden">
          <AttachmentManager :attachments="attachments" />
          <div class="flex items-center border-b border-theme-chat-input-border mx-3">
            <textarea
              :id="PROMPT_INPUT_ID"
              ref="textareaRef"
              @input="handleChange"
              @keydown="captureEnterOrUndo"
              @paste="(e) => {
                saveCurrentState()
                handlePasteEvent(e)
              }"
              required
              @focus="() => { focused = true }"
              @blur="(e) => {
                focused = false
                adjustTextArea(e)
              }"
              v-model="promptInput"
              :spellcheck="Appearance.get('enableSpellCheck')"
              :class="`border-none cursor-text max-h-[50vh] md:max-h-[350px] md:min-h-[40px] mx-2 md:mx-0 pt-[12px] w-full leading-5 text-white bg-transparent placeholder:text-white/60 light:placeholder:text-theme-text-primary resize-none active:outline-none focus:outline-none flex-grow mb-1 pwa:!text-[16px] ${textSizeClass}`"
              :placeholder="t('chat_window.send_message')"
            />
            <StopGenerationButton v-if="isStreaming" />
            <template v-else>
              <button
                ref="formRef"
                type="submit"
                :disabled="isDisabled"
                class="border-none inline-flex justify-center rounded-2xl cursor-pointer opacity-60 hover:opacity-100 light:opacity-100 light:hover:opacity-60 ml-4 disabled:cursor-not-allowed group"
                data-tooltip-id="send-prompt"
                :data-tooltip-content="
                  isDisabled
                    ? t('chat_window.attachments_processing')
                    : t('chat_window.send')
                "
                :aria-label="t('chat_window.send')"
              >
                <PaperPlaneRight
                  color="var(--theme-sidebar-footer-icon-fill)"
                  class="w-[22px] h-[22px] pointer-events-none text-theme-text-primary group-disabled:opacity-[25%]"
                  weight="fill"
                />
                <span class="sr-only">Send message</span>
              </button>
            </template>
          </div>
          <div class="flex justify-between py-3.5 mx-3 mb-1">
            <div class="flex gap-x-2">
              <AttachItem />
              <SlashCommandsButton
                :showing="showSlashCommand"
                :set-show-slash-command="setShowSlashCommand"
              />
              <AvailableAgentsButton
                :showing="showAgents"
                :set-show-agents="setShowAgents"
              />
              <TextSizeButton />
              <LLMSelectorAction />
            </div>
            <div class="flex gap-x-2">
              <SpeechToText :send-command="sendCommand" />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

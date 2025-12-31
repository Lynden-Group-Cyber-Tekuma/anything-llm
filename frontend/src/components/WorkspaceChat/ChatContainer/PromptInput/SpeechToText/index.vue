<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { PhMicrophone } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'
import Appearance from '@/models/appearance'

// NOTE: This component requires a Vue alternative to react-speech-recognition
// Consider using: @capacitor/speech-recognition, vue-speech-recognition, or native Web Speech API

const props = defineProps({
  sendCommand: Function
})

const { t } = useI18n()
const previousTranscript = ref('')
const transcript = ref('')
const listening = ref(false)
const browserSupportsSpeechRecognition = ref(false)
const browserSupportsContinuousListening = ref(false)
const isMicrophoneAvailable = ref(false)
let timeout = null
let recognition = null

const SILENCE_INTERVAL = 3200 // wait in seconds of silence before closing
const PROMPT_INPUT_EVENT = 'prompt-input'

// Initialize Speech Recognition
onMounted(() => {
  // Check for Web Speech API support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    browserSupportsSpeechRecognition.value = false
    return
  }

  browserSupportsSpeechRecognition.value = true
  recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = window?.navigator?.language ?? 'en-US'

  // Check for continuous listening support
  browserSupportsContinuousListening.value = 'continuous' in recognition

  // Check microphone availability
  navigator.mediaDevices?.getUserMedia({ audio: true })
    .then(() => { isMicrophoneAvailable.value = true })
    .catch(() => { isMicrophoneAvailable.value = false })

  // Set up event handlers
  recognition.onresult = (event) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcriptPiece = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcriptPiece
      } else {
        interimTranscript += transcriptPiece
      }
    }

    transcript.value = finalTranscript || interimTranscript
  }

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    if (event.error === 'not-allowed') {
      isMicrophoneAvailable.value = false
    }
  }

  recognition.onend = () => {
    listening.value = false
  }

  // Keyboard shortcut (CTRL + M)
  document.addEventListener('keydown', handleKeyPress)
  window.addEventListener(PROMPT_INPUT_EVENT, handlePromptUpdate)
})

onUnmounted(() => {
  if (recognition) {
    recognition.stop()
  }
  document.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener(PROMPT_INPUT_EVENT, handlePromptUpdate)
  clearTimeout(timeout)
})

function startSTTSession() {
  if (!isMicrophoneAvailable.value) {
    alert(
      'AnythingLLM does not have access to microphone. Please enable for this site to use this feature.'
    )
    return
  }

  transcript.value = ''
  previousTranscript.value = ''
  listening.value = true
  recognition.start()
}

function endSTTSession() {
  recognition.stop()
  listening.value = false

  // If auto submit is enabled, send an empty string to submit
  if (Appearance.get('autoSubmitSttInput')) {
    props.sendCommand({
      text: '',
      autoSubmit: true,
      writeMode: 'append',
    })
  }

  transcript.value = ''
  previousTranscript.value = ''
  clearTimeout(timeout)
}

function handleKeyPress(event) {
  // CTRL + m to toggle STT listening
  if (event.ctrlKey && event.keyCode === 77) {
    if (listening.value) {
      endSTTSession()
    } else {
      startSTTSession()
    }
  }
}

function handlePromptUpdate(e) {
  if (!e?.detail && timeout) {
    endSTTSession()
    clearTimeout(timeout)
  }
}

// Watch transcript changes
watch(transcript, (newTranscript) => {
  if (newTranscript?.length > 0 && listening.value) {
    const previousText = previousTranscript.value
    const newContent = newTranscript.slice(previousText.length)

    // Stream just the diff of the new content
    if (newContent.length > 0) {
      props.sendCommand({ text: newContent, writeMode: 'append' })
    }

    previousTranscript.value = newTranscript
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      endSTTSession()
    }, SILENCE_INTERVAL)
  }
})
</script>

<template>
  <div
    v-if="browserSupportsSpeechRecognition"
    data-tooltip-id="tooltip-microphone-btn"
    :data-tooltip-content="`${t('chat_window.microphone')} (CTRL + M)`"
    :aria-label="t('chat_window.microphone')"
    @click="listening ? endSTTSession() : startSTTSession()"
    :class="`border-none relative flex justify-center items-center opacity-60 hover:opacity-100 light:opacity-100 light:hover:opacity-60 cursor-pointer ${listening ? '!opacity-100' : ''}`"
  >
    <Microphone
      weight="fill"
      color="var(--theme-sidebar-footer-icon-fill)"
      :class="`w-[22px] h-[22px] pointer-events-none text-theme-text-primary ${listening ? 'animate-pulse-glow' : ''}`"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PhSpeakerHigh, PhPauseCircle, PhCircleNotch } from '@phosphor-icons/vue'
import Workspace from '@/models/workspace'
import showToast from '@/utils/toast'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  slug: String,
  chatId: String
})

const { t } = useI18n()
const playerRef = ref(null)
const speaking = ref(false)
const loading = ref(false)
const audioSrc = ref(null)

function speakMessage() {
  if (speaking.value) {
    playerRef.value?.pause()
    return
  }

  try {
    if (!audioSrc.value) {
      loading.value = true
      Workspace.ttsMessage(props.slug, props.chatId)
        .then((audioBlob) => {
          if (!audioBlob)
            throw new Error('Failed to load or play TTS message response.')
          audioSrc.value = audioBlob
        })
        .catch((e) => showToast(e.message, 'error', { clear: true }))
        .finally(() => (loading.value = false))
    } else {
      playerRef.value.play()
    }
  } catch (e) {
    console.error(e)
    loading.value = false
    speaking.value = false
  }
}

onMounted(() => {
  function setupPlayer() {
    if (!playerRef.value) return
    playerRef.value.addEventListener('play', () => {
      speaking.value = true
    })

    playerRef.value.addEventListener('pause', () => {
      playerRef.value.currentTime = 0
      speaking.value = false
    })
  }
  setupPlayer()
})
</script>

<template>
  <div v-if="chatId" class="mt-3 relative">
    <button
      @click="speakMessage"
      :data-auto-play-chat-id="chatId"
      data-tooltip-id="message-to-speech"
      :data-tooltip-content="
        speaking
          ? t('pause_tts_speech_message')
          : t('chat_window.tts_speak_message')
      "
      class="border-none text-[var(--theme-sidebar-footer-icon-fill)]"
      :aria-label="speaking ? 'Pause speech' : 'Speak message'"
    >
      <PauseCircle v-if="speaking" :size="18" class="mb-1" />
      <template v-else>
        <CircleNotch v-if="loading" :size="18" class="mb-1 animate-spin" />
        <SpeakerHigh v-else :size="18" class="mb-1" />
      </template>
      <audio
        ref="playerRef"
        hidden
        :src="audioSrc"
        autoplay
        :controls="false"
      />
    </button>
  </div>
</template>

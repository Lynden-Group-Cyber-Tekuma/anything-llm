<script setup>
import { ref, onMounted } from 'vue'
import { PhSpeakerHigh, PhPauseCircle, PhCircleNotch } from '@phosphor-icons/vue'
import PiperTTSClient from '@/utils/piperTTS'

const props = defineProps({
  chatId: String,
  voiceId: {
    type: String,
    default: null
  },
  message: String
})

const playerRef = ref(null)
const speaking = ref(false)
const loading = ref(false)
const audioSrc = ref(null)

async function speakMessage(e) {
  e.preventDefault()
  if (speaking.value) {
    playerRef.value?.pause()
    return
  }

  try {
    if (!audioSrc.value) {
      loading.value = true
      const client = new PiperTTSClient({ voiceId: props.voiceId })
      const blobUrl = await client.getAudioBlobForText(props.message)
      audioSrc.value = blobUrl
      loading.value = false
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
  <div class="mt-3 relative">
    <button
      type="button"
      @click="speakMessage"
      :disabled="loading"
      :data-auto-play-chat-id="chatId"
      data-tooltip-id="message-to-speech"
      :data-tooltip-content="speaking ? 'Pause TTS speech of message' : 'TTS Speak message'"
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

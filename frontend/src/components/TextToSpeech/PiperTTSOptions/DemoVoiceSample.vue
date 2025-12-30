<script setup>
import { ref, onMounted } from 'vue'
import PiperTTSClient from '@/utils/piperTTS'
import { CircleNotch, PauseCircle, PlayCircle } from '@phosphor-icons/vue'

const props = defineProps({
  voiceId: {
    type: String,
    required: true
  }
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
      const blobUrl = await client.getAudioBlobForText(
        'Hello, welcome to AnythingLLM!'
      )
      audioSrc.value = blobUrl
      loading.value = false
      client.worker?.terminate()
      PiperTTSClient._instance = null
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
      audioSrc.value = null
    })
  }
  setupPlayer()
})
</script>

<template>
  <button
    type="button"
    @click="speakMessage"
    :disabled="loading"
    class="border-none text-zinc-300 flex items-center gap-x-1"
  >
    <template v-if="speaking">
      <PauseCircle :size="20" class="flex-shrink-0" />
      <p class="text-sm flex-shrink-0">Stop demo</p>
    </template>
    <template v-else>
      <template v-if="loading">
        <CircleNotch :size="20" class="animate-spin flex-shrink-0" />
        <p class="text-sm flex-shrink-0">Loading voice</p>
      </template>
      <template v-else>
        <PlayCircle :size="20" class="flex-shrink-0 text-white" />
        <p class="text-white text-sm flex-shrink-0">Play sample</p>
      </template>
    </template>
    <audio
      ref="playerRef"
      hidden
      :src="audioSrc"
      autoplay
      :controls="false"
    />
  </button>
</template>

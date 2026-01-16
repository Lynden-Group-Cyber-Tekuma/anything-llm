<script setup>
import { ref, onMounted } from 'vue'
import { PhSpeakerHigh, PhPauseCircle } from '@phosphor-icons/vue'

const props = defineProps({
  chatId: String,
  message: String
})

const speaking = ref(false)
const supported = ref(false)

onMounted(() => {
  supported.value = 'speechSynthesis' in window
})

function endSpeechUtterance() {
  window.speechSynthesis?.cancel()
  speaking.value = false
  return
}

function speakMessage() {
  // if the user is pausing this particular message
  // while the synth is speaking we can end it.
  // If they are clicking another message's TTS
  // we need to ignore that until they pause the one that is playing.
  if (window.speechSynthesis.speaking && speaking.value) {
    endSpeechUtterance()
    return
  }

  if (window.speechSynthesis.speaking && !speaking.value) return
  const utterance = new SpeechSynthesisUtterance(props.message)
  utterance.addEventListener('end', endSpeechUtterance)
  window.speechSynthesis.speak(utterance)
  speaking.value = true
}
</script>

<template>
  <div v-if="supported" class="mt-3 relative">
    <button
      @click="speakMessage"
      :data-auto-play-chat-id="chatId"
      data-tooltip-id="message-to-speech"
      :data-tooltip-content="speaking ? 'Pause TTS speech of message' : 'TTS Speak message'"
      class="border-none text-[var(--theme-sidebar-footer-icon-fill)]"
      :aria-label="speaking ? 'Pause speech' : 'Speak message'"
    >
      <PauseCircle v-if="speaking" :size="18" class="mb-1" />
      <SpeakerHigh v-else :size="18" class="mb-1" />
    </button>
  </div>
</template>

<script setup>
import { useTTSProvider } from '@/components/contexts/TTSProvider'
import NativeTTSMessage from './native.vue'
import AsyncTTSMessage from './asyncTts.vue'
import PiperTTSMessage from './piperTTS.vue'

const props = defineProps({
  slug: String,
  chatId: String,
  message: String
})

const { settings, provider, loading } = useTTSProvider()
</script>

<template>
  <template v-if="chatId && !loading">
    <AsyncTTSMessage
      v-if="provider === 'openai' || provider === 'generic-openai' || provider === 'elevenlabs'"
      :chat-id="chatId"
      :slug="slug"
    />
    <PiperTTSMessage
      v-else-if="provider === 'piper_local'"
      :chat-id="chatId"
      :voice-id="settings?.TTSPiperTTSVoiceModel"
      :message="message"
    />
    <NativeTTSMessage
      v-else
      :chat-id="chatId"
      :message="message"
    />
  </template>
</template>

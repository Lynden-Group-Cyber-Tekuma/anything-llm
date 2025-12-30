<script setup>
import { ref, onMounted } from 'vue'
import PiperTTSClient from '@/utils/piperTTS'
import { titleCase } from 'text-case'
import { humanFileSize } from '@/utils/numbers'
import showToast from '@/utils/toast'
import DemoVoiceSample from './DemoVoiceSample.vue'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const loading = ref(true)
const voices = ref([])
const selectedVoice = ref(props.settings?.TTSPiperTTSVoiceModel)

function voicesByLanguage(voices = []) {
  const voicesByLanguage = voices.reduce((acc, voice) => {
    const langName = voice?.language?.name_english ?? 'Unlisted'
    acc[langName] = acc[langName] || []
    acc[langName].push(voice)
    return acc
  }, {})
  return Object.entries(voicesByLanguage)
}

function voiceDisplayName(voice) {
  const { is_stored, name, quality, files } = voice
  const onnxFileKey = Object.keys(files).find((key) => key.endsWith('.onnx'))
  const fileSize = files?.[onnxFileKey]?.size_bytes || 0
  return `${is_stored ? '✔ ' : ''}${titleCase(name)}-${quality === 'low' ? 'Low' : 'HQ'} (${humanFileSize(fileSize)})`
}

function flushVoices() {
  PiperTTSClient.flush()
    .then(() =>
      showToast('All voices flushed from browser storage', 'info', {
        clear: true,
      })
    )
    .catch((e) => console.error(e))
}

onMounted(async () => {
  try {
    const fetchedVoices = await PiperTTSClient.voices()
    if (fetchedVoices?.length !== 0) {
      voices.value = fetchedVoices
    } else {
      throw new Error('Could not fetch voices from web worker.')
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const hasStoredVoices = computed(() => {
  return voices.value.some((voice) => voice.is_stored)
})
</script>

<template>
  <div v-if="loading" class="flex flex-col w-60">
    <label class="text-white text-sm font-semibold block mb-3">
      Voice Model Selection
    </label>
    <select
      name="TTSPiperTTSVoiceModel"
      value=""
      disabled
      class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
    >
      <option value="" disabled>
        -- loading available models --
      </option>
    </select>
  </div>
  <div v-else class="flex flex-col w-fit">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        Voice Model Selection
      </label>
      <div class="flex items-center w-fit gap-x-4 mb-2">
        <select
          name="TTSPiperTTSVoiceModel"
          required
          v-model="selectedVoice"
          class="border-none flex-shrink-0 bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <optgroup
            v-for="[lang, langVoices] in voicesByLanguage(voices)"
            :key="lang"
            :label="lang"
          >
            <option
              v-for="voice in langVoices"
              :key="voice.key"
              :value="voice.key"
            >
              {{ voiceDisplayName(voice) }}
            </option>
          </optgroup>
        </select>
        <DemoVoiceSample :voiceId="selectedVoice" />
      </div>
      <p class="text-xs text-white/40">
        The "✔" indicates this model is already stored locally and does not
        need to be downloaded when run.
      </p>
    </div>
    <button
      v-if="hasStoredVoices"
      type="button"
      @click="flushVoices"
      class="w-fit border-none hover:text-white hover:underline text-white/40 text-sm my-4"
    >
      Flush voice cache
    </button>
  </div>
</template>

<script>
import { computed } from 'vue'
</script>

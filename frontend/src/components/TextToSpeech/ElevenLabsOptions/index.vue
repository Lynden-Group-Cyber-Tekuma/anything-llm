<script setup>
import { ref } from 'vue'
import ElevenLabsModelSelection from './ElevenLabsModelSelection.vue'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.TTSElevenLabsKey)
const elevenLabsKey = ref(props.settings?.TTSElevenLabsKey)

const handleChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  elevenLabsKey.value = inputValue.value
}
</script>

<template>
  <div class="flex gap-x-4">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        API Key
      </label>
      <input
        type="password"
        name="TTSElevenLabsKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="ElevenLabs API Key"
        :value="settings?.TTSElevenLabsKey ? '*'.repeat(20) : ''"
        required
        autocomplete="off"
        spellcheck="false"
        @input="handleChange"
        @blur="handleBlur"
      />
    </div>
    <ElevenLabsModelSelection
      v-if="!settings?.credentialsOnly"
      :settings="settings"
      :apiKey="elevenLabsKey"
    />
  </div>
</template>

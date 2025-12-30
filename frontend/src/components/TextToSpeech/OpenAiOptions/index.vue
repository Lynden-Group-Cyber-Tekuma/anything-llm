<script setup>
function toProperCase(string) {
  return string.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const apiKey = props.settings?.TTSOpenAIKey
const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
</script>

<template>
  <div class="flex gap-x-4">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        API Key
      </label>
      <input
        type="password"
        name="TTSOpenAIKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="OpenAI API Key"
        :value="apiKey ? '*'.repeat(20) : ''"
        required
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        Voice Model
      </label>
      <select
        name="TTSOpenAIVoiceModel"
        :value="settings?.TTSOpenAIVoiceModel ?? 'alloy'"
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option
          v-for="voice in voices"
          :key="voice"
          :value="voice"
        >
          {{ toProperCase(voice) }}
        </option>
      </select>
    </div>
  </div>
</template>

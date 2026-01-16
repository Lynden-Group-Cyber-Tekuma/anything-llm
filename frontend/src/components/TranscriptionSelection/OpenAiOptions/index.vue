<script setup>
import { ref } from 'vue'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.OpenAiKey)
const openAIKey = ref(props.settings?.OpenAiKey)

const handleChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  openAIKey.value = inputValue.value
}
</script>

<template>
  <div class="flex gap-x-7 gap-[36px] mt-1.5">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        API Key
      </label>
      <input
        type="password"
        name="OpenAiKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="OpenAI API Key"
        :value="settings?.OpenAiKey ? '*'.repeat(20) : ''"
        required
        autocomplete="off"
        spellcheck="false"
        @input="handleChange"
        @blur="handleBlur"
      />
    </div>
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        Whisper Model
      </label>
      <select
        disabled
        class="border-none flex-shrink-0 bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option disabled selected>
          Whisper Large
        </option>
      </select>
    </div>
  </div>
</template>

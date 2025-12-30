<script setup>
import { ref } from 'vue'
import CohereModelSelection from './CohereModelSelection.vue'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const inputValue = ref(props.settings?.CohereApiKey)
const cohereApiKey = ref(props.settings?.CohereApiKey)

const handleInputChange = (e) => {
  inputValue.value = e.target.value
}

const handleBlur = () => {
  cohereApiKey.value = inputValue.value
}
</script>

<template>
  <div class="w-full flex flex-col gap-y-4">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          API Key
        </label>
        <input
          type="password"
          name="CohereApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Cohere API Key"
          :value="settings?.CohereApiKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
          @input="handleInputChange"
          @blur="handleBlur"
        />
      </div>
      <CohereModelSelection :settings="settings" :apiKey="cohereApiKey" />
    </div>
  </div>
</template>

<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-theme-text-primary mb-2">
        Flow Name
      </label>
      <div class="flex flex-col text-xs text-theme-text-secondary mt-2 mb-3">
        <p>
          It is important to give your flow a name that an LLM can easily
          understand.
        </p>
        <p>"SendMessageToDiscord", "CheckStockPrice", "CheckWeather"</p>
      </div>
      <input
        id="agent-flow-name-input"
        ref="nameRef"
        type="text"
        placeholder="Enter flow name"
        :value="config?.name || ''"
        @input="(e) =>
          onConfigChange({
            ...config,
            name: e.target.value,
          })
        "
        class="w-full border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
        autocomplete="off"
        spellcheck="false"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-theme-text-primary mb-2">
        Description
      </label>
      <div class="flex flex-col text-xs text-theme-text-secondary mt-2 mb-3">
        <p>
          It is equally important to give your flow a description that an LLM
          can easily understand. Be sure to include the purpose of the flow,
          the context it will be used in, and any other relevant information.
        </p>
      </div>
      <textarea
        ref="descriptionRef"
        :value="config?.description || ''"
        @input="(e) =>
          onConfigChange({
            ...config,
            description: e.target.value,
          })
        "
        class="w-full border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
        rows="3"
        placeholder="Enter flow description"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  config: {
    type: Object,
    required: true
  },
  onConfigChange: {
    type: Function,
    required: true
  }
})

const nameRef = ref(null)
const descriptionRef = ref(null)

// Expose refs to parent component
defineExpose({
  nameRef,
  descriptionRef
})
</script>

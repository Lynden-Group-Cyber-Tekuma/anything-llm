<script setup>
defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const handleScroll = (e) => {
  e.target.blur()
}
</script>

<template>
  <div class="w-full flex flex-col">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          HuggingFace Inference Endpoint
        </label>
        <input
          type="url"
          name="HuggingFaceLLMEndpoint"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="https://example.endpoints.huggingface.cloud"
          :value="settings?.HuggingFaceLLMEndpoint"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          HuggingFace Access Token
        </label>
        <input
          type="password"
          name="HuggingFaceLLMAccessToken"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="HuggingFace Access Token"
          :value="settings?.HuggingFaceLLMAccessToken ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Model Token Limit
        </label>
        <input
          type="number"
          name="HuggingFaceLLMTokenLimit"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="4096"
          :min="1"
          :value="settings?.HuggingFaceLLMTokenLimit"
          required
          autocomplete="off"
          @scroll="handleScroll"
        />
      </div>
    </div>
  </div>
</template>

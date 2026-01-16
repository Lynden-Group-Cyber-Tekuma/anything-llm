<script setup>
const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-y-7">
    <div class="flex gap-x-4">
      <div class="flex flex-col w-60">
        <div class="flex justify-between items-start mb-2">
          <label class="text-white text-sm font-semibold">Base URL</label>
        </div>
        <input
          type="url"
          name="TTSOpenAICompatibleEndpoint"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="http://localhost:7851/v1"
          :value="settings?.TTSOpenAICompatibleEndpoint"
          autocomplete="off"
          spellcheck="false"
        />
        <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
          This should be the base URL of the OpenAI compatible TTS service you
          will generate TTS responses from.
        </p>
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-2">
          API Key
        </label>
        <input
          type="password"
          name="TTSOpenAICompatibleKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="API Key"
          :value="settings?.TTSOpenAICompatibleKey ? '*'.repeat(20) : ''"
          autocomplete="off"
          spellcheck="false"
        />
        <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
          Some TTS services require an API key to generate TTS responses -
          this is optional if your service does not require one.
        </p>
      </div>
    </div>
    <div class="flex gap-x-4">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          TTS Model
        </label>
        <input
          type="text"
          name="TTSOpenAICompatibleModel"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Your TTS model identifier"
          :value="settings?.TTSOpenAICompatibleModel"
          required
          autocomplete="off"
          spellcheck="false"
        />
        <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
          Most TTS services will have several models available. This is the
          <code>model</code> parameter you will use to select the model you
          want to use. Note: This is not the same as the voice model.
        </p>
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Voice Model
        </label>
        <input
          type="text"
          name="TTSOpenAICompatibleVoiceModel"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Your voice model identifier"
          :value="settings?.TTSOpenAICompatibleVoiceModel"
          required
          autocomplete="off"
          spellcheck="false"
        />
        <p class="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
          Most TTS services will have several voice models available, this is
          the identifier for the voice model you want to use.
        </p>
      </div>
    </div>
  </div>
</template>

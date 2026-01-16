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
  <div class="flex flex-col gap-y-7">
    <div class="flex gap-[36px] mt-1.5 flex-wrap">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Base URL
        </label>
        <input
          type="url"
          name="GenericOpenAiBasePath"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="eg: https://proxy.openai.com"
          :value="settings?.GenericOpenAiBasePath"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          API Key
        </label>
        <input
          type="password"
          name="GenericOpenAiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Generic service API Key"
          :value="settings?.GenericOpenAiKey ? '*'.repeat(20) : ''"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Chat Model Name
        </label>
        <input
          type="text"
          name="GenericOpenAiModelPref"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Model id used for chat requests"
          :value="settings?.GenericOpenAiModelPref"
          required
          autocomplete="off"
        />
      </div>
    </div>
    <div class="flex gap-[36px] flex-wrap">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Token context window
        </label>
        <input
          type="number"
          name="GenericOpenAiTokenLimit"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Content window limit (eg: 4096)"
          :min="1"
          :value="settings?.GenericOpenAiTokenLimit"
          required
          autocomplete="off"
          @scroll="handleScroll"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Max Tokens
        </label>
        <input
          type="number"
          name="GenericOpenAiMaxTokens"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Max tokens per request (eg: 1024)"
          :min="1"
          :value="settings?.GenericOpenAiMaxTokens || 1024"
          required
          autocomplete="off"
        />
      </div>
    </div>
  </div>
</template>

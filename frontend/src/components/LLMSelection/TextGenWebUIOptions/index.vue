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
  <div class="flex gap-[36px] mt-1.5 flex-wrap">
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        Base URL
      </label>
      <input
        type="url"
        name="TextGenWebUIBasePath"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="http://127.0.0.1:5000/v1"
        :value="settings?.TextGenWebUIBasePath"
        required
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        Token context window
      </label>
      <input
        type="number"
        name="TextGenWebUITokenLimit"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="Content window limit (eg: 4096)"
        :min="1"
        :value="settings?.TextGenWebUITokenLimit"
        required
        autocomplete="off"
        @scroll="handleScroll"
      />
    </div>
    <div class="flex flex-col w-60">
      <label class="text-white text-sm font-semibold block mb-3">
        API Key (Optional)
      </label>
      <input
        type="password"
        name="TextGenWebUIAPIKey"
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        placeholder="TextGen Web UI API Key"
        :value="settings?.TextGenWebUIAPIKey ? '*'.repeat(20) : ''"
        autocomplete="off"
        spellcheck="false"
      />
    </div>
  </div>
</template>

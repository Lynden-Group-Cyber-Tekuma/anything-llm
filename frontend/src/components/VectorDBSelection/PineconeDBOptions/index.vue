<script setup>
defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-y-7">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Pinecone DB API Key
        </label>
        <input
          type="password"
          name="PineConeKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Pinecone API Key"
          :value="settings?.PineConeKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Pinecone Index Name
        </label>
        <input
          type="text"
          name="PineConeIndex"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="my-index"
          :value="settings?.PineConeIndex"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>
  </div>
</template>

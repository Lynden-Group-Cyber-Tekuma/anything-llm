<script setup>
const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-y-4">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Cluster Endpoint
        </label>
        <input
          type="text"
          name="ZillizEndpoint"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="https://sample.api.gcp-us-west1.zillizcloud.com"
          :value="settings?.ZillizEndpoint"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          API Token
        </label>
        <input
          type="password"
          name="ZillizApiToken"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Zilliz cluster API Token"
          :value="settings?.ZillizApiToken ? '*'.repeat(20) : ''"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>
  </div>
</template>

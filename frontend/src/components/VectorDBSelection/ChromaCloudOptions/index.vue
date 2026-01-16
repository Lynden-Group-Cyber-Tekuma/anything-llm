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
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          API Key
        </label>
        <input
          type="password"
          name="ChromaCloudApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="ck-your-api-key-here"
          :value="settings?.ChromaCloudApiKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Tenant ID
        </label>
        <input
          name="ChromaCloudTenant"
          autocomplete="off"
          type="text"
          :value="settings?.ChromaCloudTenant"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="your-tenant-id-here"
          required
        />
      </div>

      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Database Name
        </label>
        <input
          name="ChromaCloudDatabase"
          autocomplete="off"
          type="text"
          :value="settings?.ChromaCloudDatabase"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="your-database-name"
          required
        />
      </div>
    </div>
  </div>
</template>

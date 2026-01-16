<script setup>
import { ref, onMounted } from 'vue'
import Admin from '@/models/admin'
import showToast from '@/utils/toast'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const hasChanges = ref(false)
const settings = ref({
  title: null,
  faviconUrl: null,
})

onMounted(async () => {
  const { settings: prefs } = await Admin.systemPreferences()
  settings.value = {
    title: prefs?.meta_page_title,
    faviconUrl: prefs?.meta_page_favicon,
  }
})

const handleSiteSettingUpdate = async (e) => {
  e.preventDefault()
  await Admin.updateSystemPreferences({
    meta_page_title: settings.value.title ?? null,
    meta_page_favicon: settings.value.faviconUrl ?? null,
  })
  showToast(
    'Site preferences updated! They will reflect on page reload.',
    'success',
    { clear: true }
  )
  hasChanges.value = false
  return
}
</script>

<template>
  <form
    class="flex flex-col gap-y-0.5 my-4 border-t border-white border-opacity-20 light:border-black/20 pt-6"
    @change="hasChanges = true"
    @submit="handleSiteSettingUpdate"
  >
    <p class="text-sm leading-6 font-semibold text-white">
      {{ t('customization.items.browser-appearance.title') }}
    </p>
    <p class="text-xs text-white/60">
      {{ t('customization.items.browser-appearance.description') }}
    </p>

    <div class="w-fit">
      <p class="text-sm leading-6 font-medium text-white mt-2">
        {{ t('customization.items.browser-appearance.tab.title') }}
      </p>
      <p class="text-xs text-white/60">
        {{ t('customization.items.browser-appearance.tab.description') }}
      </p>
      <div class="flex items-center gap-x-4">
        <input
          name="meta_page_title"
          type="text"
          class="border-none bg-theme-settings-input-bg mt-2 text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-fit py-2 px-4"
          placeholder="AnythingLLM | Your personal LLM trained on anything"
          autocomplete="off"
          @input="(e) => {
            settings.title = e.target.value
          }"
          :value="settings.title ?? 'AnythingLLM | Your personal LLM trained on anything'"
        />
      </div>
    </div>

    <div class="w-fit">
      <p class="text-sm leading-6 font-medium text-white mt-2">
        {{ t('customization.items.browser-appearance.favicon.title') }}
      </p>
      <p class="text-xs text-white/60">
        {{ t('customization.items.browser-appearance.favicon.description') }}
      </p>
      <div class="flex items-center gap-x-2">
        <img
          :src="settings.faviconUrl ?? '/favicon.png'"
          @error="(e) => (e.target.src = '/favicon.png')"
          class="h-10 w-10 rounded-lg mt-2"
          alt="Site favicon"
        />
        <input
          name="meta_page_favicon"
          type="url"
          class="border-none bg-theme-settings-input-bg mt-2 text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-fit py-2 px-4"
          placeholder="url to your image"
          @input="(e) => {
            settings.faviconUrl = e.target.value
          }"
          autocomplete="off"
          :value="settings.faviconUrl ?? ''"
        />
      </div>
    </div>

    <button
      v-if="hasChanges"
      type="submit"
      class="transition-all mt-2 w-fit duration-300 border border-slate-200 px-5 py-2.5 rounded-lg text-white text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 focus:ring-gray-800"
    >
      Save
    </button>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Admin from '@/models/admin'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const loading = ref(true)
const hasChanges = ref(false)
const customAppName = ref('')
const originalAppName = ref('')
const canCustomize = ref(false)

onMounted(async () => {
  const settings = await System.keys()
  if (!settings?.MultiUserMode && !settings?.RequiresAuth) {
    canCustomize.value = false
    return false
  }

  const { appName } = await System.fetchCustomAppName()
  customAppName.value = appName || ''
  originalAppName.value = appName || ''
  canCustomize.value = true
  loading.value = false
})

const updateCustomAppName = async (e, newValue = null) => {
  e.preventDefault()
  let custom_app_name = newValue
  if (newValue === null) {
    const form = new FormData(e.target)
    custom_app_name = form.get('customAppName')
  }
  const { success, error } = await Admin.updateSystemPreferences({
    custom_app_name,
  })
  if (!success) {
    showToast(`Failed to update custom app name: ${error}`, 'error')
    return
  } else {
    showToast('Successfully updated custom app name.', 'success')
    window.localStorage.removeItem(System.cacheKeys.customAppName)
    customAppName.value = custom_app_name
    originalAppName.value = custom_app_name
    hasChanges.value = false
  }
}

const handleChange = (e) => {
  customAppName.value = e.target.value
  hasChanges.value = true
}
</script>

<template>
  <form
    v-if="canCustomize && !loading"
    class="flex flex-col gap-y-0.5 mt-4"
    @submit="updateCustomAppName"
  >
    <p class="text-sm leading-6 font-semibold text-white">
      {{ t('customization.items.app-name.title') }}
    </p>
    <p class="text-xs text-white/60">
      {{ t('customization.items.app-name.description') }}
    </p>
    <div class="flex items-center gap-x-4">
      <input
        name="customAppName"
        type="text"
        class="border-none bg-theme-settings-input-bg mt-2 text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-fit py-2 px-4"
        placeholder="AnythingLLM"
        required
        autocomplete="off"
        @input="handleChange"
        :value="customAppName"
      />
      <button
        v-if="originalAppName !== ''"
        type="button"
        @click="(e) => updateCustomAppName(e, '')"
        class="text-white text-base font-medium hover:text-opacity-60"
      >
        Clear
      </button>
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

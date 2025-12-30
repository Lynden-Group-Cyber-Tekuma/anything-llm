<script setup>
import { ref, onMounted } from 'vue'
import showToast from '@/utils/toast'
import { safeJsonParse } from '@/utils/request'
import NewIconForm from './NewIconForm/index.vue'
import Admin from '@/models/admin'
import System from '@/models/system'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const footerIcons = ref(Array(3).fill(null))

onMounted(async () => {
  const settings = (await Admin.systemPreferences())?.settings
  if (settings && settings.footer_data) {
    const parsedIcons = safeJsonParse(settings.footer_data, [])
    footerIcons.value = footerIcons.value.map((icon, index) => {
      return parsedIcons[index] || icon
    })
  }
})

const updateFooterIcons = async (updatedIcons) => {
  const { success, error } = await Admin.updateSystemPreferences({
    footer_data: JSON.stringify(updatedIcons.filter((icon) => icon !== null)),
  })

  if (!success) {
    showToast(`Failed to update footer icons - ${error}`, 'error', {
      clear: true,
    })
    return
  }

  window.localStorage.removeItem(System.cacheKeys.footerIcons)
  footerIcons.value = updatedIcons
  showToast('Successfully updated footer icons.', 'success', { clear: true })
}

const handleRemoveIcon = (index) => {
  const updatedIcons = [...footerIcons.value]
  updatedIcons[index] = null
  updateFooterIcons(updatedIcons)
}
</script>

<template>
  <div class="flex flex-col gap-y-0.5 my-4">
    <p class="text-sm leading-6 font-semibold text-white">
      {{ t('customization.items.sidebar-footer.title') }}
    </p>
    <p class="text-xs text-white/60">
      {{ t('customization.items.sidebar-footer.description') }}
    </p>
    <div class="mt-2 flex gap-x-3 font-medium text-white text-sm">
      <div>{{ t('customization.items.sidebar-footer.icon') }}</div>
      <div>{{ t('customization.items.sidebar-footer.link') }}</div>
    </div>
    <div class="mt-2 flex flex-col gap-y-[10px]">
      <NewIconForm
        v-for="(icon, index) in footerIcons"
        :key="index"
        :icon="icon?.icon"
        :url="icon?.url"
        @save="(newIcon, newUrl) => {
          const updatedIcons = [...footerIcons]
          updatedIcons[index] = { icon: newIcon, url: newUrl }
          updateFooterIcons(updatedIcons)
        }"
        @remove="handleRemoveIcon(index)"
      />
    </div>
  </div>
</template>

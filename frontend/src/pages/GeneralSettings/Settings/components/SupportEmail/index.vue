<script setup>
import { ref, onMounted } from 'vue'
import useUser from '@/hooks/useUser'
import Admin from '@/models/admin'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { useI18n } from 'vue-i18n'

const { user } = useUser()
const { t } = useI18n()
const loading = ref(true)
const hasChanges = ref(false)
const supportEmail = ref('')
const originalEmail = ref('')

onMounted(async () => {
  const fetchedSupportEmail = await System.fetchSupportEmail()
  supportEmail.value = fetchedSupportEmail.email || ''
  originalEmail.value = fetchedSupportEmail.email || ''
  loading.value = false
})

const updateSupportEmail = async (e, newValue = null) => {
  e.preventDefault()
  let support_email = newValue
  if (newValue === null) {
    const form = new FormData(e.target)
    support_email = form.get('supportEmail')
  }

  const { success, error } = await Admin.updateSystemPreferences({
    support_email,
  })

  if (!success) {
    showToast(`Failed to update support email: ${error}`, 'error')
    return
  } else {
    showToast('Successfully updated support email.', 'success')
    window.localStorage.removeItem(System.cacheKeys.supportEmail)
    supportEmail.value = support_email
    originalEmail.value = support_email
    hasChanges.value = false
  }
}

const handleChange = (e) => {
  supportEmail.value = e.target.value
  hasChanges.value = true
}
</script>

<template>
  <form
    v-if="!loading && user?.role"
    class="flex flex-col gap-y-0.5 mt-4"
    @submit="updateSupportEmail"
  >
    <p class="text-sm leading-6 font-semibold text-white">
      {{ t('customization.items.support-email.title') }}
    </p>
    <p class="text-xs text-white/60">
      {{ t('customization.items.support-email.description') }}
    </p>
    <div class="flex items-center gap-x-4">
      <input
        name="supportEmail"
        type="email"
        class="border-none bg-theme-settings-input-bg mt-2 text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-fit py-2 px-4"
        placeholder="support@mycompany.com"
        required
        autocomplete="off"
        @input="handleChange"
        :value="supportEmail"
      />
      <button
        v-if="originalEmail !== ''"
        type="button"
        @click="(e) => updateSupportEmail(e, '')"
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

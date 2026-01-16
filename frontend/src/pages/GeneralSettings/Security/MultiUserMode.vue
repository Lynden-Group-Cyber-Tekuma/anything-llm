<template>
  <div v-if="loading" class="h-1/2 transition-all duration-500 relative md:ml-[2px] md:mr-[8px] md:my-[16px] md:rounded-[26px] p-[18px] h-full overflow-y-scroll">
    <div class="w-full h-full flex justify-center items-center">
      <PreLoader />
    </div>
  </div>
  <form
    v-else
    @submit.prevent="handleSubmit"
    @change="hasChanges = true"
    class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px]"
  >
    <div class="w-full flex flex-col gap-y-1 w-full flex flex-col gap-y-1 pb-6 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10">
      <div class="w-full flex flex-col gap-y-1">
        <div class="items-center flex gap-x-4">
          <p class="text-base font-bold text-white mt-6">
            {{ t('security.multiuser.title') }}
          </p>
        </div>
        <p class="text-xs leading-[18px] font-base text-white text-opacity-60">
          {{ t('security.multiuser.description') }}
        </p>
      </div>
      <div v-if="hasChanges" class="flex justify-end">
        <CTAButton
          @click="handleSubmit"
          class="mt-3 mr-0 -mb-20 z-10"
        >
          {{ saving ? t('common.saving') : t('common.save') }}
        </CTAButton>
      </div>
      <div class="relative w-full max-h-full">
        <div class="relative rounded-lg">
          <div class="flex items-start justify-between px-6 py-4"></div>
          <div class="space-y-6 flex h-full w-full">
            <div class="w-full flex flex-col gap-y-4">
              <div>
                <label class="text-white text-sm font-semibold block mb-3">
                  {{ multiUserModeEnabled
                    ? t('security.multiuser.enable.is-enable')
                    : t('security.multiuser.enable.enable') }}
                </label>

                <label class="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    @click="useMultiUserMode = !useMultiUserMode"
                    :checked="useMultiUserMode"
                    class="peer sr-only pointer-events-none"
                  />
                  <div
                    v-show="!multiUserModeEnabled"
                    class="peer-disabled:opacity-50 pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"
                  />
                </label>
              </div>
              <div v-if="useMultiUserMode" class="w-full flex flex-col gap-y-2 my-5">
                <div class="w-80">
                  <label
                    for="username"
                    class="text-white text-sm font-semibold block mb-3"
                  >
                    {{ t('security.multiuser.enable.username') }}
                  </label>
                  <input
                    name="username"
                    type="text"
                    class="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5 placeholder:text-theme-settings-input-placeholder focus:ring-blue-500"
                    placeholder="Your admin username"
                    :minlength="2"
                    :required="true"
                    autocomplete="off"
                    :disabled="multiUserModeEnabled"
                    :value="multiUserModeEnabled ? '********' : ''"
                  />
                </div>
                <div class="mt-4 w-80">
                  <label
                    for="password"
                    class="text-white text-sm font-semibold block mb-3"
                  >
                    {{ t('security.multiuser.enable.password') }}
                  </label>
                  <input
                    name="password"
                    type="text"
                    class="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5 placeholder:text-theme-settings-input-placeholder focus:ring-blue-500"
                    placeholder="Your admin password"
                    :minlength="8"
                    :required="true"
                    autocomplete="off"
                    :value="multiUserModeEnabled ? '********' : ''"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between space-x-14">
            <p class="text-white text-opacity-80 text-xs rounded-lg w-96">
              {{ t('security.multiuser.enable.description') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import System from '@/models/system'
import showToast from '@/utils/toast'
import paths from '@/utils/paths'
import { AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER } from '@/utils/constants'
import PreLoader from '@/components/Preloader/index.vue'
import CTAButton from '@/components/lib/CTAButton/index.vue'

const { t } = useI18n()
const saving = ref(false)
const hasChanges = ref(false)
const useMultiUserMode = ref(false)
const multiUserModeEnabled = ref(false)
const loading = ref(true)

const handleSubmit = async (e) => {
  if (e) e.preventDefault()
  setSaving(true)
  setHasChanges(false)
  if (useMultiUserMode.value) {
    const form = e?.target || document.querySelector('form')
    const formData = new FormData(form)
    const data = {
      username: formData.get('username'),
      password: formData.get('password'),
    }

    const { success, error } = await System.setupMultiUser(data)
    if (success) {
      showToast('Multi-User mode enabled successfully.', 'success')
      saving.value = false
      setTimeout(() => {
        window.localStorage.removeItem(AUTH_USER)
        window.localStorage.removeItem(AUTH_TOKEN)
        window.localStorage.removeItem(AUTH_TIMESTAMP)
        window.location = paths.settings.users()
      }, 2_000)
      return
    }

    showToast(`Failed to enable Multi-User mode: ${error}`, 'error')
    saving.value = false
    return
  }
}

const setSaving = (val) => { saving.value = val }
const setHasChanges = (val) => { hasChanges.value = val }

onMounted(async () => {
  const isMultiUser = await System.isMultiUserMode()
  multiUserModeEnabled.value = isMultiUser
  loading.value = false
})
</script>

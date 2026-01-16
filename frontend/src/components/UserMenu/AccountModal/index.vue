<script setup>
import { ref, onMounted } from 'vue'
import { useLanguageOptions } from '@/hooks/useLanguageOptions'
import usePfp from '@/hooks/usePfp'
import System from '@/models/system'
import Appearance from '@/models/appearance'
import { AUTH_USER } from '@/utils/constants'
import showToast from '@/utils/toast'
import { PhInfo, PhPlus, PhX } from '@phosphor-icons/vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import { useTheme } from '@/hooks/useTheme'
import { useI18n } from 'vue-i18n'
import { safeJsonParse } from '@/utils/request'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  hideModal: {
    type: Function,
    required: true
  }
})

const { pfp, setPfp } = usePfp()
const { t } = useI18n()

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return false

  const formData = new FormData()
  formData.append('file', file)
  const { success, error } = await System.uploadPfp(formData)
  if (!success) {
    showToast(t('profile_settings.failed_upload', { error }), 'error')
    return
  }

  const pfpUrl = await System.fetchPfp(props.user.id)
  setPfp(pfpUrl)
  showToast(t('profile_settings.upload_success'), 'success')
}

const handleRemovePfp = async () => {
  const { success, error } = await System.removePfp()
  if (!success) {
    showToast(t('profile_settings.failed_remove', { error }), 'error')
    return
  }

  setPfp(null)
}

const handleUpdate = async (e) => {
  e.preventDefault()

  const data = {}
  const form = new FormData(e.target)
  for (var [key, value] of form.entries()) {
    if (!value || value === null) continue
    data[key] = value
  }

  const { success, error } = await System.updateUser(data)
  if (success) {
    let storedUser = safeJsonParse(localStorage.getItem(AUTH_USER), null)
    if (storedUser) {
      storedUser.username = data.username
      storedUser.bio = data.bio
      localStorage.setItem(AUTH_USER, JSON.stringify(storedUser))
    }
    showToast(t('profile_settings.profile_updated'), 'success', {
      clear: true,
    })
    props.hideModal()
  } else {
    showToast(t('profile_settings.failed_update_user', { error }), 'error')
  }
}
</script>

<template>
  <ModalWrapper :isOpen="true">
    <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            {{ t('profile_settings.edit_account') }}
          </h3>
        </div>
        <button
          @click="hideModal"
          type="button"
          class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
        >
          <PhX :size="24" weight="bold" class="text-white" />
        </button>
      </div>
      <div
        class="h-full w-full overflow-y-auto"
        style="max-height: calc(100vh - 200px)"
      >
        <form @submit="handleUpdate" class="space-y-6">
          <div class="flex flex-col md:flex-row items-center justify-center gap-8">
            <div class="flex flex-col items-center">
              <label class="group w-48 h-48 flex flex-col items-center justify-center bg-theme-bg-primary hover:bg-theme-bg-secondary transition-colors duration-300 rounded-full mt-8 border-2 border-dashed border-white light:border-[#686C6F] light:bg-[#E0F2FE] light:hover:bg-transparent cursor-pointer hover:opacity-60">
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileUpload"
                />
                <img
                  v-if="pfp"
                  :src="pfp"
                  alt="User profile picture"
                  class="w-48 h-48 rounded-full object-cover bg-white"
                />
                <div v-else class="flex flex-col items-center justify-center p-3">
                  <PhPlus class="w-8 h-8 text-theme-text-secondary m-2" />
                  <span class="text-theme-text-secondary text-opacity-80 text-sm font-semibold">
                    {{ t('profile_settings.profile_picture') }}
                  </span>
                  <span class="text-theme-text-secondary text-opacity-60 text-xs">
                    800 x 800
                  </span>
                </div>
              </label>
              <button
                v-if="pfp"
                type="button"
                @click="handleRemovePfp"
                class="mt-3 text-theme-text-secondary text-opacity-60 text-sm font-medium hover:underline"
              >
                {{ t('profile_settings.remove_profile_picture') }}
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-y-4 px-6">
            <div>
              <label
                for="username"
                class="block mb-2 text-sm font-medium text-theme-text-primary"
              >
                {{ t('profile_settings.username') }}
              </label>
              <input
                name="username"
                type="text"
                class="border-none bg-theme-settings-input-bg placeholder:text-theme-settings-input-placeholder border-gray-500 text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="User's username"
                :minlength="2"
                :value="user.username"
                required
                autocomplete="off"
              />
              <p class="mt-2 text-xs text-white/60">
                {{ t('profile_settings.username_description') }}
              </p>
            </div>
            <div>
              <label
                for="password"
                class="block mb-2 text-sm font-medium text-white"
              >
                {{ t('profile_settings.new_password') }}
              </label>
              <input
                name="password"
                type="text"
                class="border-none bg-theme-settings-input-bg placeholder:text-theme-settings-input-placeholder border-gray-500 text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                :placeholder="`${user.username}'s new password`"
                :minlength="8"
              />
              <p class="mt-2 text-xs text-white/60">
                {{ t('profile_settings.password_description') }}
              </p>
            </div>
            <div>
              <label
                for="bio"
                class="block mb-2 text-sm font-medium text-white"
              >
                Bio
              </label>
              <textarea
                name="bio"
                class="border-none bg-theme-settings-input-bg placeholder:text-theme-settings-input-placeholder border-gray-500 text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5 min-h-[100px] resize-y"
                placeholder="Tell us about yourself..."
                :value="user.bio"
              />
            </div>
            <div class="flex gap-x-16">
              <div class="flex flex-col gap-y-6">
                <ThemePreference />
                <LanguagePreference />
              </div>
              <div class="flex flex-col gap-y-6">
                <AutoSubmitPreference />
                <AutoSpeakPreference />
              </div>
            </div>
          </div>
          <div class="flex justify-between items-center border-t border-theme-modal-border pt-4 p-6">
            <button
              @click="hideModal"
              type="button"
              class="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
            >
              {{ t('profile_settings.cancel') }}
            </button>
            <button
              type="submit"
              class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
            >
              {{ t('profile_settings.update_account') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </ModalWrapper>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageOptions } from '@/hooks/useLanguageOptions'
import { useTheme } from '@/hooks/useTheme'
import Appearance from '@/models/appearance'
import { PhInfo } from '@phosphor-icons/vue'

const LanguagePreference = defineComponent({
  name: 'LanguagePreference',
  setup() {
    const {
      currentLanguage,
      supportedLanguages,
      getLanguageName,
      changeLanguage,
    } = useLanguageOptions()
    const { t } = useI18n()

    return {
      currentLanguage,
      supportedLanguages,
      getLanguageName,
      changeLanguage,
      t
    }
  },
  template: `
    <div>
      <label
        for="userLang"
        class="block mb-2 text-sm font-medium text-white"
      >
        {{ t('profile_settings.language') }}
      </label>
      <select
        name="userLang"
        class="border-none bg-theme-settings-input-bg w-fit mt-2 px-4 focus:outline-primary-button active:outline-primary-button outline-none text-white text-sm rounded-lg block py-2"
        :value="currentLanguage || 'en'"
        @change="(e) => changeLanguage(e.target.value)"
      >
        <option v-for="lang in supportedLanguages" :key="lang" :value="lang">
          {{ getLanguageName(lang) }}
        </option>
      </select>
    </div>
  `
})

const ThemePreference = defineComponent({
  name: 'ThemePreference',
  setup() {
    const { theme, setTheme, availableThemes } = useTheme()
    const { t } = useI18n()

    return { theme, setTheme, availableThemes, t }
  },
  template: `
    <div>
      <label
        for="theme"
        class="block mb-2 text-sm font-medium text-white"
      >
        {{ t('profile_settings.theme') }}
      </label>
      <select
        name="theme"
        :value="theme"
        @change="(e) => setTheme(e.target.value)"
        class="border-none bg-theme-settings-input-bg w-fit px-4 focus:outline-primary-button active:outline-primary-button outline-none text-white text-sm rounded-lg block py-2"
      >
        <option v-for="([key, value]) in Object.entries(availableThemes)" :key="key" :value="key">
          {{ value }}
        </option>
      </select>
    </div>
  `
})

const AutoSubmitPreference = defineComponent({
  name: 'AutoSubmitPreference',
  components: { Info },
  setup() {
    const autoSubmitSttInput = ref(true)
    const { t } = useI18n()

    onMounted(() => {
      const settings = Appearance.getSettings()
      autoSubmitSttInput.value = settings.autoSubmitSttInput ?? true
    })

    const handleChange = (e) => {
      const newValue = e.target.checked
      autoSubmitSttInput.value = newValue
      Appearance.updateSettings({ autoSubmitSttInput: newValue })
    }

    return { autoSubmitSttInput, handleChange, t }
  },
  template: `
    <div>
      <div class="flex items-center gap-x-1 mb-2">
        <label
          for="autoSubmit"
          class="block text-sm font-medium text-white"
        >
          {{ t('customization.chat.auto_submit.title') }}
        </label>
        <div
          :title="t('customization.chat.auto_submit.description')"
          class="cursor-pointer h-fit"
        >
          <PhInfo :size="16" weight="bold" class="text-white" />
        </div>
      </div>
      <div class="flex items-center gap-x-4">
        <label class="relative inline-flex cursor-pointer items-center">
          <input
            id="autoSubmit"
            type="checkbox"
            name="autoSubmit"
            :checked="autoSubmitSttInput"
            @change="handleChange"
            class="peer sr-only"
          />
          <div class="pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
        </label>
      </div>
    </div>
  `
})

const AutoSpeakPreference = defineComponent({
  name: 'AutoSpeakPreference',
  components: { Info },
  setup() {
    const autoPlayAssistantTtsResponse = ref(false)
    const { t } = useI18n()

    onMounted(() => {
      const settings = Appearance.getSettings()
      autoPlayAssistantTtsResponse.value = settings.autoPlayAssistantTtsResponse ?? false
    })

    const handleChange = (e) => {
      const newValue = e.target.checked
      autoPlayAssistantTtsResponse.value = newValue
      Appearance.updateSettings({ autoPlayAssistantTtsResponse: newValue })
    }

    return { autoPlayAssistantTtsResponse, handleChange, t }
  },
  template: `
    <div>
      <div class="flex items-center gap-x-1 mb-2">
        <label
          for="autoSpeak"
          class="block text-sm font-medium text-white"
        >
          {{ t('customization.chat.auto_speak.title') }}
        </label>
        <div
          :title="t('customization.chat.auto_speak.description')"
          class="cursor-pointer h-fit"
        >
          <PhInfo :size="16" weight="bold" class="text-white" />
        </div>
      </div>
      <div class="flex items-center gap-x-4">
        <label class="relative inline-flex cursor-pointer items-center">
          <input
            id="autoSpeak"
            type="checkbox"
            name="autoSpeak"
            :checked="autoPlayAssistantTtsResponse"
            @change="handleChange"
            class="peer sr-only"
          />
          <div class="pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
        </label>
      </div>
    </div>
  `
})

export { LanguagePreference, ThemePreference, AutoSubmitPreference, AutoSpeakPreference }
</script>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModal } from '@/composables/useModal'
import { useToast } from 'vue-toastification'
import System from '@/models/system'
import { AUTH_TOKEN, AUTH_USER } from '@/utils/constants'
import paths from '@/utils/paths'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import RecoveryCodeModal from '@/components/Modals/DisplayRecoveryCodeModal/index.vue'

const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const error = ref(null)
const recoveryCodes = ref([])
const downloadComplete = ref(false)
const user = ref(null)
const token = ref(null)
const showRecoveryForm = ref(false)
const showResetPasswordForm = ref(false)
const customAppName = ref(null)

// Form fields
const username = ref('')
const password = ref('')
const recoveryUsername = ref('')
const recoveryCodeInputs = ref(['', ''])
const newPassword = ref('')
const confirmPassword = ref('')

const {
  isOpen: isRecoveryCodeModalOpen,
  openModal: openRecoveryCodeModal,
  closeModal: closeRecoveryCodeModal
} = useModal()

async function handleLogin() {
  error.value = null
  loading.value = true

  try {
    const { valid, user: authUser, token: authToken, message, recoveryCodes: codes } =
      await System.requestToken({
        username: username.value,
        password: password.value
      })

    if (valid && authToken && authUser) {
      user.value = authUser
      token.value = authToken

      if (codes) {
        recoveryCodes.value = codes
        openRecoveryCodeModal()
      } else {
        window.localStorage.setItem(AUTH_USER, JSON.stringify(authUser))
        window.localStorage.setItem(AUTH_TOKEN, authToken)
        window.location = paths.home()
      }
    } else {
      error.value = message
    }
  } finally {
    loading.value = false
  }
}

function handleDownloadComplete() {
  downloadComplete.value = true
}

function handleResetPassword() {
  showRecoveryForm.value = true
}

async function handleRecoverySubmit() {
  const codes = recoveryCodeInputs.value.filter(code => code.trim() !== '')
  const { success, resetToken, error: err } = await System.recoverAccount(
    recoveryUsername.value,
    codes
  )

  if (success && resetToken) {
    window.localStorage.setItem('resetToken', resetToken)
    showRecoveryForm.value = false
    showResetPasswordForm.value = true
  } else {
    toast.error(err)
  }
}

async function handleResetSubmit() {
  const resetToken = window.localStorage.getItem('resetToken')

  if (resetToken) {
    const { success, error: err } = await System.resetPassword(
      resetToken,
      newPassword.value,
      confirmPassword.value
    )

    if (success) {
      window.localStorage.removeItem('resetToken')
      showResetPasswordForm.value = false
      toast.success('Password reset successful')
    } else {
      toast.error(err)
    }
  } else {
    toast.error('Invalid reset token')
  }
}

watch([downloadComplete, user, token], ([complete, userVal, tokenVal]) => {
  if (complete && userVal && tokenVal) {
    window.localStorage.setItem(AUTH_USER, JSON.stringify(userVal))
    window.localStorage.setItem(AUTH_TOKEN, tokenVal)
    window.location = paths.home()
  }
})

onMounted(async () => {
  const { appName } = await System.fetchCustomAppName()
  customAppName.value = appName || ''
  loading.value = false
})
</script>

<template>
  <!-- Recovery Form -->
  <form
    v-if="showRecoveryForm"
    @submit.prevent="handleRecoverySubmit"
    class="flex flex-col justify-center items-center relative rounded-2xl border-none bg-theme-bg-secondary md:shadow-[0_4px_14px_rgba(0,0,0,0.25)] md:px-8 px-0 py-4 w-full md:w-fit mt-10 md:mt-0"
  >
    <div class="flex items-start justify-between pt-11 pb-9 w-screen md:w-full md:px-12 px-6">
      <div class="flex flex-col gap-y-4 w-full">
        <h3 class="text-4xl md:text-lg font-bold text-theme-text-primary text-center md:text-left">
          {{ t('login.password-reset.title') }}
        </h3>
        <p class="text-sm text-theme-text-secondary md:text-left md:max-w-[300px] px-4 md:px-0 text-center">
          {{ t('login.password-reset.description') }}
        </p>
      </div>
    </div>
    <div class="md:px-12 px-6 space-y-6 flex h-full w-full">
      <div class="w-full flex flex-col gap-y-4">
        <div class="flex flex-col gap-y-2">
          <label class="text-white text-sm font-bold">
            {{ t('login.multi-user.placeholder-username') }}
          </label>
          <input
            v-model="recoveryUsername"
            name="username"
            type="text"
            :placeholder="t('login.multi-user.placeholder-username')"
            class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder focus:outline-primary-button active:outline-primary-button outline-none text-sm rounded-md p-2.5 w-full h-[48px] md:w-[300px] md:h-[34px]"
            required
          />
        </div>
        <div class="flex flex-col gap-y-2">
          <label class="text-white text-sm font-bold">
            {{ t('login.password-reset.recovery-codes') }}
          </label>
          <input
            v-for="(code, index) in recoveryCodeInputs"
            :key="index"
            v-model="recoveryCodeInputs[index]"
            type="text"
            :name="`recoveryCode${index + 1}`"
            :placeholder="t('login.password-reset.recovery-code', { index: index + 1 })"
            class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder focus:outline-primary-button active:outline-primary-button outline-none text-sm rounded-md p-2.5 w-full h-[48px] md:w-[300px] md:h-[34px]"
            required
          />
        </div>
      </div>
    </div>
    <div class="flex items-center md:p-12 md:px-0 px-6 mt-12 md:mt-0 space-x-2 border-gray-600 w-full flex-col gap-y-8">
      <button
        type="submit"
        class="md:text-primary-button md:bg-transparent md:w-[300px] text-dark-text text-sm font-bold focus:ring-4 focus:outline-none rounded-md border-[1.5px] border-primary-button md:h-[34px] h-[48px] md:hover:text-white md:hover:bg-primary-button bg-primary-button focus:z-10 w-full"
      >
        {{ t('login.password-reset.title') }}
      </button>
      <button
        type="button"
        class="text-white text-sm flex gap-x-1 hover:text-primary-button hover:underline -mb-8"
        @click="showRecoveryForm = false"
      >
        {{ t('login.password-reset.back-to-login') }}
      </button>
    </div>
  </form>

  <!-- Reset Password Form -->
  <form
    v-else-if="showResetPasswordForm"
    @submit.prevent="handleResetSubmit"
    class="flex flex-col justify-center items-center relative rounded-2xl bg-theme-bg-secondary md:shadow-[0_4px_14px_rgba(0,0,0,0.25)] md:px-8 px-0 py-4 w-full md:w-fit mt-10 md:mt-0"
  >
    <div class="flex items-start justify-between pt-11 pb-9 w-screen md:w-full md:px-12 px-6">
      <div class="flex flex-col gap-y-4 w-full">
        <h3 class="text-4xl md:text-2xl font-bold text-white text-center md:text-left">
          Reset Password
        </h3>
        <p class="text-sm text-white/90 md:text-left md:max-w-[300px] px-4 md:px-0 text-center">
          Enter your new password.
        </p>
      </div>
    </div>
    <div class="md:px-12 px-6 space-y-6 flex h-full w-full">
      <div class="w-full flex flex-col gap-y-4">
        <input
          v-model="newPassword"
          type="password"
          name="newPassword"
          placeholder="New Password"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          required
        />
        <input
          v-model="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          required
        />
      </div>
    </div>
    <div class="flex items-center md:p-12 md:px-0 px-6 mt-12 md:mt-0 space-x-2 border-gray-600 w-full flex-col gap-y-8">
      <button
        type="submit"
        class="md:text-primary-button md:bg-transparent md:w-[300px] text-dark-text text-sm font-bold focus:ring-4 focus:outline-none rounded-md border-[1.5px] border-primary-button md:h-[34px] h-[48px] md:hover:text-white md:hover:bg-primary-button bg-primary-button focus:z-10 w-full"
      >
        Reset Password
      </button>
    </div>
  </form>

  <!-- Login Form -->
  <template v-else>
    <form @submit.prevent="handleLogin">
      <div class="flex flex-col justify-center items-center relative rounded-2xl bg-theme-bg-secondary md:shadow-[0_4px_14px_rgba(0,0,0,0.25)] md:px-12 py-12 -mt-4 md:mt-0">
        <div class="flex items-start justify-between pt-11 pb-9 rounded-t">
          <div class="flex items-center flex-col gap-y-4">
            <div class="flex gap-x-1">
              <h3 class="text-md md:text-2xl font-bold text-white text-center white-space-nowrap hidden md:block">
                {{ t('login.multi-user.welcome') }}
              </h3>
              <p class="text-4xl md:text-2xl font-bold bg-gradient-to-r from-[#75D6FF] via-[#FFFFFF] to-[#FFFFFF] bg-clip-text text-transparent">
                {{ customAppName || 'AnythingLLM' }}
              </p>
            </div>
            <p class="text-sm text-theme-text-secondary text-center">
              {{ t('login.sign-in.start') }} {{ customAppName || 'AnythingLLM' }}
              {{ t('login.sign-in.end') }}
            </p>
          </div>
        </div>
        <div class="w-full px-4 md:px-12">
          <div class="w-full flex flex-col gap-y-4">
            <div class="w-screen md:w-full md:px-0 px-6">
              <input
                v-model="username"
                name="username"
                type="text"
                :placeholder="t('login.multi-user.placeholder-username')"
                class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder focus:outline-primary-button active:outline-primary-button outline-none text-sm rounded-md p-2.5 w-full h-[48px] md:w-[300px] md:h-[34px]"
                required
                autocomplete="off"
              />
            </div>
            <div class="w-screen md:w-full md:px-0 px-6">
              <input
                v-model="password"
                name="password"
                type="password"
                :placeholder="t('login.multi-user.placeholder-password')"
                class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder focus:outline-primary-button active:outline-primary-button outline-none text-sm rounded-md p-2.5 w-full h-[48px] md:w-[300px] md:h-[34px]"
                required
                autocomplete="off"
              />
            </div>
            <p v-if="error" class="text-red-400 text-sm">Error: {{ error }}</p>
          </div>
        </div>
        <div class="flex items-center md:p-12 px-10 mt-12 md:mt-0 space-x-2 border-gray-600 w-full flex-col gap-y-8">
          <button
            :disabled="loading"
            type="submit"
            class="md:text-primary-button md:bg-transparent text-dark-text text-sm font-bold focus:ring-4 focus:outline-none rounded-md border-[1.5px] border-primary-button md:h-[34px] h-[48px] md:hover:text-white md:hover:bg-primary-button bg-primary-button focus:z-10 w-full"
          >
            {{ loading ? t('login.multi-user.validating') : t('login.multi-user.login') }}
          </button>
          <button
            type="button"
            class="text-white text-sm flex gap-x-1 hover:text-primary-button hover:underline"
            @click="handleResetPassword"
          >
            {{ t('login.multi-user.forgot-pass') }}?
            <b>{{ t('login.multi-user.reset') }}</b>
          </button>
        </div>
      </div>
    </form>

    <ModalWrapper :is-open="isRecoveryCodeModalOpen" :no-portal="true">
      <RecoveryCodeModal
        :recovery-codes="recoveryCodes"
        @download-complete="handleDownloadComplete"
        @close="closeRecoveryCodeModal"
      />
    </ModalWrapper>
  </template>
</template>

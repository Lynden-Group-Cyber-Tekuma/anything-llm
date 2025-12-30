<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModal } from '@/composables/useModal'
import System from '@/models/system'
import { AUTH_TOKEN } from '@/utils/constants'
import paths from '@/utils/paths'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import RecoveryCodeModal from '@/components/Modals/DisplayRecoveryCodeModal/index.vue'

const { t } = useI18n()
const loading = ref(false)
const error = ref(null)
const recoveryCodes = ref([])
const downloadComplete = ref(false)
const token = ref(null)
const customAppName = ref(null)
const password = ref('')

const {
  isOpen: isRecoveryCodeModalOpen,
  openModal: openRecoveryCodeModal,
  closeModal: closeRecoveryCodeModal
} = useModal()

async function handleLogin() {
  error.value = null
  loading.value = true

  try {
    const { valid, token: authToken, message, recoveryCodes: codes } =
      await System.requestToken({ password: password.value })

    if (valid && authToken) {
      token.value = authToken
      if (codes) {
        recoveryCodes.value = codes
        openRecoveryCodeModal()
      } else {
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

watch([downloadComplete, token], ([complete, tokenVal]) => {
  if (complete && tokenVal) {
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
  <form @submit.prevent="handleLogin">
    <div class="flex flex-col justify-center items-center relative rounded-2xl bg-theme-bg-secondary md:shadow-[0_4px_14px_rgba(0,0,0,0.25)] md:px-12 py-12 -mt-36 md:-mt-10">
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
              v-model="password"
              name="password"
              type="password"
              placeholder="Password"
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

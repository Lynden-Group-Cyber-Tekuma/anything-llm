<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import useLoginMode from '@/hooks/useLoginMode'
import usePfp from '@/hooks/usePfp'
import useUser from '@/hooks/useUser'
import System from '@/models/system'
import paths from '@/utils/paths'
import { userFromStorage } from '@/utils/request'
import { PhPerson } from '@phosphor-icons/vue'
import AccountModal from '../AccountModal/index.vue'
import {
  AUTH_TIMESTAMP,
  AUTH_TOKEN,
  AUTH_USER,
  LAST_VISITED_WORKSPACE,
  USER_PROMPT_INPUT_MAP,
} from '@/utils/constants'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const mode = useLoginMode()
const { user } = useUser()
const menuRef = ref(null)
const buttonRef = ref(null)
const showMenu = ref(false)
const showAccountSettings = ref(false)
const supportEmail = ref('')

const handleClose = (event) => {
  if (
    menuRef.value &&
    !menuRef.value.contains(event.target) &&
    !buttonRef.value.contains(event.target)
  ) {
    showMenu.value = false
  }
}

const handleOpenAccountModal = () => {
  showAccountSettings.value = true
  showMenu.value = false
}

onMounted(async () => {
  const fetchedSupportEmail = await System.fetchSupportEmail()
  supportEmail.value = fetchedSupportEmail?.email
    ? `mailto:${fetchedSupportEmail.email}`
    : paths.mailToMintplex()
})

onMounted(() => {
  if (showMenu.value) {
    document.addEventListener('mousedown', handleClose)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClose)
})

const handleLogout = () => {
  window.localStorage.removeItem(AUTH_USER)
  window.localStorage.removeItem(AUTH_TOKEN)
  window.localStorage.removeItem(AUTH_TIMESTAMP)
  window.localStorage.removeItem(LAST_VISITED_WORKSPACE)
  window.localStorage.removeItem(USER_PROMPT_INPUT_MAP)
  window.location.replace(paths.home())
}
</script>

<template>
  <div v-if="mode !== null" class="absolute top-3 right-4 md:top-9 md:right-10 w-fit h-fit z-40">
    <button
      ref="buttonRef"
      @click="showMenu = !showMenu"
      type="button"
      class="uppercase transition-all duration-300 w-[35px] h-[35px] text-base font-semibold rounded-full flex items-center bg-theme-action-menu-bg hover:bg-theme-action-menu-item-hover justify-center text-white p-2 hover:border-slate-100 hover:border-opacity-50 border-transparent border"
    >
      <UserDisplay v-if="mode === 'multi'" />
      <Person v-else :size="14" />
    </button>

    <div
      v-if="showMenu"
      ref="menuRef"
      class="w-fit rounded-lg absolute top-12 right-0 bg-theme-action-menu-bg p-2 flex items-center-justify-center"
    >
      <div class="flex flex-col gap-y-2">
        <button
          v-if="mode === 'multi' && !!user"
          @click="handleOpenAccountModal"
          class="border-none text-white hover:bg-theme-action-menu-item-hover w-full text-left px-4 py-1.5 rounded-md"
        >
          {{ t('profile_settings.account') }}
        </button>
        <a
          :href="supportEmail"
          class="text-white hover:bg-theme-action-menu-item-hover w-full text-left px-4 py-1.5 rounded-md"
        >
          {{ t('profile_settings.support') }}
        </a>
        <button
          @click="handleLogout"
          type="button"
          class="text-white hover:bg-theme-action-menu-item-hover w-full text-left px-4 py-1.5 rounded-md"
        >
          {{ t('profile_settings.signout') }}
        </button>
      </div>
    </div>

    <AccountModal
      v-if="user && showAccountSettings"
      :user="user"
      :hideModal="() => showAccountSettings = false"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import usePfp from '@/hooks/usePfp'
import { userFromStorage } from '@/utils/request'

const UserDisplay = defineComponent({
  name: 'UserDisplay',
  setup() {
    const { pfp } = usePfp()
    const user = userFromStorage()

    return { pfp, user }
  },
  template: `
    <div v-if="pfp" class="w-[35px] h-[35px] rounded-full flex-shrink-0 overflow-hidden transition-all duration-300 bg-gray-100 hover:border-slate-100 hover:border-opacity-50 border-transparent border hover:opacity-60">
      <img
        :src="pfp"
        alt="User profile picture"
        class="w-full h-full object-cover"
      />
    </div>
    <template v-else>
      {{ user?.username?.slice(0, 2) || 'AA' }}
    </template>
  `
})

export { UserDisplay }
</script>

<script setup>
import { ref, onMounted, watch } from 'vue'
import paths from '@/utils/paths'
import useLogo from '@/hooks/useLogo'
import { PhHouse, PhList, PhRobot, PhFlask, PhGear, PhUserCircleGear, PhPencilSimpleLine, PhNut, PhToolbox,  } from '@phosphor-icons/vue'
import useUser from '@/hooks/useUser'
import { isMobile } from 'react-device-detect'
import Footer from '../Footer/index.vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Option from './MenuOption/index.vue'

const { t } = useI18n()
const { logo } = useLogo()
const { user } = useUser()
const sidebarRef = ref(null)
const showSidebar = ref(false)
const showBgOverlay = ref(false)

watch(showSidebar, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      showBgOverlay.value = true
    }, 300)
  } else {
    showBgOverlay.value = false
  }
})
</script>

<template>
  <!-- Mobile Layout -->
  <template v-if="isMobile">
    <div class="fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-4 py-2 bg-theme-bg-sidebar light:bg-white text-theme-text-secondary shadow-lg h-16">
      <button
        @click="showSidebar = true"
        class="rounded-md p-2 flex items-center justify-center text-theme-text-secondary"
      >
        <PhList class="h-6 w-6" />
      </button>
      <div class="flex items-center justify-center flex-grow">
        <img
          :src="logo"
          alt="Logo"
          class="block mx-auto h-6 w-auto"
          style="max-height: 40px; object-fit: contain"
        />
      </div>
      <div class="w-12"></div>
    </div>
    <div
      :style="{
        transform: showSidebar ? 'translateX(0vw)' : 'translateX(-100vw)',
      }"
      class="z-99 fixed top-0 left-0 transition-all duration-500 w-[100vw] h-[100vh]"
    >
      <div
        :class="[
          showBgOverlay
            ? 'transition-all opacity-1'
            : 'transition-none opacity-0',
          'duration-500 fixed top-0 left-0 bg-theme-bg-secondary bg-opacity-75 w-screen h-screen'
        ]"
        @click="showSidebar = false"
      />
      <div
        ref="sidebarRef"
        class="h-[100vh] fixed top-0 left-0 rounded-r-[26px] bg-theme-bg-sidebar w-[80%] p-[18px]"
      >
        <div class="w-full h-full flex flex-col overflow-x-hidden items-between">
          <!-- Header Information -->
          <div class="flex w-full items-center justify-between gap-x-4">
            <div class="flex shrink-1 w-fit items-center justify-start">
              <img
                :src="logo"
                alt="Logo"
                class="rounded w-full max-h-[40px]"
                style="object-fit: contain"
              />
            </div>
            <div class="flex gap-x-2 items-center text-slate-500 shrink-0">
              <a
                :href="paths.home()"
                class="transition-all duration-300 p-2 rounded-full text-white bg-theme-action-menu-bg hover:bg-theme-action-menu-item-hover hover:border-slate-100 hover:border-opacity-50 border-transparent border"
              >
                <PhHouse class="h-4 w-4" />
              </a>
            </div>
          </div>

          <!-- Primary Body -->
          <div class="h-full flex flex-col w-full justify-between pt-4 overflow-y-scroll no-scroll">
            <div class="h-auto md:sidebar-items">
              <div class="flex flex-col gap-y-4 pb-[60px] overflow-y-scroll no-scroll">
                <SidebarOptions :user="user" />
                <div class="h-[1.5px] bg-[#3D4147] mx-3 mt-[14px]" />
                <SupportEmail />
                <RouterLink
                  v-if="!(user?.hasOwnProperty('role') && user.role !== 'admin')"
                  :to="paths.settings.privacy()"
                  class="text-theme-text-secondary hover:text-white text-xs leading-[18px] mx-3"
                >
                  {{ t('settings.privacy') }}
                </RouterLink>
                <AppVersion />
              </div>
            </div>
          </div>
          <div class="absolute bottom-2 left-0 right-0 pt-2 bg-theme-bg-sidebar bg-opacity-80 backdrop-filter backdrop-blur-md">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- Desktop Layout -->
  <div v-else>
    <RouterLink
      :to="paths.home()"
      class="flex shrink-0 max-w-[55%] items-center justify-start mx-[38px] my-[18px]"
    >
      <img
        :src="logo"
        alt="Logo"
        class="rounded max-h-[24px]"
        style="object-fit: contain"
      />
    </RouterLink>
    <div
      ref="sidebarRef"
      class="transition-all duration-500 relative m-[16px] rounded-[16px] bg-theme-bg-sidebar border-[2px] border-theme-sidebar-border light:border-none min-w-[250px] p-[10px] h-[calc(100%-76px)]"
    >
      <div class="w-full h-full flex flex-col overflow-x-hidden items-between min-w-[235px]">
        <div class="text-theme-text-secondary text-sm font-medium uppercase mt-[4px] mb-0 ml-2">
          {{ t('settings.title') }}
        </div>
        <div class="relative h-[calc(100%-60px)] flex flex-col w-full justify-between pt-[10px] overflow-y-scroll no-scroll">
          <div class="h-auto sidebar-items">
            <div class="flex flex-col gap-y-2 pb-[60px] overflow-y-scroll no-scroll">
              <SidebarOptions :user="user" />
              <div class="h-[1.5px] bg-[#3D4147] mx-3 mt-[14px]" />
              <SupportEmail />
              <RouterLink
                v-if="!(user?.hasOwnProperty('role') && user.role !== 'admin')"
                :to="paths.settings.privacy()"
                class="text-theme-text-secondary hover:text-white hover:light:text-theme-text-primary text-xs leading-[18px] mx-3"
              >
                {{ t('settings.privacy') }}
              </RouterLink>
              <AppVersion />
            </div>
          </div>
        </div>
        <div class="absolute bottom-0 left-0 right-0 pt-4 pb-3 rounded-b-[16px] bg-theme-bg-sidebar bg-opacity-80 backdrop-filter backdrop-blur-md z-10">
          <Footer />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import System from '@/models/system'
import paths from '@/utils/paths'
import Option from './MenuOption/index.vue'
import showToast from '@/utils/toast'
import useAppVersion from '@/hooks/useAppVersion'
import { CanViewChatHistoryProvider, useCanViewChatHistory } from '../CanViewChatHistory/index.vue'
import { PhGear, PhUserCircleGear, PhRobot, PhPencilSimpleLine, PhToolbox, PhNut, PhFlask,  } from '@phosphor-icons/vue'

const SupportEmail = defineComponent({
  name: 'SupportEmail',
  setup() {
    const supportEmail = ref(paths.mailToMintplex())
    const { t } = useI18n()

    onMounted(async () => {
      const fetchedSupportEmail = await System.fetchSupportEmail()
      supportEmail.value = fetchedSupportEmail?.email
        ? `mailto:${fetchedSupportEmail.email}`
        : paths.mailToMintplex()
    })

    return { supportEmail, t }
  },
  template: `
    <RouterLink
      :to="supportEmail"
      class="text-theme-text-secondary hover:text-white hover:light:text-theme-text-primary text-xs leading-[18px] mx-3 mt-1"
    >
      {{ t('settings.contact') }}
    </RouterLink>
  `
})

const SidebarOptions = defineComponent({
  name: 'SidebarOptions',
  components: {
    CanViewChatHistoryProvider,
    Option,
    Gear,
    UserCircleGear,
    Robot,
    PencilSimpleLine,
    Toolbox,
    Nut,
    Flask,
    HoldToReveal
  },
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  setup() {
    const { t } = useI18n()
    return { t, paths }
  },
  template: `
    <CanViewChatHistoryProvider v-slot="{ viewable: canViewChatHistory }">
      <Option
        :btnText="t('settings.ai-providers')"
        :icon="Gear"
        :href="paths.settings.llmPreference()"
        :user="user"
        :childOptions="[
          {
            btnText: t('settings.llm'),
            href: paths.settings.llmPreference(),
            flex: true,
            roles: ['admin'],
          },
          {
            btnText: t('settings.vector-database'),
            href: paths.settings.vectorDatabase(),
            flex: true,
            roles: ['admin'],
          },
          {
            btnText: t('settings.embedder'),
            href: paths.settings.embedder.modelPreference(),
            flex: true,
            roles: ['admin'],
          },
          {
            btnText: t('settings.text-splitting'),
            href: paths.settings.embedder.chunkingPreference(),
            flex: true,
            roles: ['admin'],
          },
          {
            btnText: t('settings.voice-speech'),
            href: paths.settings.audioPreference(),
            flex: true,
            roles: ['admin'],
          },
          {
            btnText: t('settings.transcription'),
            href: paths.settings.transcriptionPreference(),
            flex: true,
            roles: ['admin'],
          },
        ]"
      />
      <Option
        :btnText="t('settings.admin')"
        :icon="UserCircleGear"
        :href="paths.settings.users()"
        :user="user"
        :childOptions="[
          {
            btnText: t('settings.users'),
            href: paths.settings.users(),
            roles: ['admin', 'manager'],
          },
          {
            btnText: t('settings.workspaces'),
            href: paths.settings.workspaces(),
            roles: ['admin', 'manager'],
          },
          {
            hidden: !canViewChatHistory,
            btnText: t('settings.workspace-chats'),
            href: paths.settings.chats(),
            flex: true,
            roles: ['admin', 'manager'],
          },
          {
            btnText: t('settings.invites'),
            href: paths.settings.invites(),
            roles: ['admin', 'manager'],
          },
          {
            btnText: 'Default System Prompt',
            href: paths.settings.defaultSystemPrompt(),
            flex: true,
            roles: ['admin'],
          },
        ]"
      />
      <Option
        :btnText="t('settings.agent-skills')"
        :icon="Robot"
        :href="paths.settings.agentSkills()"
        :user="user"
        :flex="true"
        :roles="['admin']"
      />
      <Option
        :btnText="t('settings.customization')"
        :icon="PencilSimpleLine"
        :href="paths.settings.interface()"
        :user="user"
        :childOptions="[
          {
            btnText: t('settings.interface'),
            href: paths.settings.interface(),
            flex: true,
            roles: ['admin', 'manager'],
          },
          {
            btnText: t('settings.branding'),
            href: paths.settings.branding(),
            flex: true,
            roles: ['admin', 'manager'],
          },
          {
            btnText: t('settings.chat'),
            href: paths.settings.chat(),
            flex: true,
            roles: ['admin', 'manager'],
          },
        ]"
      />
      <Option
        :btnText="t('settings.tools')"
        :icon="Toolbox"
        :href="paths.settings.embedChatWidgets()"
        :user="user"
        :childOptions="[
          {
            hidden: !canViewChatHistory,
            btnText: t('settings.embeds'),
            href: paths.settings.embedChatWidgets(),
            flex: true,
            roles: ['admin'],
          },
          {
            btnText: t('settings.event-logs'),
            href: paths.settings.logs(),
            flex: true,
            roles: ['admin'],
          },
          {
            btnText: t('settings.api-keys'),
            href: paths.settings.apiKeys(),
            flex: true,
            roles: ['admin'],
          },
          {
            btnText: t('settings.system-prompt-variables'),
            href: paths.settings.systemPromptVariables(),
            flex: true,
            roles: ['admin'],
          },
          {
            btnText: t('settings.browser-extension'),
            href: paths.settings.browserExtension(),
            flex: true,
            roles: ['admin', 'manager'],
          },
        ]"
      />
      <Option
        :btnText="t('settings.security')"
        :icon="Nut"
        :href="paths.settings.security()"
        :user="user"
        :flex="true"
        :roles="['admin', 'manager']"
        :hidden="!!user?.role"
      />
      <HoldToReveal key="exp_features">
        <Option
          :btnText="t('settings.experimental-features')"
          :icon="Flask"
          :href="paths.settings.experimental()"
          :user="user"
          :flex="true"
          :roles="['admin']"
        />
      </HoldToReveal>
    </CanViewChatHistoryProvider>
  `
})

const HoldToReveal = defineComponent({
  name: 'HoldToReveal',
  props: {
    holdForMs: {
      type: Number,
      default: 3000
    }
  },
  setup(props) {
    let timeout = null
    const showing = ref(
      window.localStorage.getItem(
        'anythingllm_experimental_feature_preview_unlocked'
      )
    )

    onMounted(() => {
      const onPress = (e) => {
        if (!['Control', 'Meta'].includes(e.key) || timeout !== null) return
        timeout = setTimeout(() => {
          showing.value = true
          showToast('Experimental feature previews unlocked!')
          window.localStorage.setItem(
            'anythingllm_experimental_feature_preview_unlocked',
            'enabled'
          )
          window.removeEventListener('keypress', onPress)
          window.removeEventListener('keyup', onRelease)
          clearTimeout(timeout)
        }, props.holdForMs)
      }
      const onRelease = (e) => {
        if (!['Control', 'Meta'].includes(e.key)) return
        if (showing.value) {
          window.removeEventListener('keypress', onPress)
          window.removeEventListener('keyup', onRelease)
          clearTimeout(timeout)
          return
        }
        clearTimeout(timeout)
      }

      if (!showing.value) {
        window.addEventListener('keydown', onPress)
        window.addEventListener('keyup', onRelease)
      }

      onUnmounted(() => {
        window.removeEventListener('keydown', onPress)
        window.removeEventListener('keyup', onRelease)
      })
    })

    return { showing }
  },
  template: `
    <template v-if="showing">
      <slot />
    </template>
  `
})

const AppVersion = defineComponent({
  name: 'AppVersion',
  setup() {
    const { version, isLoading } = useAppVersion()
    return { version, isLoading }
  },
  template: `
    <a
      v-if="!isLoading"
      :href="\`https://github.com/Mintplex-Labs/anything-llm/releases/tag/v\${version}\`"
      target="_blank"
      rel="noreferrer"
      class="text-theme-text-secondary light:opacity-80 opacity-50 text-xs mx-3"
    >
      v{{ version }}
    </a>
  `
})

export { SupportEmail, SidebarOptions, HoldToReveal, AppVersion }
</script>

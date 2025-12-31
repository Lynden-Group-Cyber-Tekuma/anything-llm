<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { PhList, PhPlus } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'
import paths from '@/utils/paths'
import { useAuthStore } from '@/stores/auth'
import { useLogoStore } from '@/stores/logo'
import { useSidebarToggle } from './SidebarToggle/index.vue'
import SearchBox from './SearchBox/index.vue'
import ActiveWorkspaces from './ActiveWorkspaces/index.vue'
import Footer from '../Footer/index.vue'
import SettingsButton from '../SettingsButton/index.vue'

// Composable for NewWorkspace modal management
function useNewWorkspaceModal() {
  const showing = ref(false)
  const showModal = () => {
    showing.value = true
  }
  const hideModal = () => {
    showing.value = false
  }
  return { showing, showModal, hideModal }
}

// Setup
const authStore = useAuthStore()
const logoStore = useLogoStore()
const { t } = useI18n()

const sidebarRef = ref(null)
const { showSidebar, setShowSidebar, canToggleSidebar } = useSidebarToggle()
const { showing: showingNewWsModal, showModal: showNewWsModal, hideModal: hideNewWsModal } = useNewWorkspaceModal()

const user = computed(() => authStore.user)
const logo = computed(() => logoStore.logo)
</script>

<template>
  <div>
    <!-- Desktop Sidebar -->
    <div
      :style="{
        width: showSidebar ? '292px' : '0px',
        paddingLeft: showSidebar ? '0px' : '16px'
      }"
      class="transition-all duration-500"
    >
      <div class="flex shrink-0 w-full justify-center my-[18px]">
        <div class="flex justify-between w-[250px] min-w-[250px]">
          <RouterLink :to="paths.home()" aria-label="Home">
            <img
              :src="logo"
              alt="Logo"
              :class="[
                'rounded max-h-[24px] object-contain transition-opacity duration-500',
                showSidebar ? 'opacity-100' : 'opacity-0'
              ]"
            />
          </RouterLink>
          <SidebarToggle
            v-if="canToggleSidebar"
            :showSidebar="showSidebar"
            :setShowSidebar="setShowSidebar"
          />
        </div>
      </div>
      <div
        ref="sidebarRef"
        class="relative m-[16px] rounded-[16px] bg-theme-bg-sidebar border-[2px] border-theme-sidebar-border light:border-none min-w-[250px] p-[10px] h-[calc(100%-76px)]"
      >
        <div class="flex flex-col h-full overflow-x-hidden">
          <div class="flex-grow flex flex-col min-w-[235px]">
            <div class="relative h-[calc(100%-60px)] flex flex-col w-full justify-between pt-[10px] overflow-y-scroll no-scroll">
              <div class="flex flex-col gap-y-2 pb-[60px] gap-y-[14px] overflow-y-scroll no-scroll">
                <SearchBox :user="user" :showNewWsModal="showNewWsModal" />
                <ActiveWorkspaces />
              </div>
            </div>
            <div class="absolute bottom-0 left-0 right-0 pt-4 pb-3 rounded-b-[16px] bg-theme-bg-sidebar bg-opacity-80 backdrop-filter backdrop-blur-md z-1">
              <Footer />
            </div>
          </div>
        </div>
      </div>
      <!-- Note: NewWorkspaceModal needs to be converted from React to Vue -->
      <!-- <NewWorkspaceModal v-if="showingNewWsModal" :hideModal="hideNewWsModal" /> -->
    </div>
  </div>
</template>

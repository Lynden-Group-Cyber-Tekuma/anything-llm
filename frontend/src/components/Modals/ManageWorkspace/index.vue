<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { PhX } from '@phosphor-icons/vue'
import Workspace from '@/models/workspace'
import System from '@/models/system'
import { useDisplay } from '@/composables/useDisplay'
import { useAuthStore } from '@/stores/auth'
import DocumentSettings from './Documents/index.vue'
import DataConnectors from './DataConnectors/index.vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'

const props = defineProps({
  hideModal: {
    type: Function,
    default: () => {}
  },
  providedSlug: {
    type: String,
    default: null
  }
})

const { t } = useI18n()
const route = useRoute()
const { isMobile } = useDisplay()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const workspace = ref(null)
const settings = ref({})
const selectedTab = ref('documents')

onMounted(async () => {
  const _settings = await System.keys()
  settings.value = _settings ?? {}

  const slug = props.providedSlug ?? route.params.slug
  const ws = await Workspace.bySlug(slug)
  workspace.value = ws
})
</script>

<template>
  <ModalWrapper v-if="isMobile && workspace" :isOpen="true">
    <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            {{ t('connectors.manage.editing') }} "{{ workspace.name }}"
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
        <div class="py-7 px-9 space-y-2 flex-col">
          <p class="text-white">
            {{ t('connectors.manage.desktop-only') }}
          </p>
        </div>
      </div>
      <div class="flex w-full justify-end items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
        <button
          @click="hideModal"
          type="button"
          class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
        >
          {{ t('connectors.manage.dismiss') }}
        </button>
      </div>
    </div>
  </ModalWrapper>

  <div v-else-if="workspace" class="w-screen h-screen fixed top-0 left-0 flex justify-center items-center z-99">
    <div class="backdrop h-full w-full absolute top-0 z-10" />
    <div class="absolute max-h-full w-fit transition duration-300 z-20 md:overflow-y-auto py-10">
      <div class="relative bg-theme-bg-secondary rounded-[12px] shadow border-2 border-theme-modal-border">
        <div class="flex items-start justify-between p-2 rounded-t border-theme-modal-border relative">
          <button
            @click="hideModal"
            type="button"
            class="z-29 text-white bg-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center bg-sidebar-button hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
          >
            <PhX :size="20" weight="bold" class="text-white" />
          </button>
        </div>

        <ModalTabSwitcher
          v-if="user?.role !== 'default'"
          :selectedTab="selectedTab"
          @update:selectedTab="selectedTab = $event"
        />

        <DocumentSettings
          v-if="selectedTab === 'documents'"
          :workspace="workspace"
          :systemSettings="settings"
        />
        <DataConnectors
          v-else
          :workspace="workspace"
          :systemSettings="settings"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

// ModalTabSwitcher sub-component
const ModalTabSwitcher = {
  name: 'ModalTabSwitcher',
  props: {
    selectedTab: String
  },
  emits: ['update:selectedTab'],
  setup(props, { emit }) {
    const { t } = useI18n()

    return {
      t,
      setTab: (tab) => emit('update:selectedTab', tab)
    }
  },
  template: `
    <div class="w-full flex justify-center z-10 relative">
      <div class="gap-x-2 flex justify-center -mt-[68px] mb-10 bg-theme-bg-secondary p-1 rounded-xl shadow border-2 border-theme-modal-border w-fit">
        <button
          @click="setTab('documents')"
          :class="[
            'border-none px-4 py-2 rounded-[8px] font-semibold hover:bg-theme-modal-border hover:bg-opacity-60',
            selectedTab === 'documents'
              ? 'bg-theme-modal-border font-bold text-white light:bg-[#E0F2FE] light:text-[#026AA2]'
              : 'text-white/20 font-medium hover:text-white light:bg-white light:text-[#535862] light:hover:bg-[#E0F2FE]'
          ]"
        >
          {{ t('connectors.manage.documents') }}
        </button>
        <button
          @click="setTab('dataConnectors')"
          :class="[
            'border-none px-4 py-2 rounded-[8px] font-semibold hover:bg-theme-modal-border hover:bg-opacity-60',
            selectedTab === 'dataConnectors'
              ? 'bg-theme-modal-border font-bold text-white light:bg-[#E0F2FE] light:text-[#026AA2]'
              : 'text-white/20 font-medium hover:text-white light:bg-white light:text-[#535862] light:hover:bg-[#E0F2FE]'
          ]"
        >
          {{ t('connectors.manage.data-connectors') }}
        </button>
      </div>
    </div>
  `
}

// Composable: useManageWorkspaceModal
export function useManageWorkspaceModal() {
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)
  const showing = ref(false)

  function showModal() {
    if (user.value?.role !== 'default') {
      showing.value = true
    }
  }

  function hideModal() {
    showing.value = false
  }

  function onEscape(event) {
    if (!showing.value || event.key !== 'Escape') return
    showing.value = false
  }

  onMounted(() => {
    document.addEventListener('keydown', onEscape)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', onEscape)
  })

  return { showing, showModal, hideModal }
}
</script>

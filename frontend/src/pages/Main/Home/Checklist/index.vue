<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import ChecklistItem from './ChecklistItem/index.vue'
import ManageWorkspace, { useManageWorkspaceModal } from '@/components/Modals/ManageWorkspace'
import NewWorkspaceModal, { useNewWorkspaceModal } from '@/components/Modals/NewWorkspace'
import Workspace from '@/models/workspace'
import showToast from '@/utils/toast'
import {
  CHECKLIST_HIDDEN,
  CHECKLIST_STORAGE_KEY,
  CHECKLIST_ITEMS,
  CHECKLIST_UPDATED_EVENT,
} from './constants'
import ConfettiExplosion from 'react-confetti-explosion'
import { safeJsonParse } from '@/utils/request'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const loading = ref(true)
const isHidden = ref(false)
const completedCount = ref(0)
const isCompleted = ref(false)
const selectedWorkspace = ref(null)
const workspaces = ref([])
const containerRef = ref(null)
const {
  showModal: showNewWsModal,
  hideModal: hideNewWsModal,
  showing: showingNewWsModal,
} = useNewWorkspaceModal()
const { showModal: showManageWsModal, hideModal: hideManageWsModal } =
  useManageWorkspaceModal()

const createItemHandler = (item) => {
  return () =>
    item.handler({
      workspaces: workspaces.value,
      navigate: router.push,
      setSelectedWorkspace: (ws) => { selectedWorkspace.value = ws },
      showManageWsModal,
      showToast,
      showNewWsModal,
    })
}

const evaluateChecklist = () => {
  try {
    const checklist = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
    if (!checklist) return
    const completedItems = safeJsonParse(checklist, {})
    completedCount.value = Object.keys(completedItems).length
    isCompleted.value =
      Object.keys(completedItems).length === CHECKLIST_ITEMS().length
  } catch (error) {
    console.error(error)
  }
}

const handleClose = () => {
  window.localStorage.setItem(CHECKLIST_HIDDEN, 'true')
  if (containerRef.value) containerRef.value.style.height = '0px'
}

onMounted(async () => {
  try {
    const hidden = window.localStorage.getItem(CHECKLIST_HIDDEN)
    isHidden.value = !!hidden
    // If the checklist is hidden, don't bother evaluating it.
    if (hidden) return

    // If the checklist is completed then dont continue and just show the completed state.
    const checklist = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
    const existingChecklist = checklist ? safeJsonParse(checklist, {}) : {}
    const completed =
      Object.keys(existingChecklist).length === CHECKLIST_ITEMS().length
    isCompleted.value = completed
    if (completed) return

    // Otherwise, we can fetch workspaces for our checklist tasks as well
    // as determine if the create_workspace task is completed for pre-checking.
    const ws = await Workspace.all()
    workspaces.value = ws
    if (ws.length > 0) {
      existingChecklist['create_workspace'] = true
      window.localStorage.setItem(
        CHECKLIST_STORAGE_KEY,
        JSON.stringify(existingChecklist)
      )
    }

    evaluateChecklist() // Evaluate checklist on mount.
    window.addEventListener(CHECKLIST_UPDATED_EVENT, evaluateChecklist)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener(CHECKLIST_UPDATED_EVENT, evaluateChecklist)
})

// Fetch workspaces periodically
onMounted(async () => {
  const fetchWorkspaces = async () => {
    const ws = await Workspace.all()
    workspaces.value = ws
  }
  await fetchWorkspaces()
})

watch(isCompleted, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      handleClose()
    }, 5000)
  }
})
</script>

<template>
  <div
    v-if="!isHidden && !loading"
    ref="containerRef"
    class="transition-height duration-300 h-[100%] overflow-y-hidden relative"
  >
    <div
      :class="`${isCompleted ? 'checklist-completed' : 'hidden'} absolute top-0 left-0 w-full h-full p-2 z-10 transition-all duration-300`"
    >
      <div v-if="isCompleted" class="flex w-full items-center justify-center">
        <ConfettiExplosion :force="0.25" :duration="3000" />
      </div>
      <div
        class="bg-[rgba(54,70,61,0.5)] light:bg-[rgba(216,243,234,0.5)] w-full h-full flex items-center justify-center bg-theme-checklist-item-completed-bg/50 rounded-lg"
      >
        <p class="text-theme-checklist-item-completed-text text-lg font-bold">
          {{ t('main-page.checklist.completed') }}
        </p>
      </div>
    </div>

    <div
      :class="`rounded-lg p-4 lg:p-6 bg-theme-home-bg-card relative ${isCompleted ? 'blur-sm' : ''}`"
    >
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-x-3">
          <h1 class="text-theme-home-text uppercase text-sm font-semibold">
            {{ t('main-page.checklist.title') }}
          </h1>
          <p
            v-if="CHECKLIST_ITEMS().length - completedCount > 0"
            class="text-theme-home-text-secondary text-xs"
          >
            {{ CHECKLIST_ITEMS().length - completedCount }}
            {{ t('main-page.checklist.tasksLeft') }}
          </p>
        </div>

        <div class="flex items-center gap-x-2">
          <button
            @click="handleClose"
            class="text-theme-home-text-secondary bg-theme-home-bg-button px-3 py-1 rounded-xl hover:bg-white/10 transition-colors text-xs light:bg-black-100"
          >
            {{ t('main-page.checklist.dismiss') }}
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ChecklistItem
          v-for="item in CHECKLIST_ITEMS()"
          :key="item.id"
          :id="item.id"
          :title="item.title"
          :action="item.action"
          :icon="item.icon"
          :completed="item.completed"
          :on-action="createItemHandler(item)"
        />
      </div>
    </div>
    <NewWorkspaceModal v-if="showingNewWsModal" :hide-modal="hideNewWsModal" />
    <ManageWorkspace
      v-if="selectedWorkspace"
      :provided-slug="selectedWorkspace.slug"
      :hide-modal="() => {
        selectedWorkspace = null
        hideManageWsModal()
      }"
    />
  </div>
</template>

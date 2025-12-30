<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Workspace from '@/models/workspace'
import paths from '@/utils/paths'
import showToast from '@/utils/toast'
import { GearSix, UploadSimple, DotsSixVertical } from '@phosphor-icons/vue'
import { useAuthStore } from '@/stores/auth'
import ThreadContainer from './ThreadContainer/index.vue'
// Note: For drag-and-drop, install 'sortablejs-vue3' or 'vue-draggable-next'
// import draggable from 'vuedraggable' // or from 'sortablejs-vue3'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const workspaces = ref([])
const selectedWs = ref(null)
const showing = ref(false)

const slug = computed(() => route.params.slug)
const user = computed(() => authStore.user)

const isInWorkspaceSettings = computed(() => {
  return route.path.includes('/workspace/') && route.path.includes('/settings/')
})

// Modal management functions
function showModal() {
  if (user.value?.role !== 'default') {
    showing.value = true
  }
}

function hideModal() {
  showing.value = false
}

// Fetch workspaces
async function getWorkspaces() {
  const fetchedWorkspaces = await Workspace.all()
  loading.value = false
  workspaces.value = Workspace.orderWorkspaces(fetchedWorkspaces)
}

// Reorder workspaces
function reorderWorkspaces(startIndex, endIndex) {
  const reorderedWorkspaces = Array.from(workspaces.value)
  const [removed] = reorderedWorkspaces.splice(startIndex, 1)
  reorderedWorkspaces.splice(endIndex, 0, removed)
  workspaces.value = reorderedWorkspaces
  const success = Workspace.storeWorkspaceOrder(
    reorderedWorkspaces.map((w) => w.id)
  )
  if (!success) {
    showToast('Failed to reorder workspaces', 'error')
    Workspace.all().then((workspaces) => {
      workspaces.value = workspaces
    })
  }
}

// Drag and drop handler
function onDragEnd(event) {
  if (!event.newIndex && event.newIndex !== 0) return
  reorderWorkspaces(event.oldIndex, event.newIndex)
}

// Navigate to workspace settings
function navigateToSettings(workspace) {
  if (isInWorkspaceSettings.value) {
    router.push(paths.workspace.chat(workspace.slug))
  } else {
    router.push(paths.workspace.settings.generalAppearance(workspace.slug))
  }
}

onMounted(() => {
  getWorkspaces()
})
</script>

<template>
  <!-- Loading Skeleton -->
  <div v-if="loading" class="flex flex-col gap-y-2">
    <div
      v-for="i in 5"
      :key="i"
      class="h-10 w-full rounded animate-pulse"
      style="background-color: var(--theme-sidebar-item-default)"
    />
  </div>

  <!-- Workspace List -->
  <!--
    Note: To enable drag-and-drop, install 'sortablejs-vue3' or 'vue-draggable-next'
    Then wrap the workspaces list with <draggable> component
  -->
  <div v-else role="list" aria-label="Workspaces" class="flex flex-col gap-y-2">
    <div
      v-for="(workspace, index) in workspaces"
      :key="workspace.id"
      class="flex flex-col w-full group"
      role="listitem"
    >
      <div class="flex gap-x-2 items-center justify-between">
        <a
          :href="workspace.slug === slug ? null : paths.workspace.chat(workspace.slug)"
          :title="workspace.name"
          :aria-current="workspace.slug === slug ? 'page' : undefined"
          :class="[
            'transition-all duration-[200ms]',
            'flex flex-grow w-[75%] gap-x-2 py-[6px] pl-[4px] pr-[6px] rounded-[4px] text-white justify-start items-center',
            'bg-theme-sidebar-item-default',
            'hover:bg-theme-sidebar-subitem-hover hover:font-bold',
            workspace.slug === slug
              ? 'bg-theme-sidebar-item-selected font-bold light:outline-2 light:outline light:outline-blue-400 light:outline-offset-[-2px]'
              : ''
          ]"
        >
          <div class="flex flex-row justify-between w-full items-center">
            <!-- Drag Handle -->
            <div class="cursor-grab mr-[3px]">
              <DotsSixVertical
                :size="20"
                color="var(--theme-sidebar-item-workspace-active)"
                weight="bold"
              />
            </div>

            <!-- Workspace Name -->
            <div class="flex items-center space-x-2 overflow-hidden flex-grow">
              <div class="w-[130px] overflow-hidden">
                <p
                  :class="[
                    'text-[14px] leading-loose whitespace-nowrap overflow-hidden text-white truncate w-full',
                    'group-hover:w-[130px] group-hover:font-bold group-hover:duration-200',
                    workspace.slug === slug ? 'font-bold' : 'font-medium'
                  ]"
                >
                  {{ workspace.name }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div
              v-if="user?.role !== 'default'"
              :class="[
                'flex items-center gap-x-[2px] transition-opacity duration-200',
                workspace.slug === slug ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              ]"
            >
              <!-- Upload Button -->
              <button
                type="button"
                @click.prevent="() => { selectedWs = workspace; showModal(); }"
                class="border-none rounded-md flex items-center justify-center ml-auto p-[2px] hover:bg-[#646768] text-[#A7A8A9] hover:text-white"
              >
                <UploadSimple class="h-[20px] w-[20px]" />
              </button>

              <!-- Settings Button -->
              <button
                @click.prevent.stop="navigateToSettings(workspace)"
                class="rounded-md flex items-center justify-center text-[#A7A8A9] hover:text-white ml-auto p-[2px] hover:bg-[#646768]"
                aria-label="General appearance settings"
              >
                <GearSix
                  :color="isInWorkspaceSettings && workspace.slug === slug ? '#46C8FF' : undefined"
                  class="h-[20px] w-[20px]"
                />
              </button>
            </div>
          </div>
        </a>
      </div>

      <!-- Thread Container -->
      <ThreadContainer
        v-if="workspace.slug === slug"
        :workspace="workspace"
        :isActive="workspace.slug === slug"
      />
    </div>

    <!-- ManageWorkspace Modal Placeholder -->
    <!-- Note: ManageWorkspace modal needs to be converted from React to Vue -->
    <!-- <ManageWorkspace v-if="showing" :hideModal="hideModal" :providedSlug="selectedWs?.slug" /> -->
  </div>
</template>

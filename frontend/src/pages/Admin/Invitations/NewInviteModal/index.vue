<script setup>
import { ref, watch, onMounted } from 'vue'
import { X, Copy, Check } from '@phosphor-icons/vue'
import Admin from '@/models/admin'
import Workspace from '@/models/workspace'
import showToast from '@/utils/toast'

const props = defineProps({
  closeModal: {
    type: Function,
    required: true
  },
  onSuccess: {
    type: Function,
    required: true
  }
})

const invite = ref(null)
const error = ref(null)
const copied = ref(false)
const workspaces = ref([])
const selectedWorkspaceIds = ref([])

const handleCreate = async (e) => {
  error.value = null
  e.preventDefault()

  const { invite: newInvite, error: err } = await Admin.newInvite({
    role: null,
    workspaceIds: selectedWorkspaceIds.value
  })

  if (!!newInvite) {
    invite.value = newInvite
    props.onSuccess()
  }
  error.value = err
}

const copyInviteLink = () => {
  if (!invite.value) return false
  window.navigator.clipboard.writeText(
    `${window.location.origin}/accept-invite/${invite.value.code}`
  )
  copied.value = true
  showToast('Invite link copied to clipboard', 'success', {
    clear: true
  })
}

const handleWorkspaceSelection = (workspaceId) => {
  if (selectedWorkspaceIds.value.includes(workspaceId)) {
    const updated = selectedWorkspaceIds.value.filter((id) => id !== workspaceId)
    selectedWorkspaceIds.value = updated
    return
  }
  selectedWorkspaceIds.value = [...selectedWorkspaceIds.value, workspaceId]
}

watch(copied, (newValue) => {
  if (!newValue) return
  setTimeout(() => {
    copied.value = false
  }, 3000)
})

onMounted(async () => {
  try {
    const _workspaces = await Workspace.all()
    workspaces.value = _workspaces
  } catch {
    workspaces.value = []
  }
})
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
    <div class="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            Create new invite
          </h3>
        </div>
        <button
          @click="closeModal"
          type="button"
          class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
        >
          <X :size="24" weight="bold" class="text-white" />
        </button>
      </div>
      <div class="p-6">
        <form @submit="handleCreate">
          <div class="space-y-4">
            <p v-if="error" class="text-red-400 text-sm">Error: {{ error }}</p>
            <div v-if="invite" class="relative">
              <input
                type="url"
                :value="`${window.location.origin}/accept-invite/${invite.code}`"
                disabled
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg outline-none block w-full p-2.5 pr-10"
              />
              <button
                type="button"
                @click="copyInviteLink"
                :disabled="copied"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-theme-modal-border transition-all duration-300"
              >
                <Check
                  v-if="copied"
                  :size="20"
                  class="text-green-400"
                  weight="bold"
                />
                <Copy
                  v-else
                  :size="20"
                  class="text-white"
                  weight="bold"
                />
              </button>
            </div>
            <p class="text-white text-opacity-60 text-xs md:text-sm">
              After creation you will be able to copy the invite and send it
              to a new user where they can create an account as the{" "}
              <b>default</b> role and automatically be added to workspaces
              selected.
            </p>
          </div>

          <div v-if="workspaces.length > 0 && !invite" class="mt-6">
            <div class="w-full">
              <div class="flex flex-col gap-y-1 mb-2">
                <label
                  for="workspaces"
                  class="block text-sm font-medium text-white"
                >
                  Auto-add invitee to workspaces
                </label>
                <p class="text-white text-opacity-60 text-xs">
                  You can optionally automatically assign the user to the
                  workspaces below by selecting them. By default, the user
                  will not have any workspaces visible. You can assign
                  workspaces later post-invite acceptance.
                </p>
              </div>

              <div class="flex flex-col gap-y-2 mt-2">
                <WorkspaceOption
                  v-for="workspace in workspaces"
                  :key="workspace.id"
                  :workspace="workspace"
                  :selected="selectedWorkspaceIds.includes(workspace.id)"
                  :toggle-selection="handleWorkspaceSelection"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end items-center mt-6 pt-6 border-t border-theme-modal-border">
            <template v-if="!invite">
              <button
                @click="closeModal"
                type="button"
                class="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
              >
                Create Invite
              </button>
            </template>
            <button
              v-else
              @click="closeModal"
              type="button"
              class="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
// WorkspaceOption component
export const WorkspaceOption = {
  name: 'WorkspaceOption',
  props: {
    workspace: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      required: true
    },
    toggleSelection: {
      type: Function,
      required: true
    }
  },
  template: `
    <button
      type="button"
      @click="() => toggleSelection(workspace.id)"
      :class="[
        'transition-all duration-300 w-full h-11 p-2.5 rounded-lg flex justify-start items-center gap-2.5 cursor-pointer border',
        selected
          ? 'border-theme-sidebar-item-workspace-active bg-theme-bg-secondary'
          : 'border-theme-sidebar-border',
        'hover:border-theme-sidebar-border hover:bg-theme-bg-secondary'
      ]"
    >
      <input
        type="radio"
        name="workspace"
        :value="workspace.id"
        :checked="selected"
        class="hidden"
      />
      <div
        :class="[
          'w-4 h-4 rounded-full border-2 border-theme-sidebar-border mr-2',
          selected ? 'bg-[var(--theme-sidebar-item-workspace-active)]' : ''
        ]"
      ></div>
      <div class="text-theme-text-primary text-sm font-medium font-['Plus Jakarta Sans'] leading-tight">
        {{ workspace.name }}
      </div>
    </button>
  `
}
</script>

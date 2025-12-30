<script setup>
import { ref, onMounted, watch, defineComponent, h } from 'vue'
import { useIsAgentSessionActive } from '@/utils/chat/agent'
import AddPresetModal from './AddPresetModal.vue'
import EditPresetModal from './EditPresetModal.vue'
import { useModal } from '@/hooks/useModal'
import System from '@/models/system'
import { DotsThree, Plus } from '@phosphor-icons/vue'
import showToast from '@/utils/toast'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PublishEntityModal from '@/components/CommunityHub/PublishEntityModal'

export const CMD_REGEX = new RegExp(/[^a-zA-Z0-9_-]/g)

const props = defineProps({
  setShowing: Function,
  sendCommand: Function,
  promptRef: Object
})

const { t } = useI18n()
const isActiveAgentSession = useIsAgentSessionActive()
const route = useRoute()

const {
  isOpen: isAddModalOpen,
  openModal: openAddModal,
  closeModal: closeAddModal,
} = useModal()
const {
  isOpen: isEditModalOpen,
  openModal: openEditModal,
  closeModal: closeEditModal,
} = useModal()
const {
  isOpen: isPublishModalOpen,
  openModal: openPublishModal,
  closeModal: closePublishModal,
} = useModal()

const presets = ref([])
const selectedPreset = ref(null)
const presetToPublish = ref(null)

onMounted(() => {
  fetchPresets()

  // Check URL params to auto-open add modal
  if (
    route.query.action === 'open-new-slash-command-modal' &&
    !isAddModalOpen.value
  ) {
    openAddModal()
  }
})

const fetchPresets = async () => {
  const fetchedPresets = await System.getSlashCommandPresets()
  presets.value = fetchedPresets
}

const handleSavePreset = async (preset) => {
  const { error } = await System.createSlashCommandPreset(preset)
  if (!!error) {
    showToast(error, 'error')
    return false
  }

  fetchPresets()
  closeAddModal()
  return true
}

const handleEditPreset = (preset) => {
  selectedPreset.value = preset
  openEditModal()
}

const handleUpdatePreset = async (updatedPreset) => {
  const { error } = await System.updateSlashCommandPreset(
    updatedPreset.id,
    updatedPreset
  )

  if (!!error) {
    showToast(error, 'error')
    return
  }

  fetchPresets()
  closeEditModalAndResetPreset()
}

const handleDeletePreset = async (presetId) => {
  await System.deleteSlashCommandPreset(presetId)
  fetchPresets()
  closeEditModalAndResetPreset()
}

const closeEditModalAndResetPreset = () => {
  closeEditModal()
  selectedPreset.value = null
}

const handlePublishPreset = (preset) => {
  presetToPublish.value = {
    name: preset.command.slice(1),
    description: preset.description,
    command: preset.command,
    prompt: preset.prompt,
  }
  openPublishModal()
}

// PresetItem component
const PresetItem = defineComponent({
  props: {
    preset: Object,
    onUse: Function,
    onEdit: Function,
    onPublish: Function
  },
  setup(props) {
    const showMenu = ref(false)
    const menuRef = ref(null)
    const menuButtonRef = ref(null)

    const handleClickOutside = (event) => {
      if (
        showMenu.value &&
        menuRef.value &&
        !menuRef.value.contains(event.target) &&
        menuButtonRef.value &&
        !menuButtonRef.value.contains(event.target)
      ) {
        showMenu.value = false
      }
    }

    watch(showMenu, (newVal) => {
      if (newVal) {
        document.addEventListener('mousedown', handleClickOutside)
      } else {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    })

    onUnmounted(() => {
      document.removeEventListener('mousedown', handleClickOutside)
    })

    return () => h('button', {
      type: 'button',
      'data-slash-command': props.preset.command,
      onClick: props.onUse,
      class: 'border-none w-full hover:cursor-pointer hover:bg-theme-action-menu-item-hover px-2 py-2 rounded-xl flex flex-row justify-start items-center relative'
    }, [
      h('div', { class: 'flex-col text-left flex pointer-events-none flex-1 min-w-0' }, [
        h('div', { class: 'text-theme-text-primary text-sm font-bold truncate' }, props.preset.command),
        h('div', { class: 'text-theme-text-secondary text-sm truncate' }, props.preset.description)
      ]),
      h('button', {
        ref: menuButtonRef,
        type: 'button',
        tabIndex: -1,
        onClick: (e) => {
          e.stopPropagation()
          showMenu.value = !showMenu.value
        },
        class: 'border-none text-theme-text-primary text-sm p-1 hover:cursor-pointer hover:bg-theme-action-menu-item-hover rounded-full ml-2 flex-shrink-0 z-20',
        'aria-label': 'More actions'
      }, [
        h(DotsThree, { size: 24, weight: 'bold' })
      ]),
      showMenu.value ? h('div', {
        ref: menuRef,
        class: 'absolute right-0 top-10 bg-theme-bg-popup-menu rounded-lg z-50 min-w-[160px] shadow-lg border border-theme-modal-border flex flex-col'
      }, [
        h('button', {
          type: 'button',
          class: 'px-[10px] py-[6px] text-sm text-white hover:bg-theme-sidebar-item-hover rounded-t-lg cursor-pointer border-none w-full text-left whitespace-nowrap',
          onClick: (e) => {
            e.stopPropagation()
            showMenu.value = false
            props.onEdit(props.preset)
          }
        }, 'Edit'),
        h('button', {
          type: 'button',
          class: 'px-[10px] py-[6px] text-sm text-white hover:bg-theme-sidebar-item-hover rounded-b-lg cursor-pointer border-none w-full text-left whitespace-nowrap',
          onClick: (e) => {
            e.stopPropagation()
            showMenu.value = false
            props.onPublish(props.preset)
          }
        }, 'Publish')
      ]) : null
    ])
  }
})
</script>

<template>
  <template v-if="!isActiveAgentSession">
    <PresetItem
      v-for="preset in presets"
      :key="preset.id"
      :preset="preset"
      :on-use="() => {
        setShowing(false)
        sendCommand({ text: `${preset.command} ` })
        promptRef?.focus()
      }"
      :on-edit="handleEditPreset"
      :on-publish="handlePublishPreset"
    />
    <button
      @click="openAddModal"
      class="border-none w-full hover:cursor-pointer hover:bg-theme-action-menu-item-hover px-2 py-1 rounded-xl flex flex-col justify-start"
    >
      <div class="w-full flex-row flex pointer-events-none items-center gap-2">
        <Plus :size="24" weight="fill" class="text-theme-text-primary" />
        <div class="text-theme-text-primary text-sm font-medium">
          {{ t('chat_window.add_new_preset') }}
        </div>
      </div>
    </button>
    <AddPresetModal
      :is-open="isAddModalOpen"
      :on-close="closeAddModal"
      :on-save="handleSavePreset"
    />
    <EditPresetModal
      v-if="selectedPreset"
      :is-open="isEditModalOpen"
      :on-close="closeEditModalAndResetPreset"
      :on-save="handleUpdatePreset"
      :on-delete="handleDeletePreset"
      :preset="selectedPreset"
    />
    <PublishEntityModal
      :show="isPublishModalOpen"
      :on-close="closePublishModal"
      entity-type="slash-command"
      :entity="presetToPublish"
    />
  </template>
</template>

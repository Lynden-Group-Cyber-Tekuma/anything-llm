<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import UploadFile from '../UploadFile/index.vue'
import PreLoader from '@/components/Preloader/index.vue'
import FolderRow from './FolderRow/index.vue'
import System from '@/models/system'
import { PhMagnifyingGlass, PhPlus, PhTrash } from '@phosphor-icons/vue'
import Document from '@/models/document'
import showToast from '@/utils/toast'
import FolderSelectionPopup from './FolderSelectionPopup/index.vue'
import MoveToFolderIcon from './MoveToFolderIcon.vue'
import NewFolderModal from './NewFolderModal/index.vue'
import debounce from 'lodash.debounce'
import { filterFileSearchResults } from './utils'
import ContextMenu from './ContextMenu/index.vue'
import { safeJsonParse } from '@/utils/request'

const props = defineProps({
  files: Object,
  loading: Boolean,
  workspace: Object,
  fetchKeys: Function,
  selectedItems: Object,
  moveToWorkspace: Function,
  loadingMessage: String,
})

const emit = defineEmits(['update:files', 'update:loading', 'update:selectedItems', 'update:highlightWorkspace', 'update:loadingMessage'])

const { t } = useI18n()
const amountSelected = ref(0)
const showFolderSelection = ref(false)
const searchTerm = ref('')
const isFolderModalOpen = ref(false)
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
})

watch(() => props.selectedItems, () => {
  amountSelected.value = Object.keys(props.selectedItems).length
}, { deep: true })

const deleteFiles = async (event) => {
  event.stopPropagation()
  if (!window.confirm(t('connectors.directory.delete-confirmation'))) {
    return false
  }

  try {
    const toRemove = []
    const foldersToRemove = []

    for (const itemId of Object.keys(props.selectedItems)) {
      for (const folder of props.files.items) {
        const foundItem = folder.items.find((file) => file.id === itemId)
        if (foundItem) {
          toRemove.push(`${folder.name}/${foundItem.name}`)
          break
        }
      }
    }
    for (const folder of props.files.items) {
      if (folder.name === 'custom-documents') {
        continue
      }

      if (isSelected(folder.id, folder)) {
        foldersToRemove.push(folder.name)
      }
    }

    emit('update:loading', true)
    emit('update:loadingMessage',
      t('connectors.directory.removing-message', {
        count: toRemove.length,
        folderCount: foldersToRemove.length,
      })
    )
    await System.deleteDocuments(toRemove)
    for (const folderName of foldersToRemove) {
      await System.deleteFolder(folderName)
    }

    await props.fetchKeys(true)
    emit('update:selectedItems', {})
  } catch (error) {
    console.error('Failed to delete files and folders:', error)
  } finally {
    emit('update:loading', false)
    emit('update:selectedItems', {})
  }
}

const toggleSelection = (item) => {
  const newSelectedItems = { ...props.selectedItems }
  if (item.type === 'folder') {
    // select all files in the folder
    if (newSelectedItems[item.name]) {
      delete newSelectedItems[item.name]
      item.items.forEach((file) => delete newSelectedItems[file.id])
    } else {
      newSelectedItems[item.name] = true
      item.items.forEach((file) => (newSelectedItems[file.id] = true))
    }
  } else {
    // single file selections
    if (newSelectedItems[item.id]) {
      delete newSelectedItems[item.id]
    } else {
      newSelectedItems[item.id] = true
    }
  }

  emit('update:selectedItems', newSelectedItems)
}

// check if item is selected based on selectedItems state
const isSelected = (id, item) => {
  if (item && item.type === 'folder') {
    if (!props.selectedItems[item.name]) {
      return false
    }
    return item.items.every((file) => props.selectedItems[file.id])
  }

  return !!props.selectedItems[id]
}

const moveToFolder = async (folder) => {
  const toMove = []
  for (const itemId of Object.keys(props.selectedItems)) {
    for (const currentFolder of props.files.items) {
      const foundItem = currentFolder.items.find(
        (file) => file.id === itemId
      )
      if (foundItem) {
        toMove.push({ ...foundItem, folderName: currentFolder.name })
        break
      }
    }
  }
  emit('update:loading', true)
  emit('update:loadingMessage', `Moving ${toMove.length} documents. Please wait.`)
  const { success, message } = await Document.moveToFolder(
    toMove,
    folder.name
  )
  if (!success) {
    showToast(`Error moving files: ${message}`, 'error')
    emit('update:loading', false)
    return
  }

  if (success && message) {
    // show info if some files were not moved due to being embedded
    showToast(message, 'info')
  } else {
    showToast(
      t('connectors.directory.move-success', { count: toMove.length }),
      'success'
    )
  }
  await props.fetchKeys(true)
  emit('update:selectedItems', {})
  emit('update:loading', false)
}

const handleSearch = debounce((e) => {
  const searchValue = e.target.value
  searchTerm.value = searchValue
}, 500)

const filteredFiles = computed(() => filterFileSearchResults(props.files, searchTerm.value))

const handleContextMenu = (event) => {
  event.preventDefault()
  contextMenu.value = { visible: true, x: event.clientX, y: event.clientY }
}

const closeContextMenu = () => {
  contextMenu.value = { visible: false, x: 0, y: 0 }
}

const openFolderModal = () => {
  isFolderModalOpen.value = true
}

const closeFolderModal = () => {
  isFolderModalOpen.value = false
}
</script>

<template>
  <div>
    <div class="px-8 pb-8" @contextmenu="handleContextMenu">
      <div class="flex flex-col gap-y-6">
        <div class="flex items-center justify-between w-[560px] px-5 relative">
          <h3 class="text-white text-base font-bold">
            {{ t('connectors.directory.my-documents') }}
          </h3>
          <div class="relative">
            <input
              type="search"
              :placeholder="t('connectors.directory.search-document')"
              @input="handleSearch"
              class="border-none search-input bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder focus:outline-primary-button active:outline-primary-button outline-none text-sm rounded-lg pl-9 pr-2.5 py-2 w-[250px] h-[32px] light:border-theme-modal-border light:border"
            />
            <MagnifyingGlass
              :size="14"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-white"
              weight="bold"
            />
          </div>
          <button
            class="border-none flex items-center gap-x-2 cursor-pointer px-[14px] py-[7px] -mr-[14px] rounded-lg hover:bg-theme-sidebar-subitem-hover z-20 relative"
            @click="openFolderModal"
          >
            <Plus
              :size="18"
              weight="bold"
              class="text-theme-text-primary light:text-[#0ba5ec]"
            />
            <div class="text-theme-text-primary light:text-[#0ba5ec] text-xs font-bold leading-[18px]">
              {{ t('connectors.directory.new-folder') }}
            </div>
          </button>
        </div>

        <div class="relative w-[560px] h-[310px] bg-theme-settings-input-bg rounded-2xl overflow-hidden border border-theme-modal-border">
          <div class="absolute top-0 left-0 right-0 z-10 rounded-t-2xl text-theme-text-primary text-xs grid grid-cols-12 py-2 px-8 border-b border-white/20 light:border-theme-modal-border bg-theme-settings-input-bg">
            <p class="col-span-6">Name</p>
          </div>

          <div class="overflow-y-auto h-full pt-8">
            <div v-if="loading" class="w-full h-full flex items-center justify-center flex-col gap-y-5">
              <PreLoader />
              <p class="text-white text-sm font-semibold animate-pulse text-center w-1/3">
                {{ loadingMessage }}
              </p>
            </div>
            <template v-else-if="filteredFiles.length > 0">
              <FolderRow
                v-for="(item, index) in filteredFiles"
                :key="index"
                v-if="item.type === 'folder'"
                :item="item"
                :selected="isSelected(item.id, item.type === 'folder' ? item : null)"
                :onRowClick="() => toggleSelection(item)"
                :toggleSelection="toggleSelection"
                :isSelected="isSelected"
                :autoExpanded="index === 0"
              />
            </template>
            <div v-else class="w-full h-full flex items-center justify-center">
              <p class="text-white text-opacity-40 text-sm font-medium">
                {{ t('connectors.directory.no-documents') }}
              </p>
            </div>
          </div>
          <div v-if="amountSelected !== 0" class="absolute bottom-[12px] left-0 right-0 flex justify-center pointer-events-none">
            <div class="mx-auto bg-white/40 light:bg-white rounded-lg py-1 px-2 pointer-events-auto light:shadow-lg">
              <div class="flex flex-row items-center gap-x-2">
                <button
                  @click="moveToWorkspace"
                  @mouseenter="emit('update:highlightWorkspace', true)"
                  @mouseleave="emit('update:highlightWorkspace', false)"
                  class="border-none text-sm font-semibold bg-white light:bg-[#E0F2FE] h-[30px] px-2.5 rounded-lg hover:bg-neutral-800/80 hover:text-white light:text-[#026AA2] light:hover:bg-[#026AA2] light:hover:text-white"
                >
                  {{ t('connectors.directory.move-workspace') }}
                </button>
                <div class="relative">
                  <button
                    @click="showFolderSelection = !showFolderSelection"
                    class="border-none text-sm font-semibold bg-white light:bg-[#E0F2FE] h-[32px] w-[32px] rounded-lg text-dark-text hover:bg-neutral-800/80 hover:text-white light:text-[#026AA2] light:hover:bg-[#026AA2] light:hover:text-white flex justify-center items-center group"
                  >
                    <MoveToFolderIcon class="text-dark-text light:text-[#026AA2] group-hover:text-white" />
                  </button>
                  <FolderSelectionPopup
                    v-if="showFolderSelection"
                    :folders="files.items.filter((item) => item.type === 'folder')"
                    :onSelect="moveToFolder"
                    :onClose="() => showFolderSelection = false"
                  />
                </div>
                <button
                  @click="deleteFiles"
                  class="border-none text-sm font-semibold bg-white light:bg-[#E0F2FE] h-[32px] w-[32px] rounded-lg text-dark-text hover:bg-neutral-800/80 hover:text-white light:text-[#026AA2] light:hover:bg-[#026AA2] light:hover:text-white flex justify-center items-center"
                >
                  <PhTrash :size="18" weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <UploadFile
          :workspace="workspace"
          :fetchKeys="fetchKeys"
          @update:loading="emit('update:loading', $event)"
          @update:loadingMessage="emit('update:loadingMessage', $event)"
        />
      </div>
      <div v-if="isFolderModalOpen" class="bg-black/60 backdrop-blur-sm fixed top-0 left-0 outline-none w-screen h-screen flex items-center justify-center z-30">
        <NewFolderModal
          :closeModal="closeFolderModal"
          :files="files"
          @update:files="emit('update:files', $event)"
        />
      </div>
      <ContextMenu
        :contextMenu="contextMenu"
        :closeContextMenu="closeContextMenu"
        :files="files"
        :selectedItems="selectedItems"
        @update:selectedItems="emit('update:selectedItems', $event)"
      />
    </div>
    <DirectoryTooltips />
  </div>
</template>

<script>
import { defineComponent } from 'vue'

// DirectoryTooltips sub-component - simplified without react-tooltip
const DirectoryTooltips = defineComponent({
  name: 'DirectoryTooltips',
  template: '<div></div>' // Tooltips are now handled inline with native title attributes
})

export { DirectoryTooltips }
</script>

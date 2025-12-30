<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import PreLoader from '@/components/Preloader/index.vue'
import WorkspaceFileRow from './WorkspaceFileRow/index.vue'
import { dollarFormat } from '@/utils/numbers'
import Workspace from '@/models/workspace'

const props = defineProps({
  workspace: {
    type: Object,
    required: true
  },
  files: {
    type: Object,
    required: true
  },
  highlightWorkspace: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingMessage: {
    type: String,
    default: ''
  },
  hasChanges: {
    type: Boolean,
    default: false
  },
  embeddingCosts: {
    type: Number,
    default: 0
  },
  movedItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:loading', 'update:loadingMessage', 'saveChanges', 'fetchKeys'])

const { t } = useI18n()
const selectedItems = ref({})

const toggleSelection = (item) => {
  const newSelectedItems = { ...selectedItems.value }
  if (newSelectedItems[item.id]) {
    delete newSelectedItems[item.id]
  } else {
    newSelectedItems[item.id] = true
  }
  selectedItems.value = newSelectedItems
}

const totalItems = computed(() => {
  return props.files.items.reduce((sum, folder) => sum + folder.items.length, 0)
})

const isAllSelected = computed(() => {
  return Object.keys(selectedItems.value).length === totalItems.value
})

const toggleSelectAll = () => {
  const allItems = props.files.items.flatMap((folder) => folder.items)
  const allSelected = allItems.every((item) => selectedItems.value[item.id])

  if (allSelected) {
    selectedItems.value = {}
  } else {
    const newSelectedItems = {}
    allItems.forEach((item) => {
      newSelectedItems[item.id] = true
    })
    selectedItems.value = newSelectedItems
  }
}

const removeSelectedItems = async () => {
  emit('update:loading', true)
  emit('update:loadingMessage', 'Removing selected files from workspace')

  const itemsToRemove = Object.keys(selectedItems.value).map((itemId) => {
    const folder = props.files.items.find((f) =>
      f.items.some((i) => i.id === itemId)
    )
    const item = folder.items.find((i) => i.id === itemId)
    return `${folder.name}/${item.name}`
  })

  try {
    await Workspace.modifyEmbeddings(props.workspace.slug, {
      adds: [],
      deletes: itemsToRemove,
    })
    emit('fetchKeys', true)
    selectedItems.value = {}
  } catch (error) {
    console.error('Failed to remove documents:', error)
  }

  emit('update:loadingMessage', '')
  emit('update:loading', false)
}

const handleSaveChanges = (e) => {
  selectedItems.value = {}
  emit('saveChanges', e)
}

// Compute sorted items for rendering
const sortedItems = computed(() => {
  const flatItems = props.files.items.flatMap((folder) =>
    folder.items.map((item) => ({ item, folder }))
  )

  return flatItems.sort((a, b) => {
    const aIsMovedItem = props.movedItems.some((movedItem) => movedItem.id === a.item.id)
    const bIsMovedItem = props.movedItems.some((movedItem) => movedItem.id === b.item.id)
    if (aIsMovedItem && !bIsMovedItem) return -1
    if (!aIsMovedItem && bIsMovedItem) return 1

    // Sort pinned items to the top
    const aIsPinned = a.item.pinnedWorkspaces?.includes(props.workspace.id)
    const bIsPinned = b.item.pinnedWorkspaces?.includes(props.workspace.id)
    if (aIsPinned && !bIsPinned) return -1
    if (!aIsPinned && bIsPinned) return 1

    return 0
  })
})

const hasAnyFiles = computed(() => {
  return props.files.items.some((folder) => folder.items.length > 0) || props.movedItems.length > 0
})
</script>

<template>
  <div>
    <div class="px-8">
      <div class="flex items-center justify-start w-[560px]">
        <h3 class="text-white text-base font-bold ml-5">
          {{ workspace.name }}
        </h3>
      </div>

      <div v-if="loading" class="relative w-[560px] h-[445px] bg-theme-settings-input-bg rounded-2xl mt-5 border border-theme-modal-border">
        <div class="text-white/80 text-xs grid grid-cols-12 py-2 px-3.5 border-b border-white/20 light:border-theme-modal-border bg-theme-settings-input-bg sticky top-0 z-10 rounded-t-2xl">
          <div class="col-span-10 flex items-center gap-x-[4px]">
            <div class="shrink-0 w-3 h-3" />
            <p class="ml-[7px] text-theme-text-primary">Name</p>
          </div>
          <p class="col-span-2" />
        </div>
        <div class="w-full h-[calc(100%-40px)] flex items-center justify-center flex-col gap-y-5">
          <PreLoader />
          <p class="text-theme-text-primary text-sm font-semibold animate-pulse text-center w-1/3">
            {{ loadingMessage }}
          </p>
        </div>
      </div>

      <div v-else class="relative w-[560px] h-[445px] mt-5">
        <div
          :class="[
            'absolute inset-0 rounded-2xl',
            highlightWorkspace ? 'border-4 border-cyan-300/80 z-[999]' : ''
          ]"
        />
        <div class="relative w-full h-full bg-theme-settings-input-bg rounded-2xl overflow-hidden border border-theme-modal-border">
          <div class="text-white/80 text-xs grid grid-cols-12 py-2 px-3.5 border-b border-white/20 light:border-theme-modal-border bg-theme-settings-input-bg sticky top-0 z-10">
            <div class="col-span-10 flex items-center gap-x-[4px]">
              <div
                v-if="!hasChanges && hasAnyFiles"
                :class="[
                  'shrink-0 w-3 h-3 rounded border-[1px] border-solid border-white text-theme-text-primary light:invert flex justify-center items-center cursor-pointer'
                ]"
                role="checkbox"
                :aria-checked="isAllSelected"
                tabindex="0"
                @click="toggleSelectAll"
              >
                <div v-if="isAllSelected" class="w-2 h-2 bg-white rounded-[2px]" />
              </div>
              <div v-else class="shrink-0 w-3 h-3" />
              <p class="ml-[7px] text-theme-text-primary">Name</p>
            </div>
            <p class="col-span-2" />
          </div>

          <div class="overflow-y-auto h-[calc(100%-40px)]">
            <template v-if="hasAnyFiles">
              <WorkspaceFileRow
                v-for="{ item, folder } in sortedItems"
                :key="item.id"
                :item="item"
                :folderName="folder.name"
                :workspace="workspace"
                :hasChanges="hasChanges"
                :movedItems="movedItems"
                :selected="selectedItems[item.id]"
                :toggleSelection="() => toggleSelection(item)"
                :disableSelection="hasChanges"
                @update:loading="emit('update:loading', $event)"
                @update:loadingMessage="emit('update:loadingMessage', $event)"
                @fetchKeys="emit('fetchKeys', $event)"
                @update:selectedItems="selectedItems = {}"
              />
            </template>
            <div v-else class="w-full h-full flex items-center justify-center">
              <p class="text-white text-opacity-40 text-sm font-medium">
                {{ t('connectors.directory.no_docs') }}
              </p>
            </div>
          </div>

          <div v-if="Object.keys(selectedItems).length > 0 && !hasChanges" class="absolute bottom-[12px] left-0 right-0 flex justify-center pointer-events-none">
            <div class="mx-auto bg-white/40 light:bg-white rounded-lg py-1 px-2 pointer-events-auto light:shadow-lg">
              <div class="flex flex-row items-center gap-x-2">
                <button
                  @click="toggleSelectAll"
                  class="border-none text-sm font-semibold bg-white light:bg-[#E0F2FE] h-[30px] px-2.5 rounded-lg hover:bg-neutral-800/80 hover:text-white light:text-[#026AA2] light:hover:bg-[#026AA2] light:hover:text-white"
                >
                  {{ isAllSelected ? t('connectors.directory.deselect_all') : t('connectors.directory.select_all') }}
                </button>
                <button
                  @click="removeSelectedItems"
                  class="border-none text-sm font-semibold bg-white light:bg-[#E0F2FE] h-[30px] px-2.5 rounded-lg hover:bg-neutral-800/80 hover:text-white light:text-[#026AA2] light:hover:bg-[#026AA2] light:hover:text-white"
                >
                  {{ t('connectors.directory.remove_selected') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasChanges" class="flex items-center justify-between py-6">
        <div class="text-white/80">
          <p class="text-sm font-semibold">
            {{ embeddingCosts === 0 ? '' : `Estimated Cost: ${embeddingCosts < 0.01 ? '< $0.01' : dollarFormat(embeddingCosts)}` }}
          </p>
          <p class="mt-2 text-xs italic" :hidden="embeddingCosts === 0">
            {{ t('connectors.directory.costs') }}
          </p>
        </div>

        <button
          @click="handleSaveChanges"
          class="border border-slate-200 px-5 py-2.5 rounded-lg text-white text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 focus:ring-gray-800"
        >
          {{ t('connectors.directory.save_embed') }}
        </button>
      </div>
    </div>

    <PinAlert />
    <DocumentWatchAlert />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import { Eye, PushPin } from '@phosphor-icons/vue'
import { SEEN_DOC_PIN_ALERT, SEEN_WATCH_ALERT } from '@/utils/constants'
import paths from '@/utils/paths'
import { RouterLink } from 'vue-router'

const PinAlert = defineComponent({
  name: 'PinAlert',
  components: { ModalWrapper, PushPin },
  setup() {
    const { t } = useI18n()
    const showAlert = ref(false)

    const dismissAlert = () => {
      showAlert.value = false
      window.localStorage.setItem(SEEN_DOC_PIN_ALERT, '1')
      window.removeEventListener('pinned_document', handlePinEvent)
    }

    const handlePinEvent = () => {
      if (!!window?.localStorage?.getItem(SEEN_DOC_PIN_ALERT)) return
      showAlert.value = true
    }

    onMounted(() => {
      if (!window || !!window?.localStorage?.getItem(SEEN_DOC_PIN_ALERT)) return
      window?.addEventListener('pinned_document', handlePinEvent)
    })

    onUnmounted(() => {
      window?.removeEventListener('pinned_document', handlePinEvent)
    })

    return { showAlert, dismissAlert, t }
  },
  template: `
    <ModalWrapper :isOpen="showAlert" :noPortal="true">
      <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
        <div class="relative p-6 border-b rounded-t border-theme-modal-border">
          <div class="flex items-center gap-2">
            <PushPin
              class="text-theme-text-primary text-lg w-6 h-6"
              weight="regular"
            />
            <h3 class="text-xl font-semibold text-white">
              {{ t('connectors.pinning.what_pinning') }}
            </h3>
          </div>
        </div>
        <div class="py-7 px-9 space-y-2 flex-col">
          <div class="w-full text-white text-md flex flex-col gap-y-2">
            <p>
              <span v-html="t('connectors.pinning.pin_explained_block1')" />
            </p>
            <p>
              <span v-html="t('connectors.pinning.pin_explained_block2')" />
            </p>
            <p>{{ t('connectors.pinning.pin_explained_block3') }}</p>
          </div>
        </div>
        <div class="flex w-full justify-end items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
          <button
            @click="dismissAlert"
            class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
          >
            {{ t('connectors.pinning.accept') }}
          </button>
        </div>
      </div>
    </ModalWrapper>
  `
})

const DocumentWatchAlert = defineComponent({
  name: 'DocumentWatchAlert',
  components: { ModalWrapper, Eye, RouterLink },
  setup() {
    const { t } = useI18n()
    const showAlert = ref(false)

    const dismissAlert = () => {
      showAlert.value = false
      window.localStorage.setItem(SEEN_WATCH_ALERT, '1')
      window.removeEventListener('watch_document_for_changes', handleWatchEvent)
    }

    const handleWatchEvent = () => {
      if (!!window?.localStorage?.getItem(SEEN_WATCH_ALERT)) return
      showAlert.value = true
    }

    onMounted(() => {
      if (!window || !!window?.localStorage?.getItem(SEEN_WATCH_ALERT)) return
      window?.addEventListener('watch_document_for_changes', handleWatchEvent)
    })

    onUnmounted(() => {
      window?.removeEventListener('watch_document_for_changes', handleWatchEvent)
    })

    return {
      showAlert,
      dismissAlert,
      t,
      liveSyncPath: paths.experimental.liveDocumentSync.manage()
    }
  },
  template: `
    <ModalWrapper :isOpen="showAlert" :noPortal="true">
      <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
        <div class="relative p-6 border-b rounded-t border-theme-modal-border">
          <div class="flex items-center gap-2">
            <Eye
              class="text-theme-text-primary text-lg w-6 h-6"
              weight="regular"
            />
            <h3 class="text-xl font-semibold text-white">
              {{ t('connectors.watching.what_watching') }}
            </h3>
          </div>
        </div>
        <div class="py-7 px-9 space-y-2 flex-col">
          <div class="w-full text-white text-md flex flex-col gap-y-2">
            <p>
              <span v-html="t('connectors.watching.watch_explained_block1')" />
            </p>
            <p>{{ t('connectors.watching.watch_explained_block2') }}</p>
            <p>
              {{ t('connectors.watching.watch_explained_block3_start') }}
              <RouterLink
                :to="liveSyncPath"
                class="text-blue-600 underline"
              >
                {{ t('connectors.watching.watch_explained_block3_link') }}
              </RouterLink>
              {{ t('connectors.watching.watch_explained_block3_end') }}
            </p>
          </div>
        </div>
        <div class="flex w-full justify-end items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
          <button
            @click="dismissAlert"
            class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
          >
            {{ t('connectors.watching.accept') }}
          </button>
        </div>
      </div>
    </ModalWrapper>
  `
})

export { PinAlert, DocumentWatchAlert }
</script>

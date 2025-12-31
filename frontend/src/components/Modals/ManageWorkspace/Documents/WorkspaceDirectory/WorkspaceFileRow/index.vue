<script setup>
import { ref, computed } from 'vue'
import {
  formatDateTimeAsMoment,
  getFileExtension,
  middleTruncate,
} from '@/utils/directories'
import { PhArrowUUpLeft, PhEye, PhFile, PhPushPin } from '@phosphor-icons/vue'
import Workspace from '@/models/workspace'
import showToast from '@/utils/toast'
import System from '@/models/system'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  folderName: {
    type: String,
    required: true
  },
  workspace: {
    type: Object,
    required: true
  },
  fetchKeys: {
    type: Function,
    required: true
  },
  hasChanges: {
    type: Boolean,
    default: false
  },
  movedItems: {
    type: Array,
    default: () => []
  },
  selected: {
    type: Boolean,
    default: false
  },
  toggleSelection: {
    type: Function,
    required: true
  },
  disableSelection: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:loading', 'update:loadingMessage', 'update:selectedItems'])

const onRemoveClick = async (e) => {
  e.stopPropagation()
  emit('update:loading', true)

  try {
    emit('update:loadingMessage', 'Removing file from workspace')
    await Workspace.modifyEmbeddings(props.workspace.slug, {
      adds: [],
      deletes: [`${props.folderName}/${props.item.name}`],
    })
    await props.fetchKeys(true)
  } catch (error) {
    console.error('Failed to remove document:', error)
  }
  emit('update:selectedItems', {})
  emit('update:loadingMessage', '')
  emit('update:loading', false)
}

const toggleRowSelection = (e) => {
  if (props.disableSelection) return
  e.stopPropagation()
  props.toggleSelection()
}

const handleRowSelection = (e) => {
  e.stopPropagation()
  props.toggleSelection()
}

const isMovedItem = computed(() =>
  props.movedItems?.some((movedItem) => movedItem.id === props.item.id)
)

const tooltipData = computed(() => JSON.stringify({
  title: props.item.title,
  date: formatDateTimeAsMoment(props.item?.published),
  extension: getFileExtension(props.item.url),
}))
</script>

<template>
  <div
    :class="[
      'text-theme-text-primary text-xs grid grid-cols-12 py-2 pl-3.5 pr-8 h-[34px] items-center file-row',
      !disableSelection ? 'hover:bg-theme-file-picker-hover cursor-pointer' : '',
      isMovedItem ? 'selected light:text-white' : '',
      selected ? 'selected light:text-white' : ''
    ]"
    @click="toggleRowSelection"
  >
    <div
      class="col-span-10 w-fit flex gap-x-[2px] items-center relative"
      data-tooltip-id="ws-directory-item"
      :data-tooltip-content="tooltipData"
    >
      <div class="shrink-0 w-3 h-3">
        <div
          v-if="!disableSelection"
          :class="[
            'shrink-0 w-3 h-3 rounded border-[1px] border-solid border-white flex justify-center items-center cursor-pointer',
            selected ? 'text-white' : 'text-theme-text-primary light:invert'
          ]"
          role="checkbox"
          :aria-checked="selected"
          tabindex="0"
          @click="handleRowSelection"
        >
          <div v-if="selected" class="w-2 h-2 bg-white rounded-[2px]" />
        </div>
      </div>
      <File
        class="shrink-0 text-base font-bold w-4 h-4 mr-[3px] ml-1"
        weight="fill"
      />
      <p class="whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]">
        {{ middleTruncate(item.title, 50) }}
      </p>
    </div>
    <div class="col-span-2 flex justify-end items-center">
      <div v-if="hasChanges" class="w-4 h-4 ml-2 flex-shrink-0" />
      <div v-else class="flex gap-x-2 items-center">
        <WatchForChanges
          :workspace="workspace"
          :docPath="`${folderName}/${item.name}`"
          :item="item"
        />
        <PinItemToWorkspace
          :workspace="workspace"
          :docPath="`${folderName}/${item.name}`"
          :item="item"
        />
        <RemoveItemFromWorkspace :item="item" @click="onRemoveClick" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

// PinItemToWorkspace sub-component
const PinItemToWorkspace = defineComponent({
  name: 'PinItemToWorkspace',
  props: {
    workspace: Object,
    docPath: String,
    item: Object
  },
  setup(props) {
    const pinned = ref(
      props.item?.pinnedWorkspaces?.includes(props.workspace.id) || false
    )
    const pinEvent = new CustomEvent('pinned_document')

    const updatePinStatus = async (e) => {
      try {
        e.stopPropagation()
        if (!pinned.value) window.dispatchEvent(pinEvent)
        const success = await Workspace.setPinForDocument(
          props.workspace.slug,
          props.docPath,
          !pinned.value
        )

        if (!success) {
          showToast(`Failed to ${!pinned.value ? 'pin' : 'unpin'} document.`, 'error', {
            clear: true,
          })
          return
        }

        showToast(
          `Document ${!pinned.value ? 'pinned to' : 'unpinned from'} workspace`,
          'success',
          { clear: true }
        )
        pinned.value = !pinned.value
      } catch (error) {
        showToast(`Failed to pin document. ${error.message}`, 'error', {
          clear: true,
        })
        return
      }
    }

    return { pinned, updatePinStatus }
  },
  template: `
    <div v-if="!item" class="w-[16px] p-[2px] ml-2" />
    <div
      v-else
      @click="updatePinStatus"
      class="group flex items-center ml-2 cursor-pointer"
      data-tooltip-id="pin-document"
      :data-tooltip-content="pinned ? 'Un-pin from workspace' : 'Pin to workspace'"
    >
      <div v-if="pinned" class="bg-theme-settings-input-active group-hover:bg-red-500/20 rounded-3xl whitespace-nowrap">
        <p class="text-xs px-2 py-0.5 group-hover:text-red-500">
          <span class="group-hover:hidden">Pinned</span>
          <span class="hidden group-hover:inline">Un-pin</span>
        </p>
      </div>
      <PushPin
        v-else
        :size="16"
        weight="regular"
        class="outline-none text-base font-bold flex-shrink-0"
      />
    </div>
  `
})

// WatchForChanges sub-component
const WatchForChanges = defineComponent({
  name: 'WatchForChanges',
  props: {
    workspace: Object,
    docPath: String,
    item: Object
  },
  setup(props) {
    const watched = ref(props.item?.watched || false)
    const watchEvent = new CustomEvent('watch_document_for_changes')

    const updateWatchStatus = async (e) => {
      try {
        e.stopPropagation()
        if (!watched.value) window.dispatchEvent(watchEvent)
        const success =
          await System.experimentalFeatures.liveSync.setWatchStatusForDocument(
            props.workspace.slug,
            props.docPath,
            !watched.value
          )

        if (!success) {
          showToast(
            `Failed to ${!watched.value ? 'watch' : 'unwatch'} document.`,
            'error',
            {
              clear: true,
            }
          )
          return
        }

        showToast(
          `Document ${
            !watched.value
              ? 'will be watched for changes'
              : 'will no longer be watched for changes'
          }.`,
          'success',
          { clear: true }
        )
        watched.value = !watched.value
      } catch (error) {
        showToast(`Failed to watch document. ${error.message}`, 'error', {
          clear: true,
        })
        return
      }
    }

    return { watched, updateWatchStatus }
  },
  template: `
    <div v-if="!item || !item.canWatch" class="w-[16px] p-[2px] ml-2" />
    <div
      v-else
      class="group flex gap-x-2 items-center hover:bg-theme-file-picker-hover p-[2px] rounded ml-2 cursor-pointer"
      @click="updateWatchStatus"
      data-tooltip-id="watch-changes"
      :data-active="watched"
      :data-tooltip-content="watched ? 'Stop watching for changes' : 'Watch document for changes'"
    >
      <Eye
        :size="16"
        weight="regular"
        class="outline-none text-base font-bold flex-shrink-0 group-hover:hidden group-data-[active=true]:hidden"
      />
      <Eye
        :size="16"
        weight="fill"
        class="outline-none text-base font-bold flex-shrink-0 hidden group-hover:block group-data-[active=true]:block"
      />
    </div>
  `
})

// RemoveItemFromWorkspace sub-component
const RemoveItemFromWorkspace = defineComponent({
  name: 'RemoveItemFromWorkspace',
  props: {
    item: Object
  },
  emits: ['click'],
  template: `
    <div>
      <ArrowUUpLeft
        data-tooltip-id="remove-document"
        data-tooltip-content="Remove document from workspace"
        @click="$emit('click', $event)"
        class="text-base font-bold w-4 h-4 ml-2 flex-shrink-0 cursor-pointer"
      />
    </div>
  `
})

export { PinItemToWorkspace, WatchForChanges, RemoveItemFromWorkspace }
</script>

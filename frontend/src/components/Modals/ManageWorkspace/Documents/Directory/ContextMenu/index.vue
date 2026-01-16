<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  contextMenu: {
    type: Object,
    required: true
  },
  closeContextMenu: {
    type: Function,
    required: true
  },
  files: {
    type: Object,
    required: true
  },
  selectedItems: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:selectedItems'])

const contextMenuRef = ref(null)

const handleClickOutside = (event) => {
  if (
    contextMenuRef.value &&
    !contextMenuRef.value.contains(event.target)
  ) {
    props.closeContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const isAllSelected = computed(() => {
  const allItems = props.files.items.flatMap((folder) => [
    folder.name,
    ...folder.items.map((file) => file.id),
  ])
  return allItems.every((item) => props.selectedItems[item])
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    emit('update:selectedItems', {})
  } else {
    const newSelectedItems = {}
    props.files.items.forEach((folder) => {
      newSelectedItems[folder.name] = true
      folder.items.forEach((file) => {
        newSelectedItems[file.id] = true
      })
    })
    emit('update:selectedItems', newSelectedItems)
  }
  props.closeContextMenu()
}
</script>

<template>
  <div
    v-if="contextMenu.visible"
    ref="contextMenuRef"
    :style="{
      position: 'fixed',
      top: `${contextMenu.y}px`,
      left: `${contextMenu.x}px`,
      zIndex: 1000,
    }"
    class="bg-theme-bg-secondary border border-theme-modal-border rounded-md shadow-lg"
  >
    <button
      @click="toggleSelectAll"
      class="block w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-file-picker-hover"
    >
      {{ isAllSelected ? 'Unselect All' : 'Select All' }}
    </button>
    <button
      @click="closeContextMenu"
      class="block w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-file-picker-hover"
    >
      Cancel
    </button>
  </div>
</template>

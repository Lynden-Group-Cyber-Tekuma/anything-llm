<script setup>
import { middleTruncate } from '@/utils/directories'

const props = defineProps({
  folders: {
    type: Array,
    required: true
  },
  onSelect: {
    type: Function,
    required: true
  },
  onClose: {
    type: Function,
    required: true
  }
})

const handleFolderSelect = (folder) => {
  props.onSelect(folder)
  props.onClose()
}
</script>

<template>
  <div class="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg max-h-40 overflow-y-auto no-scroll">
    <ul>
      <li
        v-for="folder in folders"
        :key="folder.name"
        @click="handleFolderSelect(folder)"
        class="px-4 py-2 text-xs text-gray-700 hover:bg-gray-200 rounded-lg cursor-pointer whitespace-nowrap"
      >
        {{ middleTruncate(folder.name, 25) }}
      </li>
    </ul>
  </div>
</template>

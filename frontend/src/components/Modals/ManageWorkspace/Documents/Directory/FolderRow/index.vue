<script setup>
import { ref } from 'vue'
import FileRow from '../FileRow/index.vue'
import { PhCaretDown, PhPhFolderNotch } from '@phosphor-icons/vue'
import { middleTruncate } from '@/utils/directories'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  onRowClick: {
    type: Function,
    required: true
  },
  toggleSelection: {
    type: Function,
    required: true
  },
  isSelected: {
    type: Function,
    required: true
  },
  autoExpanded: {
    type: Boolean,
    default: false
  }
})

const expanded = ref(props.autoExpanded)

const handleExpandClick = (event) => {
  event.stopPropagation()
  expanded.value = !expanded.value
}

const handleCheckboxClick = (event) => {
  event.stopPropagation()
  props.toggleSelection(props.item)
}
</script>

<template>
  <template>
    <tr
      @click="onRowClick"
      :class="[
        'text-theme-text-primary text-xs grid grid-cols-12 py-2 pl-3.5 pr-8 hover:bg-theme-file-picker-hover cursor-pointer file-row',
        selected ? 'selected light:text-white !text-white' : ''
      ]"
    >
      <div
        :class="[
          'col-span-6 flex gap-x-[4px] items-center',
          selected ? '!text-white' : 'text-theme-text-primary'
        ]"
      >
        <div
          :class="[
            'shrink-0 w-3 h-3 rounded border-[1px] border-solid border-white flex justify-center items-center cursor-pointer',
            selected ? 'text-white' : 'text-theme-text-primary light:invert'
          ]"
          role="checkbox"
          :aria-checked="selected"
          tabindex="0"
          @click="handleCheckboxClick"
        >
          <div v-if="selected" class="w-2 h-2 bg-white rounded-[2px]" />
        </div>
        <div
          @click="handleExpandClick"
          :class="[
            'transform transition-transform duration-200',
            expanded ? 'rotate-360' : 'rotate-270'
          ]"
        >
          <PhCaretDown class="text-base font-bold w-4 h-4" />
        </div>
        <FolderNotch
          class="shrink-0 text-base font-bold w-4 h-4 mr-[3px]"
          weight="fill"
        />
        <p class="whitespace-nowrap overflow-show max-w-[400px]">
          {{ middleTruncate(item.name, 35) }}
        </p>
      </div>
      <p class="col-span-2 pl-3.5" />
      <p class="col-span-2 pl-2" />
    </tr>
    <template v-if="expanded">
      <FileRow
        v-for="fileItem in item.items"
        :key="fileItem.id"
        :item="fileItem"
        :selected="isSelected(fileItem.id)"
        :toggleSelection="toggleSelection"
      />
    </template>
  </template>
</template>

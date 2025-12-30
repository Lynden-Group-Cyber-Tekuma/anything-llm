<script setup>
import { computed } from 'vue'
import {
  formatDateTimeAsMoment,
  getFileExtension,
  middleTruncate,
} from '@/utils/directories'
import { File } from '@phosphor-icons/vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  toggleSelection: {
    type: Function,
    required: true
  }
})

const tooltipData = computed(() => JSON.stringify({
  title: props.item.title,
  date: formatDateTimeAsMoment(props.item?.published),
  extension: getFileExtension(props.item.url),
}))
</script>

<template>
  <tr
    @click="toggleSelection(item)"
    :class="[
      'text-theme-text-primary text-xs grid grid-cols-12 py-2 pl-3.5 pr-8 hover:bg-theme-file-picker-hover cursor-pointer file-row',
      selected ? 'selected light:text-white' : ''
    ]"
  >
    <div
      data-tooltip-id="directory-item"
      class="col-span-10 w-fit flex gap-x-[4px] items-center relative"
      :data-tooltip-content="tooltipData"
    >
      <div
        :class="[
          'shrink-0 w-3 h-3 rounded border-[1px] border-solid border-white flex justify-center items-center cursor-pointer',
          selected ? 'text-white' : 'text-theme-text-primary light:invert'
        ]"
        role="checkbox"
        :aria-checked="selected"
        tabindex="0"
      >
        <div v-if="selected" class="w-2 h-2 bg-white rounded-[2px]" />
      </div>
      <File
        class="shrink-0 text-base font-bold w-4 h-4 mr-[3px]"
        weight="fill"
      />
      <p class="whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]">
        {{ middleTruncate(item.title, 55) }}
      </p>
    </div>
    <div class="col-span-2 flex justify-end items-center">
      <div v-if="item?.cached" class="bg-theme-settings-input-active rounded-3xl">
        <p class="text-xs px-2 py-0.5">Cached</p>
      </div>
    </div>
  </tr>
</template>

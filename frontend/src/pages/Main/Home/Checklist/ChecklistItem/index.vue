<script setup>
import { ref } from 'vue'
import { PhCheck } from '@phosphor-icons/vue'
import { CHECKLIST_STORAGE_KEY, CHECKLIST_UPDATED_EVENT } from '../constants'
import { safeJsonParse } from '@/utils/request'

const props = defineProps({
  id: String,
  title: String,
  action: String,
  onAction: Function,
  icon: Object
})

const isCompleted = ref(() => {
  const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
  if (!stored) return false
  const completedItems = safeJsonParse(stored, {})
  return completedItems[props.id] || false
})

const handleClick = async (e) => {
  e.preventDefault()
  if (!isCompleted.value) {
    const shouldComplete = await props.onAction()
    if (shouldComplete) {
      const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
      const completedItems = safeJsonParse(stored, {})
      completedItems[props.id] = true
      window.localStorage.setItem(
        CHECKLIST_STORAGE_KEY,
        JSON.stringify(completedItems)
      )
      isCompleted.value = true
      window.dispatchEvent(new CustomEvent(CHECKLIST_UPDATED_EVENT))
    }
  } else {
    await props.onAction()
  }
}
</script>

<template>
  <div
    :class="`flex items-center gap-x-4 transition-colors cursor-pointer rounded-lg p-3 group hover:bg-theme-checklist-item-bg-hover ${
      isCompleted
        ? 'bg-theme-checklist-item-completed-bg'
        : 'bg-theme-checklist-item-bg'
    }`"
    @click="handleClick"
  >
    <div v-if="icon" class="flex-shrink-0">
      <component
        :is="icon"
        :size="18"
        :class="
          isCompleted
            ? 'text-theme-checklist-item-completed-text'
            : 'text-theme-checklist-item-text'
        "
      />
    </div>
    <div class="flex-1">
      <h3
        :class="`text-sm font-medium transition-colors duration-200 ${
          isCompleted
            ? 'text-theme-checklist-item-completed-text line-through'
            : 'text-theme-checklist-item-text'
        }`"
      >
        {{ title }}
      </h3>
    </div>
    <div v-if="isCompleted" class="w-5 h-5 rounded-full bg-theme-checklist-checkbox-fill flex items-center justify-center">
      <Check
        :size="14"
        weight="bold"
        class="text-theme-checklist-checkbox-text"
      />
    </div>
    <button
      v-else
      class="w-[64px] h-[24px] rounded-md bg-white/10 light:bg-white/70 text-theme-checklist-item-text font-semibold text-xs transition-all duration-200 flex items-center justify-center hover:bg-white/20 light:hover:bg-white/60"
    >
      {{ action }}
    </button>
  </div>
</template>

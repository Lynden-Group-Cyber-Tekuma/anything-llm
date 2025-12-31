<script setup>
import { PhWarning } from '@phosphor-icons/vue'

defineProps({
  showing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const handleSave = () => {
  emit('save')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div v-if="showing" class="fixed top-0 left-0 right-0 h-14 bg-dark-input flex items-center justify-end px-4 z-[999]">
    <div class="absolute ml-4 left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center gap-x-2">
      <PhWarning :size="18" class="text-[#FFFFFF]" />
      <p class="text-[#FFFFFF] font-medium text-xs">Unsaved Changes</p>
    </div>
    <div class="flex items-center gap-x-2">
      <button
        class="border-none text-theme-text-primary font-medium text-sm px-[10px] py-[6px] rounded-md bg-theme-bg-secondary hover:bg-theme-bg-primary"
        @click="handleCancel"
      >
        Cancel
      </button>
      <button
        class="border-none text-theme-text-primary font-medium text-sm px-[10px] py-[6px] rounded-md bg-primary-button hover:bg-primary-button-hover"
        @click="handleSave"
      >
        Save
      </button>
    </div>
  </div>
</template>

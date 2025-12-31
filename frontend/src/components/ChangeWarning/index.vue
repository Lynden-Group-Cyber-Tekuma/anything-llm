<script setup>
import { PhWarning, PhX } from '@phosphor-icons/vue'

defineProps({
  warningText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'confirm'])

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden z-9999">
    <div class="relative px-6 py-5 border-b rounded-t border-theme-modal-border">
      <div class="w-full flex gap-x-2 items-center">
        <PhWarning class="text-red-500 w-6 h-6" weight="fill" />
        <h3 class="text-xl font-semibold text-red-500 overflow-hidden overflow-ellipsis whitespace-nowrap">
          WARNING - This action is irreversible
        </h3>
      </div>
      <button
        type="button"
        class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
        @click="handleClose"
      >
        <PhX :size="24" weight="bold" class="text-white" />
      </button>
    </div>
    <div
      class="h-full w-full overflow-y-auto"
      style="max-height: calc(100vh - 200px)"
    >
      <div class="py-7 px-9 space-y-2 flex-col">
        <p class="text-white">
          <span v-for="(line, index) in warningText.split('\\n')" :key="index">
            {{ line }}<br>
          </span>
          <br>
          <br>
          Are you sure you want to proceed?
        </p>
      </div>
    </div>
    <div class="flex w-full justify-end items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
      <button
        type="button"
        class="transition-all duration-300 bg-transparent text-white hover:opacity-60 px-4 py-2 rounded-lg text-sm border-none"
        @click="handleClose"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="transition-all duration-300 bg-red-500 light:text-white text-white hover:opacity-60 px-4 py-2 rounded-lg text-sm border-none"
        @click="handleConfirm"
      >
        Confirm
      </button>
    </div>
  </div>
</template>

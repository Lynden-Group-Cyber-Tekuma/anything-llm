<script setup>
import { ref } from 'vue'
import showToast from '@/utils/toast'
import { DownloadSimple, Key } from '@phosphor-icons/vue'
import { saveAs } from 'file-saver'
import ModalWrapper from '@/components/ModalWrapper/index.vue'

const props = defineProps({
  recoveryCodes: {
    type: Array,
    required: true
  },
  onDownloadComplete: {
    type: Function,
    required: true
  },
  onClose: {
    type: Function,
    required: true
  }
})

const downloadClicked = ref(false)

const downloadRecoveryCodes = () => {
  const blob = new Blob([props.recoveryCodes.join('\n')], { type: 'text/plain' })
  saveAs(blob, 'recovery_codes.txt')
  downloadClicked.value = true
}

const handleClose = () => {
  if (downloadClicked.value) {
    props.onDownloadComplete()
    props.onClose()
  }
}

const handleCopyToClipboard = () => {
  navigator.clipboard.writeText(props.recoveryCodes.join(',\n')).then(() => {
    showToast('Recovery codes copied to clipboard', 'success', {
      clear: true,
    })
  })
}
</script>

<template>
  <ModalWrapper :isOpen="true">
    <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <Key :size="24" class="text-white" weight="bold" />
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            Recovery Codes
          </h3>
        </div>
      </div>
      <div
        class="h-full w-full overflow-y-auto"
        style="max-height: calc(100vh - 200px)"
      >
        <div class="py-7 px-9 space-y-2 flex-col">
          <p class="text-sm text-white flex flex-col">
            In order to reset your password in the future, you will need these
            recovery codes. Download or copy your recovery codes to save them.
            <br />
            <b class="mt-4">These recovery codes are only shown once!</b>
          </p>
          <div
            class="border-none bg-theme-settings-input-bg text-white hover:text-primary-button flex items-center justify-center rounded-md mt-6 cursor-pointer"
            @click="handleCopyToClipboard"
          >
            <ul class="space-y-2 md:p-6 p-4">
              <li
                v-for="(code, index) in recoveryCodes"
                :key="index"
                class="md:text-sm text-xs"
              >
                {{ code }}
              </li>
            </ul>
          </div>
        </div>
        <div class="flex w-full justify-end items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
          <button
            type="button"
            class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm flex items-center gap-x-2"
            @click="downloadClicked ? handleClose() : downloadRecoveryCodes()"
          >
            <template v-if="downloadClicked">
              Close
            </template>
            <template v-else>
              <DownloadSimple weight="bold" :size="18" />
              <p>Download</p>
            </template>
          </button>
        </div>
      </div>
    </div>
  </ModalWrapper>
</template>

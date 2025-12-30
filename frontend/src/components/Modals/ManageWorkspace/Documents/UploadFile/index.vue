<script setup>
import { CloudArrowUp } from '@phosphor-icons/vue'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import showToast from '@/utils/toast'
import System from '@/models/system'
import { v4 } from 'uuid'
import FileUploadProgress from './FileUploadProgress/index.vue'
import Workspace from '@/models/workspace'
import debounce from 'lodash.debounce'

const props = defineProps({
  workspace: {
    type: Object,
    required: true
  },
  fetchKeys: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:loading', 'update:loadingMessage'])

const { t } = useI18n()
const ready = ref(false)
const files = ref([])
const fetchingUrl = ref(false)
const isDragging = ref(false)

const handleSendLink = async (e) => {
  e.preventDefault()
  emit('update:loading', true)
  emit('update:loadingMessage', 'Scraping link...')
  fetchingUrl.value = true
  const formEl = e.target
  const form = new FormData(formEl)
  const { response, data } = await Workspace.uploadLink(
    props.workspace.slug,
    form.get('link')
  )
  if (!response.ok) {
    showToast(`Error uploading link: ${data.error}`, 'error')
  } else {
    props.fetchKeys(true)
    showToast('Link uploaded successfully', 'success')
    formEl.reset()
  }
  emit('update:loading', false)
  fetchingUrl.value = false
}

// Queue all fetchKeys calls through the same debouncer to prevent spamming the server.
// either a success or error will trigger a fetchKeys call so the UI is not stuck loading.
const debouncedFetchKeys = debounce(() => props.fetchKeys(true), 1000)
const handleUploadSuccess = () => debouncedFetchKeys()
const handleUploadError = () => debouncedFetchKeys()

const processFiles = (fileList) => {
  const acceptedFiles = []
  const rejectedFiles = []

  Array.from(fileList).forEach((file) => {
    // Basic file type validation - accept common document types
    const validTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    if (validTypes.includes(file.type) || file.name.match(/\.(txt|pdf|doc|docx|csv|xls|xlsx|md)$/i)) {
      acceptedFiles.push({
        uid: v4(),
        file,
      })
    } else {
      rejectedFiles.push({
        uid: v4(),
        file,
        rejected: true,
        reason: 'file-invalid-type',
      })
    }
  })

  files.value = [...acceptedFiles, ...rejectedFiles]
}

const onDrop = (e) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false

  if (!ready.value) return

  const droppedFiles = e.dataTransfer.files
  processFiles(droppedFiles)
}

const onDragOver = (e) => {
  e.preventDefault()
  e.stopPropagation()
  if (ready.value) {
    isDragging.value = true
  }
}

const onDragLeave = (e) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false
}

const onFileInputChange = (e) => {
  if (!ready.value) return
  processFiles(e.target.files)
}

const onClick = () => {
  if (ready.value) {
    document.getElementById('file-upload-input').click()
  }
}

onMounted(async () => {
  const online = await System.checkDocumentProcessorOnline()
  ready.value = online
})
</script>

<template>
  <div>
    <div
      :class="[
        'w-[560px] border-dashed border-[2px] border-theme-modal-border light:border-[#686C6F] rounded-2xl bg-theme-bg-primary transition-colors duration-300 p-3',
        ready
          ? 'light:bg-[#E0F2FE] cursor-pointer hover:bg-theme-bg-secondary light:hover:bg-transparent'
          : 'cursor-not-allowed'
      ]"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @click="onClick"
    >
      <input
        id="file-upload-input"
        type="file"
        multiple
        :disabled="!ready"
        @change="onFileInputChange"
        class="hidden"
      />
      <div v-if="ready === false" class="flex flex-col items-center justify-center h-full">
        <CloudArrowUp class="w-8 h-8 text-white/80 light:invert" />
        <div class="text-white text-opacity-80 text-sm font-semibold py-1">
          {{ t('connectors.upload.processor-offline') }}
        </div>
        <div class="text-white text-opacity-60 text-xs font-medium py-1 px-20 text-center">
          {{ t('connectors.upload.processor-offline-desc') }}
        </div>
      </div>
      <div v-else-if="files.length === 0" class="flex flex-col items-center justify-center">
        <CloudArrowUp class="w-8 h-8 text-white/80 light:invert" />
        <div class="text-white text-opacity-80 text-sm font-semibold py-1">
          {{ t('connectors.upload.click-upload') }}
        </div>
        <div class="text-white text-opacity-60 text-xs font-medium py-1">
          {{ t('connectors.upload.file-types') }}
        </div>
      </div>
      <div v-else class="grid grid-cols-2 gap-2 overflow-auto max-h-[180px] p-1 overflow-y-scroll no-scroll">
        <FileUploadProgress
          v-for="file in files"
          :key="file.uid"
          :file="file.file"
          :uuid="file.uid"
          @update:files="files = $event"
          :slug="workspace.slug"
          :rejected="file?.rejected"
          :reason="file?.reason"
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
          @update:loading="emit('update:loading', $event)"
          @update:loadingMessage="emit('update:loadingMessage', $event)"
        />
      </div>
    </div>
    <div class="text-center text-white text-opacity-50 text-xs font-medium w-[560px] py-2">
      {{ t('connectors.upload.or-submit-link') }}
    </div>
    <form @submit="handleSendLink" class="flex gap-x-2">
      <input
        :disabled="fetchingUrl"
        name="link"
        type="url"
        class="border-none disabled:bg-theme-settings-input-bg disabled:text-theme-settings-input-placeholder bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-3/4 p-2.5"
        :placeholder="t('connectors.upload.placeholder-link')"
        autocomplete="off"
      />
      <button
        :disabled="fetchingUrl"
        type="submit"
        class="disabled:bg-white/20 disabled:text-slate-300 disabled:border-slate-400 disabled:cursor-wait bg bg-transparent hover:bg-slate-200 hover:text-slate-800 w-auto border border-white light:border-theme-modal-border text-sm text-white p-2.5 rounded-lg"
      >
        {{ fetchingUrl ? t('connectors.upload.fetching') : t('connectors.upload.fetch-website') }}
      </button>
    </form>
    <div class="mt-6 text-center text-white text-opacity-80 text-xs font-medium w-[560px]">
      {{ t('connectors.upload.privacy-notice') }}
    </div>
  </div>
</template>

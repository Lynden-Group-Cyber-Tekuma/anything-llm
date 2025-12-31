<script setup>
import { ref, onMounted } from 'vue'
import truncate from 'truncate'
import { PhCheckCircle, PhXCircle } from '@phosphor-icons/vue'
import Workspace from '@/models/workspace'
import { humanFileSize, milliToHms } from '@/utils/numbers'
import PreLoader from '@/components/Preloader/index.vue'

const props = defineProps({
  slug: {
    type: String,
    required: true
  },
  uuid: {
    type: String,
    required: true
  },
  file: {
    type: File,
    required: true
  },
  rejected: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:files', 'upload-success', 'upload-error', 'update:loading', 'update:loadingMessage'])

const timerMs = ref(10)
const status = ref('pending')
const error = ref('')
const isFadingOut = ref(false)

const fadeOut = (cb) => {
  isFadingOut.value = true
  cb?.()
}

const beginFadeOut = () => {
  isFadingOut.value = false
  emit('update:files', (prev) => {
    return prev.filter((item) => item.uid !== props.uuid)
  })
}

onMounted(async () => {
  if (!props.file || props.rejected) return

  emit('update:loading', true)
  emit('update:loadingMessage', 'Uploading file...')
  const start = Number(new Date())
  const formData = new FormData()
  formData.append('file', props.file, props.file.name)
  const timer = setInterval(() => {
    timerMs.value = Number(new Date()) - start
  }, 100)

  // Chunk streaming not working in production so we just sit and wait
  const { response, data } = await Workspace.uploadFile(props.slug, formData)
  if (!response.ok) {
    status.value = 'failed'
    clearInterval(timer)
    emit('upload-error', data.error)
    error.value = data.error
  } else {
    emit('update:loading', false)
    emit('update:loadingMessage', '')
    status.value = 'complete'
    clearInterval(timer)
    emit('upload-success')
  }

  // Begin fadeout timer to clear uploader queue.
  setTimeout(() => {
    fadeOut(() => setTimeout(() => beginFadeOut(), 300))
  }, 5000)
})
</script>

<template>
  <!-- Rejected state -->
  <div
    v-if="rejected"
    :class="[
      'h-14 px-2 py-2 flex items-center gap-x-4 rounded-lg bg-error/40 light:bg-error/30 light:border-solid light:border-error/40 border border-transparent',
      isFadingOut ? 'file-upload-fadeout' : 'file-upload'
    ]"
  >
    <div class="w-6 h-6 flex-shrink-0">
      <XCircle
        color="var(--theme-bg-primary)"
        class="w-6 h-6 stroke-white bg-error rounded-full p-1 w-full h-full"
      />
    </div>
    <div class="flex flex-col">
      <p class="text-white light:text-red-600 text-xs font-semibold">
        {{ truncate(file.name, 30) }}
      </p>
      <p class="text-red-100 light:text-red-600 text-xs font-medium">
        {{ reason || 'this file failed to upload' }}
      </p>
    </div>
  </div>

  <!-- Failed state -->
  <div
    v-else-if="status === 'failed'"
    :class="[
      'h-14 px-2 py-2 flex items-center gap-x-4 rounded-lg bg-error/40 light:bg-error/30 light:border-solid light:border-error/40 border border-transparent',
      isFadingOut ? 'file-upload-fadeout' : 'file-upload'
    ]"
  >
    <div class="w-6 h-6 flex-shrink-0">
      <XCircle
        color="var(--theme-bg-primary)"
        class="w-6 h-6 stroke-white bg-error rounded-full p-1 w-full h-full"
      />
    </div>
    <div class="flex flex-col">
      <p class="text-white light:text-red-600 text-xs font-semibold">
        {{ truncate(file.name, 30) }}
      </p>
      <p class="text-red-100 light:text-red-600 text-xs font-medium">
        {{ error }}
      </p>
    </div>
  </div>

  <!-- Pending/Complete state -->
  <div
    v-else
    :class="[
      'h-14 px-2 py-2 flex items-center gap-x-4 rounded-lg bg-zinc-800 light:border-solid light:border-theme-modal-border light:bg-theme-bg-sidebar border border-white/20 shadow-md',
      isFadingOut ? 'file-upload-fadeout' : 'file-upload'
    ]"
  >
    <div class="w-6 h-6 flex-shrink-0">
      <div v-if="status !== 'complete'" class="flex items-center justify-center">
        <PreLoader size="6" />
      </div>
      <CheckCircle
        v-else
        color="var(--theme-bg-primary)"
        class="w-6 h-6 stroke-white bg-green-500 rounded-full p-1 w-full h-full"
      />
    </div>
    <div class="flex flex-col">
      <p class="text-white light:text-theme-text-primary text-xs font-medium">
        {{ truncate(file.name, 30) }}
      </p>
      <p class="text-white/80 light:text-theme-text-secondary text-xs font-medium">
        {{ humanFileSize(file.size) }} | {{ milliToHms(timerMs) }}
      </p>
    </div>
  </div>
</template>

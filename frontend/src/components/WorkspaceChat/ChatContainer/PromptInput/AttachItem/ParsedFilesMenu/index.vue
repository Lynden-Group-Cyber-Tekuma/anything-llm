<script setup>
import { ref, computed } from 'vue'
import { X, CircleNotch, Warning } from '@phosphor-icons/vue'
import Workspace from '@/models/workspace'
import { useRoute } from 'vue-router'
import { nFormatter } from '@/utils/numbers'
import showToast from '@/utils/toast'
import pluralize from 'pluralize'
import { PARSED_FILE_ATTACHMENT_REMOVED_EVENT } from '../../../DnDWrapper'
import useUser from '@/hooks/useUser'

const props = defineProps({
  onEmbeddingChange: Function,
  tooltipRef: Object,
  files: {
    type: Array,
    default: () => []
  },
  setFiles: Function,
  currentTokens: Number,
  setCurrentTokens: Function,
  contextWindow: Number,
  isLoading: Boolean
})

const { user } = useUser()
const canEmbed = computed(() => !user.value || user.value.role !== 'default')
const route = useRoute()
const slug = computed(() => route.params.slug)
const threadSlug = computed(() => route.params.threadSlug || null)

const isEmbedding = ref(false)
const embedProgress = ref(1)

const initialContextWindowLimitExceeded = computed(() =>
  props.contextWindow &&
  props.currentTokens >= props.contextWindow * Workspace.maxContextWindowLimit
)
const contextWindowLimitExceeded = ref(initialContextWindowLimitExceeded.value)

async function handleRemove(e, file) {
  e.preventDefault()
  e.stopPropagation()
  if (!file?.id) return

  const success = await Workspace.deleteParsedFiles(slug.value, [file.id])
  if (!success) return

  // Update the local files list
  props.setFiles(props.files.filter((f) => f.id !== file.id))

  // Dispatch event to update attachment manager
  window.dispatchEvent(
    new CustomEvent(PARSED_FILE_ATTACHMENT_REMOVED_EVENT, {
      detail: { document: file },
    })
  )

  const { currentContextTokenCount } = await Workspace.getParsedFiles(
    slug.value,
    threadSlug.value
  )
  const newContextWindowLimitExceeded =
    props.contextWindow &&
    currentContextTokenCount >=
      props.contextWindow * Workspace.maxContextWindowLimit
  props.setCurrentTokens(currentContextTokenCount)
  contextWindowLimitExceeded.value = newContextWindowLimitExceeded
}

async function handleEmbed() {
  if (!props.files.length) return
  isEmbedding.value = true
  props.onEmbeddingChange?.(true)
  embedProgress.value = 1
  try {
    let completed = 0
    await Promise.all(
      props.files.map((file) =>
        Workspace.embedParsedFile(slug.value, file.id).then(() => {
          completed++
          embedProgress.value = completed + 1
        })
      )
    )
    props.setFiles([])
    const { currentContextTokenCount } = await Workspace.getParsedFiles(
      slug.value,
      threadSlug.value
    )
    props.setCurrentTokens(currentContextTokenCount)
    contextWindowLimitExceeded.value =
      currentContextTokenCount >=
      props.contextWindow * Workspace.maxContextWindowLimit
    showToast(
      `${props.files.length} ${pluralize('file', props.files.length)} embedded successfully`,
      'success'
    )
    props.tooltipRef?.current?.close()
  } catch (error) {
    console.error('Failed to embed files:', error)
    showToast('Failed to embed files', 'error')
  }
  isEmbedding.value = false
  props.onEmbeddingChange?.(false)
  embedProgress.value = 1
}
</script>

<template>
  <div class="flex flex-col gap-2 p-2">
    <div class="flex items-center justify-between">
      <div class="text-sm font-medium text-theme-text-primary">
        Current Context ({{ files.length }} files)
      </div>
      <div
        :data-tooltip-id="contextWindowLimitExceeded && !canEmbed ? 'context-window-limit-exceeded' : undefined"
        :data-tooltip-content="contextWindowLimitExceeded && !canEmbed ? 'You have exceeded the context window limit. Some files may be truncated or excluded from chat responses. Responses may hallucinate or lack relevant information.' : undefined"
        :class="`flex items-center gap-x-1 ${contextWindowLimitExceeded && !canEmbed ? 'cursor-pointer' : ''}`"
      >
        <Warning v-if="contextWindowLimitExceeded" :size="14" class="text-orange-600" />
        <div
          :class="`text-xs ${contextWindowLimitExceeded ? 'text-orange-600' : 'text-theme-text-secondary'}`"
        >
          {{ nFormatter(currentTokens) }} /
          {{ contextWindow ? nFormatter(contextWindow) : '--' }} tokens
        </div>
      </div>
    </div>
    <div
      v-if="contextWindowLimitExceeded && canEmbed"
      class="flex flex-col gap-2 p-2 bg-theme-bg-secondary light:bg-theme-bg-primary rounded"
    >
      <div class="flex items-start gap-2">
        <Warning
          class="flex-shrink-0 mt-1 text-yellow-500 light:text-yellow-600"
          :size="16"
        />
        <div class="text-xs text-theme-text-primary">
          Your context window is getting full. Some files may be truncated
          or excluded from chat responses. We recommend embedding these
          files directly into your workspace for better results.
        </div>
      </div>
      <button
        @click="handleEmbed"
        :disabled="isEmbedding"
        class="border-none disabled:opacity-50 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-primary-button hover:bg-theme-button-primary-hover text-white font-medium rounded transition-colors shadow-sm"
      >
        <template v-if="isEmbedding">
          <CircleNotch :size="14" class="animate-spin" />
          Embedding {{ embedProgress }} of {{ files.length }} files...
        </template>
        <template v-else>
          Embed Files into Workspace
        </template>
      </button>
    </div>
    <div class="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
      <div
        v-for="(file, i) in files"
        :key="i"
        class="flex items-center justify-between gap-2 p-2 text-xs bg-theme-bg-secondary rounded"
      >
        <div class="truncate flex-1 text-theme-text-primary">
          {{ file.title }}
        </div>
        <button
          @click="(e) => handleRemove(e, file)"
          class="border-none text-theme-text-secondary hover:text-theme-text-primary"
          :disabled="isEmbedding"
        >
          <X :size="16" />
        </button>
      </div>
      <div
        v-if="isLoading"
        class="flex items-center justify-center gap-2 text-xs text-theme-text-secondary text-center py-2"
      >
        <CircleNotch :size="16" class="animate-spin" />
        Loading...
      </div>
      <div
        v-if="!isLoading && files.length === 0"
        class="text-xs text-theme-text-secondary text-center py-2"
      >
        No files found
      </div>
    </div>
  </div>
</template>

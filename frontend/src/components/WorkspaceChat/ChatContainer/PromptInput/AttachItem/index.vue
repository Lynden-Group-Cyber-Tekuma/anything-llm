<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { PhPaperclipHorizontal } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Workspace from '@/models/workspace'
import {
  ATTACHMENTS_PROCESSED_EVENT,
  REMOVE_ATTACHMENT_EVENT,
} from '../../DnDWrapper'
import { useTheme } from '@/hooks/useTheme'
import ParsedFilesMenu from './ParsedFilesMenu/index.vue'

const { t } = useI18n()
const { theme } = useTheme()
const route = useRoute()
const slug = computed(() => route.params.slug)
const threadSlug = computed(() => route.params.threadSlug || null)

const tooltipRef = ref(null)
const isEmbedding = ref(false)
const files = ref([])
const currentTokens = ref(0)
const contextWindow = ref(Infinity)
const showTooltip = ref(false)
const isLoading = ref(true)

const fetchFiles = () => {
  if (!slug.value) return
  if (isEmbedding.value) return
  isLoading.value = true
  Workspace.getParsedFiles(slug.value, threadSlug.value)
    .then(({ files: fetchedFiles, contextWindow: cw, currentContextTokenCount }) => {
      files.value = fetchedFiles
      showTooltip.value = fetchedFiles.length > 0
      contextWindow.value = cw
      currentTokens.value = currentContextTokenCount
    })
    .finally(() => {
      isLoading.value = false
    })
}

async function handleRemoveAttachment(e) {
  const { document } = e.detail
  await Workspace.deleteParsedFiles(slug.value, [document.id])
  fetchFiles()
}

function handleClick(e) {
  e?.target?.blur()
  document?.getElementById('dnd-chat-file-uploader')?.click()
}

onMounted(() => {
  fetchFiles()
  window.addEventListener(ATTACHMENTS_PROCESSED_EVENT, fetchFiles)
  window.addEventListener(REMOVE_ATTACHMENT_EVENT, handleRemoveAttachment)
})

onUnmounted(() => {
  window.removeEventListener(ATTACHMENTS_PROCESSED_EVENT, fetchFiles)
  window.removeEventListener(REMOVE_ATTACHMENT_EVENT, handleRemoveAttachment)
})
</script>

<template>
  <div>
    <button
      id="attach-item-btn"
      data-tooltip-id="tooltip-attach-item-btn"
      :aria-label="t('chat_window.attach_file')"
      type="button"
      @click="handleClick"
      @pointerenter="fetchFiles"
      class="border-none relative flex justify-center items-center opacity-60 hover:opacity-100 light:opacity-100 light:hover:opacity-60 cursor-pointer"
    >
      <div class="relative">
        <PaperclipHorizontal
          color="var(--theme-sidebar-footer-icon-fill)"
          class="w-[22px] h-[22px] pointer-events-none text-white rotate-90 -scale-y-100"
        />
        <div
          v-if="files.length > 0"
          class="absolute -top-2 right-[1%] bg-white text-black light:invert text-[8px] rounded-full px-1 flex items-center justify-center"
        >
          {{ files.length }}
        </div>
      </div>
    </button>
    <!-- TODO: Implement with a Vue-compatible tooltip library (e.g., floating-vue, v-tooltip) -->
    <div v-if="showTooltip" ref="tooltipRef" class="hidden">
      <ParsedFilesMenu
        :on-embedding-change="(val) => { isEmbedding = val }"
        :tooltip-ref="tooltipRef"
        :is-loading="isLoading"
        :files="files"
        :set-files="(val) => { files = val }"
        :current-tokens="currentTokens"
        :set-current-tokens="(val) => { currentTokens = val }"
        :context-window="contextWindow"
      />
    </div>
  </div>
</template>

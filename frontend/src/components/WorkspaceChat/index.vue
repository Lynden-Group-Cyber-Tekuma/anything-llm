<script setup>
import { ref, onMounted, watch } from 'vue'
import Workspace from '@/models/workspace'
import LoadingChat from './LoadingChat'
import ChatContainer from './ChatContainer/index.vue'
import paths from '@/utils/paths'
import ModalWrapper from '../ModalWrapper'
import { useRoute } from 'vue-router'
import { DnDFileUploaderProvider } from './ChatContainer/DnDWrapper'
import { PhWarningCircle } from '@phosphor-icons/vue'
import {
  TTSProvider,
  useWatchForAutoPlayAssistantTTSResponse,
} from '../contexts/TTSProvider'

const props = defineProps({
  loading: Boolean,
  workspace: Object
})

useWatchForAutoPlayAssistantTTSResponse()
const route = useRoute()
const threadSlug = route.params.threadSlug || null
const history = ref([])
const loadingHistory = ref(true)

watch([() => props.workspace, () => props.loading], async () => {
  if (props.loading) return
  if (!props.workspace?.slug) {
    loadingHistory.value = false
    return false
  }

  const chatHistory = threadSlug
    ? await Workspace.threads.chatHistory(props.workspace.slug, threadSlug)
    : await Workspace.chatHistory(props.workspace.slug)

  history.value = chatHistory
  loadingHistory.value = false
}, { immediate: true })

onMounted(() => {
  setEventDelegatorForCodeSnippets()
})
</script>

<script>
// Enables us to safely markdown and sanitize all responses without risk of injection
// but still be able to attach a handler to copy code snippets on all elements
// that are code snippets.
function copyCodeSnippet(uuid) {
  const target = document.querySelector(`[data-code="${uuid}"]`)
  if (!target) return false
  const markdown =
    target.parentElement?.parentElement?.querySelector(
      'pre:first-of-type'
    )?.innerText
  if (!markdown) return false

  window.navigator.clipboard.writeText(markdown)
  target.classList.add('text-green-500')
  const originalText = target.innerHTML
  target.innerText = 'Copied!'
  target.setAttribute('disabled', true)

  setTimeout(() => {
    target.classList.remove('text-green-500')
    target.innerHTML = originalText
    target.removeAttribute('disabled')
  }, 2500)
}

// Listens and hunts for all data-code-snippet clicks.
export function setEventDelegatorForCodeSnippets() {
  document?.addEventListener('click', function (e) {
    const target = e.target.closest('[data-code-snippet]')
    const uuidCode = target?.dataset?.code
    if (!uuidCode) return false
    copyCodeSnippet(uuidCode)
  })
}
</script>

<template>
  <LoadingChat v-if="loadingHistory" />
  <template v-else-if="!loading && !loadingHistory && !workspace">
    <ModalWrapper v-if="!loading && !workspace" :is-open="true">
      <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
        <div class="relative p-6 border-b rounded-t border-theme-modal-border">
          <div class="w-full flex gap-x-2 items-center">
            <WarningCircle
              class="text-red-500 w-6 h-6"
              weight="fill"
            />
            <h3 class="text-xl font-semibold text-red-500 overflow-hidden overflow-ellipsis whitespace-nowrap">
              Workspace not found
            </h3>
          </div>
        </div>
        <div class="py-7 px-9 space-y-2 flex-col">
          <p class="text-white text-sm">
            The workspace you're looking for is not available. It may have
            been deleted or you may not have access to it.
          </p>
        </div>
        <div class="flex w-full justify-end items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
          <a
            :href="paths.home()"
            class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
          >
            Return to homepage
          </a>
        </div>
      </div>
    </ModalWrapper>
    <LoadingChat />
  </template>
  <TTSProvider v-else>
    <DnDFileUploaderProvider :workspace="workspace" :thread-slug="threadSlug">
      <ChatContainer :workspace="workspace" :known-history="history" />
    </DnDFileUploaderProvider>
  </TTSProvider>
</template>

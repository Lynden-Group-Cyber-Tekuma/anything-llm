<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Workspace from '@/models/workspace'
import paths from '@/utils/paths'
import showToast from '@/utils/toast'
import { PhPlus, PhCircleNotch, PhTrash } from '@phosphor-icons/vue'
import ThreadItem from './ThreadItem/index.vue'

export const THREAD_RENAME_EVENT = 'renameThread'

const props = defineProps({
  workspace: {
    type: Object,
    required: true
  }
})

const route = useRoute()
const threads = ref([])
const loading = ref(true)
const ctrlPressed = ref(false)
const newThreadLoading = ref(false)

const threadSlug = computed(() => route.params.threadSlug || null)

// Thread rename event handler
function handleThreadRename(event) {
  const { threadSlug: slug, newName } = event.detail
  threads.value = threads.value.map((thread) => {
    if (thread.slug === slug) {
      return { ...thread, name: newName }
    }
    return thread
  })
}

// Fetch threads
async function fetchThreads() {
  if (!props.workspace.slug) return
  const { threads: fetchedThreads } = await Workspace.threads.all(props.workspace.slug)
  loading.value = false
  threads.value = fetchedThreads
}

// Keyboard handlers for bulk deletion
function handleKeyDown(event) {
  if (['Control', 'Meta'].includes(event.key)) {
    ctrlPressed.value = true
  }
}

function handleKeyUp(event) {
  if (['Control', 'Meta'].includes(event.key)) {
    ctrlPressed.value = false
    // when toggling, unset bulk progress so
    // previously marked threads that were never deleted
    // come back to life.
    threads.value = threads.value.map((t) => {
      return { ...t, deleted: false }
    })
  }
}

function toggleForDeletion(id) {
  threads.value = threads.value.map((t) => {
    if (t.id !== id) return t
    return { ...t, deleted: !t.deleted }
  })
}

async function handleDeleteAll() {
  const slugs = threads.value.filter((t) => t.deleted === true).map((t) => t.slug)
  await Workspace.threads.deleteBulk(props.workspace.slug, slugs)
  threads.value = threads.value.filter((t) => !t.deleted)

  // Only redirect if current thread is being deleted
  if (slugs.includes(threadSlug.value)) {
    window.location.href = paths.workspace.chat(props.workspace.slug)
  }
}

function removeThread(threadId) {
  threads.value = threads.value.map((_t) => {
    if (_t.id !== threadId) return _t
    return { ..._t, deleted: true }
  })

  // Show thread was deleted, but then remove from threads entirely so it will
  // not appear in bulk-selection.
  setTimeout(() => {
    threads.value = threads.value.filter((t) => !t.deleted)
  }, 500)
}

async function createNewThread() {
  newThreadLoading.value = true
  const { thread, error } = await Workspace.threads.new(props.workspace.slug)
  if (error) {
    showToast(`Could not create thread - ${error}`, 'error', { clear: true })
    newThreadLoading.value = false
    return
  }
  window.location.replace(
    paths.workspace.thread(props.workspace.slug, thread.slug)
  )
}

const activeThreadIdx = computed(() => {
  const foundThread = threads.value.find((thread) => thread?.slug === threadSlug.value)
  if (foundThread) {
    return threads.value.findIndex((thread) => thread?.slug === threadSlug.value) + 1
  }
  return 0
})

const deletedThreadsCount = computed(() => {
  return threads.value.filter((t) => t.deleted).length
})

const showDeleteButton = computed(() => {
  return ctrlPressed.value && deletedThreadsCount.value > 0
})

// Lifecycle hooks
onMounted(() => {
  // Add thread rename event listener
  window.addEventListener(THREAD_RENAME_EVENT, handleThreadRename)

  // Add keyboard event listeners
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  // Fetch threads
  fetchThreads()
})

onUnmounted(() => {
  window.removeEventListener(THREAD_RENAME_EVENT, handleThreadRename)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})

// Watch workspace.slug changes
watch(() => props.workspace.slug, () => {
  fetchThreads()
})
</script>

<template>
  <!-- Loading State -->
  <div v-if="loading" class="flex flex-col bg-pulse w-full h-10 items-center justify-center">
    <p class="text-xs text-white animate-pulse">loading threads....</p>
  </div>

  <!-- Thread List -->
  <div v-else class="flex flex-col" role="list" aria-label="Threads">
    <!-- Default Thread -->
    <ThreadItem
      :idx="0"
      :activeIdx="activeThreadIdx"
      :isActive="activeThreadIdx === 0"
      :thread="{ slug: null, name: 'default' }"
      :workspace="workspace"
      :hasNext="threads.length > 0"
      :onRemove="removeThread"
      :toggleMarkForDeletion="toggleForDeletion"
    />

    <!-- User Threads -->
    <ThreadItem
      v-for="(thread, i) in threads"
      :key="thread.slug"
      :idx="i + 1"
      :ctrlPressed="ctrlPressed"
      :toggleMarkForDeletion="toggleForDeletion"
      :activeIdx="activeThreadIdx"
      :isActive="activeThreadIdx === i + 1"
      :workspace="workspace"
      :onRemove="removeThread"
      :thread="thread"
      :hasNext="i !== threads.length - 1"
    />

    <!-- Delete All Button -->
    <button
      v-if="showDeleteButton"
      type="button"
      @click="handleDeleteAll"
      class="w-full relative flex h-[40px] items-center border-none hover:bg-red-400/20 rounded-lg group"
    >
      <div class="flex w-full gap-x-2 items-center pl-4">
        <div class="bg-transparent p-2 rounded-lg h-[24px] w-[24px] flex items-center justify-center">
          <Trash
            weight="bold"
            :size="14"
            class="shrink-0 text-white light:text-red-500/50 group-hover:text-red-400"
          />
        </div>
        <p class="text-white light:text-theme-text-secondary text-left text-sm group-hover:text-red-400">
          Delete Selected
        </p>
      </div>
    </button>

    <!-- New Thread Button -->
    <button
      @click="createNewThread"
      class="w-full relative flex h-[40px] items-center border-none hover:bg-[var(--theme-sidebar-thread-selected)] hover:light:bg-theme-sidebar-subitem-hover rounded-lg"
    >
      <div class="flex w-full gap-x-2 items-center pl-4">
        <div class="bg-white/20 p-2 rounded-lg h-[24px] w-[24px] flex items-center justify-center">
          <CircleNotch
            v-if="newThreadLoading"
            weight="bold"
            :size="14"
            class="shrink-0 animate-spin text-white light:text-theme-text-primary"
          />
          <Plus
            v-else
            weight="bold"
            :size="14"
            class="shrink-0 text-white light:text-theme-text-primary"
          />
        </div>

        <p class="text-left text-white light:text-theme-text-primary text-sm">
          {{ newThreadLoading ? 'Starting Thread...' : 'New Thread' }}
        </p>
      </div>
    </button>
  </div>
</template>

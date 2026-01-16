<template>
  <CanViewChatHistory>
    <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      <Sidebar />
      <div
        :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
        class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
      >
        <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
          <div class="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
            <div class="flex flex-wrap gap-4 items-center">
              <p class="text-lg leading-6 font-bold text-theme-text-primary">
                {{ t('recorded.title') }}
              </p>
              <div class="relative">
                <button
                  ref="openMenuButton"
                  @click="toggleMenu"
                  class="flex items-center gap-x-2 px-4 py-1 rounded-lg bg-primary-button hover:light:bg-theme-bg-primary hover:text-theme-text-primary text-xs font-semibold hover:bg-secondary shadow-[0_4px_14px_rgba(0,0,0,0.25)] h-[34px] w-fit"
                >
                  <Download :size="18" weight="bold" />
                  {{ t('recorded.export') }}
                  <CaretDown :size="18" weight="bold" />
                </button>
                <div
                  ref="menuRef"
                  :class="[
                    showMenu ? 'slide-down' : 'slide-up hidden',
                    'z-20 w-fit rounded-lg absolute top-full right-0 bg-secondary light:bg-theme-bg-secondary mt-2 shadow-md'
                  ]"
                >
                  <div class="py-2">
                    <button
                      v-for="[key, data] in Object.entries(exportOptions)"
                      :key="key"
                      @click="() => { handleDumpChats(key); showMenu = false }"
                      class="w-full text-left px-4 py-2 text-white text-sm hover:bg-[#3D4147] light:hover:bg-theme-sidebar-item-hover"
                    >
                      {{ data.name }}
                    </button>
                  </div>
                </div>
              </div>
              <button
                v-if="chats.length > 0"
                @click="handleClearAllChats"
                class="flex items-center gap-x-2 px-4 py-1 border hover:border-transparent light:border-theme-sidebar-border border-white/40 text-white/40 light:text-theme-text-secondary rounded-lg bg-transparent hover:light:text-theme-bg-primary hover:text-theme-text-primary text-xs font-semibold hover:bg-red-500 shadow-[0_4px_14px_rgba(0,0,0,0.25)] h-[34px] w-fit"
              >
                <Trash :size="18" weight="bold" />
                Clear Chats
              </button>
            </div>
            <p class="text-xs leading-[18px] font-base text-theme-text-secondary mt-2">
              {{ t('recorded.description') }}
            </p>
          </div>
          <div class="overflow-x-auto">
            <ChatsContainer
              :loading="loading"
              :chats="chats"
              :offset="offset"
              :canNext="canNext"
              @setChats="(newChats) => chats = newChats"
              @setOffset="(newOffset) => offset = newOffset"
            />
          </div>
        </div>
      </div>
    </div>
  </CanViewChatHistory>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import { isMobile } from 'react-device-detect'
import Skeleton from 'vue-loading-skeleton'
import { useRoute } from 'vue-router'
import ChatRow from './ChatRow/index.vue'
import showToast from '@/utils/toast'
import System from '@/models/system'
import { PhCaretDown, PhDownload, PhTrash } from '@phosphor-icons/vue'
import { saveAs } from 'file-saver'
import { CanViewChatHistory } from '@/components/CanViewChatHistory/index.vue'

const exportOptions = {
  csv: {
    name: 'CSV',
    mimeType: 'text/csv',
    fileExtension: 'csv',
    filenameFunc: () => {
      return `anythingllm-chats-${new Date().toLocaleDateString()}`
    },
  },
  json: {
    name: 'JSON',
    mimeType: 'application/json',
    fileExtension: 'json',
    filenameFunc: () => {
      return `anythingllm-chats-${new Date().toLocaleDateString()}`
    },
  },
  jsonl: {
    name: 'JSONL',
    mimeType: 'application/jsonl',
    fileExtension: 'jsonl',
    filenameFunc: () => {
      return `anythingllm-chats-${new Date().toLocaleDateString()}-lines`
    },
  },
  jsonAlpaca: {
    name: 'JSON (Alpaca)',
    mimeType: 'application/json',
    fileExtension: 'json',
    filenameFunc: () => {
      return `anythingllm-chats-${new Date().toLocaleDateString()}-alpaca`
    },
  },
}

const { t } = useI18n()
const route = useRoute()
const showMenu = ref(false)
const menuRef = ref(null)
const openMenuButton = ref(null)
const loading = ref(true)
const chats = ref([])
const offset = ref(Number(route.query.offset || 0))
const canNext = ref(false)

const handleDumpChats = async (exportType) => {
  const chatsData = await System.exportChats(exportType, 'workspace')
  if (!!chatsData) {
    const { name, mimeType, fileExtension, filenameFunc } =
      exportOptions[exportType]
    const blob = new Blob([chatsData], { type: mimeType })
    saveAs(blob, `${filenameFunc()}.${fileExtension}`)
    showToast(`Chats exported successfully as ${name}.`, 'success')
  } else {
    showToast('Failed to export chats.', 'error')
  }
}

const handleClearAllChats = async () => {
  if (
    !window.confirm(
      `Are you sure you want to clear all chats?\n\nThis action is irreversible.`
    )
  )
    return false
  await System.deleteChat(-1)
  chats.value = []
  showToast('Cleared all chats.', 'success')
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleClickOutside = (event) => {
  if (
    menuRef.value &&
    !menuRef.value.contains(event.target) &&
    openMenuButton.value &&
    !openMenuButton.value.contains(event.target)
  ) {
    showMenu.value = false
  }
}

onMounted(async () => {
  const { chats: _chats = [], hasPages = false } =
    await System.chats(offset.value)
  chats.value = _chats
  canNext.value = hasPages
  loading.value = false

  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<script>
import { ref, watch } from 'vue'
import System from '@/models/system'
import Skeleton from 'vue-loading-skeleton'
import ChatRow from './ChatRow/index.vue'
import { useI18n } from 'vue-i18n'

export const ChatsContainer = {
  name: 'ChatsContainer',
  props: {
    loading: Boolean,
    chats: Array,
    offset: Number,
    canNext: Boolean
  },
  emits: ['setChats', 'setOffset'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const handlePrevious = () => {
      emit('setOffset', Math.max(props.offset - 1, 0))
    }

    const handleNext = () => {
      emit('setOffset', props.offset + 1)
    }

    const handleDeleteChat = async (chatId) => {
      await System.deleteChat(chatId)
      emit('setChats', props.chats.filter((chat) => chat.id !== chatId))
    }

    watch(() => props.offset, async (newOffset) => {
      const { chats: _chats = [], hasPages = false } = await System.chats(newOffset)
      emit('setChats', _chats)
      // Note: canNext would need to be emitted separately if needed
    })

    return {
      t,
      handlePrevious,
      handleNext,
      handleDeleteChat
    }
  },
  template: `
    <div v-if="loading">
      <Skeleton
        height="80vh"
        width="100%"
        highlightColor="var(--theme-bg-primary)"
        baseColor="var(--theme-bg-secondary)"
        :count="1"
        class="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm"
        containerClass="flex w-full"
      />
    </div>
    <div v-else>
      <table class="w-full text-xs text-left rounded-lg min-w-[640px] border-spacing-0">
        <thead class="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
          <tr>
            <th scope="col" class="px-6 py-3 rounded-tl-lg">
              {{ t('recorded.table.id') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('recorded.table.by') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('recorded.table.workspace') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('recorded.table.prompt') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('recorded.table.response') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('recorded.table.at') }}
            </th>
            <th scope="col" class="px-6 py-3 rounded-tr-lg">
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody>
          <ChatRow
            v-for="chat in chats"
            :key="chat.id"
            :chat="chat"
            @delete="handleDeleteChat"
          />
        </tbody>
      </table>
      <div class="flex w-full justify-between items-center mt-6">
        <button
          @click="handlePrevious"
          :disabled="offset === 0"
          class="px-4 py-2 rounded-lg border border-theme-text-secondary text-theme-text-secondary text-sm items-center flex gap-x-2 hover:bg-theme-text-secondary hover:text-theme-bg-secondary disabled:invisible"
        >
          Previous Page
        </button>
        <button
          @click="handleNext"
          :disabled="!canNext"
          class="px-4 py-2 rounded-lg border border-slate-200 text-slate-200 light:text-theme-text-secondary light:border-theme-sidebar-border text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 disabled:invisible"
        >
          Next Page
        </button>
      </div>
    </div>
  `,
  components: { Skeleton, ChatRow }
}
</script>

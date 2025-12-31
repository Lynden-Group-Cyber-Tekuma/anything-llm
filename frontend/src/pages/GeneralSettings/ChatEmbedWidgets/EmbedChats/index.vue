<template>
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
  <div v-else class="flex flex-col w-full p-4 overflow-none">
    <div class="w-full flex flex-col gap-y-1">
      <div class="flex flex-wrap gap-4 items-center">
        <p class="text-lg leading-6 font-bold text-theme-text-primary">
          {{ t('embed-chats.title') }}
        </p>
        <div class="relative">
          <button
            ref="openMenuButton"
            @click="toggleMenu"
            class="flex items-center gap-x-2 px-4 py-1 rounded-lg text-theme-bg-chat bg-primary-button hover:bg-secondary hover:text-white text-xs font-semibold h-[34px] w-fit"
          >
            <Download :size="18" weight="bold" />
            {{ t('embed-chats.export') }}
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
                @click="() => {
                  handleDumpChats(key)
                  showMenu = false
                }"
                class="w-full text-left px-4 py-2 text-white text-sm hover:bg-[#3D4147] light:hover:bg-theme-sidebar-item-hover"
              >
                {{ data.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <p class="text-xs leading-[18px] font-base text-theme-text-secondary mt-2">
        {{ t('embed-chats.description') }}
      </p>
    </div>
    <div class="overflow-x-auto mt-6">
      <table class="w-full text-xs text-left rounded-lg min-w-[640px] border-spacing-0">
        <thead class="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
          <tr>
            <th scope="col" class="px-6 py-3 rounded-tl-lg">
              {{ t('embed-chats.table.embed') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('embed-chats.table.sender') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('embed-chats.table.message') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('embed-chats.table.response') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('embed-chats.table.at') }}
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
      <div v-if="offset > 0 || canNext" class="flex items-center justify-end gap-2 mt-4 pb-6">
        <button
          @click="handlePrevious"
          :disabled="offset === 0"
          :class="[
            'px-4 py-2 text-sm rounded-lg',
            offset === 0
              ? 'bg-theme-bg-secondary text-theme-text-disabled cursor-not-allowed'
              : 'bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-hover'
          ]"
        >
          {{ t('common.previous') }}
        </button>
        <button
          @click="handleNext"
          :disabled="!canNext"
          :class="[
            'px-4 py-2 text-sm rounded-lg',
            !canNext
              ? 'bg-theme-bg-secondary text-theme-text-disabled cursor-not-allowed'
              : 'bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-hover'
          ]"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Skeleton from 'vue-loading-skeleton'
import 'vue-loading-skeleton/dist/style.css'
import { useRoute } from 'vue-router'
import ChatRow from './ChatRow/index.vue'
import Embed from '@/models/embed'
import { useI18n } from 'vue-i18n'
import { PhCaretDown, PhDownload } from '@phosphor-icons/vue'
import showToast from '@/utils/toast'
import { saveAs } from 'file-saver'
import System from '@/models/system'

const exportOptions = {
  csv: {
    name: 'CSV',
    mimeType: 'text/csv',
    fileExtension: 'csv',
    filenameFunc: () => {
      return `anythingllm-embed-chats-${new Date().toLocaleDateString()}`
    },
  },
  json: {
    name: 'JSON',
    mimeType: 'application/json',
    fileExtension: 'json',
    filenameFunc: () => {
      return `anythingllm-embed-chats-${new Date().toLocaleDateString()}`
    },
  },
  jsonl: {
    name: 'JSONL',
    mimeType: 'application/jsonl',
    fileExtension: 'jsonl',
    filenameFunc: () => {
      return `anythingllm-embed-chats-${new Date().toLocaleDateString()}-lines`
    },
  },
  jsonAlpaca: {
    name: 'JSON (Alpaca)',
    mimeType: 'application/json',
    fileExtension: 'json',
    filenameFunc: () => {
      return `anythingllm-embed-chats-${new Date().toLocaleDateString()}-alpaca`
    },
  },
}

const { t } = useI18n()
const route = useRoute()
const menuRef = ref(null)
const openMenuButton = ref(null)
const showMenu = ref(false)
const loading = ref(true)
const chats = ref([])
const offset = ref(Number(route.query.offset || 0))
const canNext = ref(false)

const handleDumpChats = async (exportType) => {
  const chatsData = await System.exportChats(exportType, 'embed')
  if (!!chatsData) {
    const { name, mimeType, fileExtension, filenameFunc } =
      exportOptions[exportType]
    const blob = new Blob([chatsData], { type: mimeType })
    saveAs(blob, `${filenameFunc()}.${fileExtension}`)
    showToast(`Embed chats exported successfully as ${name}.`, 'success')
  } else {
    showToast('Failed to export embed chats.', 'error')
  }
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

const fetchChats = async () => {
  loading.value = true
  await Embed.chats(offset.value)
    .then(({ chats: _chats, hasPages = false }) => {
      chats.value = _chats
      canNext.value = hasPages
    })
    .finally(() => {
      loading.value = false
    })
}

const handlePrevious = () => {
  offset.value = Math.max(offset.value - 1, 0)
}

const handleNext = () => {
  offset.value = offset.value + 1
}

const handleDeleteChat = (chatId) => {
  chats.value = chats.value.filter((chat) => chat.id !== chatId)
}

onMounted(() => {
  fetchChats()
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(offset, () => {
  fetchChats()
})
</script>

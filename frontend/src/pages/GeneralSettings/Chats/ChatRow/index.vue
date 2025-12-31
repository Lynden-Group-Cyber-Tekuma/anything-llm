<template>
  <tr class="bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10">
    <td class="px-6 font-medium whitespace-nowrap text-white">
      {{ chat.id }}
    </td>
    <td class="px-6 font-medium whitespace-nowrap text-white">
      {{ chat.user?.username }}
    </td>
    <td class="px-6">{{ chat.workspace?.name }}</td>
    <td
      @click="openPromptModal"
      class="px-6 border-transparent cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
    >
      {{ truncate(chat.prompt, 40) }}
    </td>
    <td
      @click="openResponseModal"
      class="px-6 cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
    >
      {{ truncate(safeJsonParse(chat.response, {})?.text, 40) }}
    </td>
    <td class="px-6">{{ chat.createdAt }}</td>
    <td class="px-6 flex items-center gap-x-6 h-full mt-1">
      <button
        @click="handleDelete"
        class="text-xs font-medium text-white/80 light:text-black/80 hover:light:text-red-500 hover:text-red-300 rounded-lg px-2 py-1 hover:bg-white hover:light:bg-red-50 hover:bg-opacity-10"
      >
        <Trash class="h-5 w-5" />
      </button>
    </td>
  </tr>
  <ModalWrapper :isOpen="isPromptOpen">
    <TextPreview :text="chat.prompt" @close="closePromptModal" />
  </ModalWrapper>
  <ModalWrapper :isOpen="isResponseOpen">
    <TextPreview @close="closeResponseModal">
      <MarkdownRenderer :content="safeJsonParse(chat.response, {})?.text" />
    </TextPreview>
  </ModalWrapper>
</template>

<script setup>
import truncate from 'truncate'
import { Trash } from '@phosphor-icons/vue'
import System from '@/models/system'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import { useModal } from '@/hooks/useModal'
import MarkdownRenderer from '../MarkdownRenderer.vue'
import { safeJsonParse } from '@/utils/request'

const props = defineProps({
  chat: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete'])

const {
  isOpen: isPromptOpen,
  openModal: openPromptModal,
  closeModal: closePromptModal,
} = useModal()

const {
  isOpen: isResponseOpen,
  openModal: openResponseModal,
  closeModal: closeResponseModal,
} = useModal()

const handleDelete = async () => {
  if (
    !window.confirm(
      `Are you sure you want to delete this chat?\n\nThis action is irreversible.`
    )
  )
    return false
  await System.deleteChat(props.chat.id)
  emit('delete', props.chat.id)
}
</script>

<script>
import { X } from '@phosphor-icons/vue'

export const TextPreview = {
  name: 'TextPreview',
  props: {
    text: {
      type: String,
      default: ''
    }
  },
  emits: ['close'],
  template: `
    <div class="relative w-full md:max-w-2xl max-h-full">
      <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b rounded-t border-theme-modal-border">
          <h3 class="text-xl font-semibold text-white">Viewing Text</h3>
          <button
            @click="$emit('close')"
            type="button"
            class="bg-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center bg-sidebar-button hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
          >
            <X class="text-white text-lg" />
          </button>
        </div>
        <div class="w-full p-6">
          <pre v-if="text" class="w-full h-[200px] py-2 px-4 whitespace-pre-line overflow-auto rounded-lg bg-zinc-900 light:bg-theme-bg-secondary border border-gray-500 text-white text-sm">{{ text }}</pre>
          <div v-else class="w-full h-[200px] py-2 px-4 overflow-auto rounded-lg bg-zinc-900 light:bg-theme-bg-secondary border border-gray-500 text-white text-sm">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  `,
  components: { X }
}
</script>

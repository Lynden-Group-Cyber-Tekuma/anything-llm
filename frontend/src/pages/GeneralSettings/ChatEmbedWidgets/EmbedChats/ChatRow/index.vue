<template>
  <tr class="bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10">
    <td class="px-6 font-medium whitespace-nowrap text-white">
      <a
        :href="paths.settings.embedChatWidgets()"
        target="_blank"
        rel="noreferrer"
        class="text-white flex items-center hover:underline"
      >
        {{ chat.embed_config.workspace.name }}
      </a>
    </td>
    <td
      @click="openConnectionDetailsModal"
      class="px-6 cursor-pointer hover:shadow-lg"
    >
      <div class="flex flex-col">
        <p>{{ truncate(chat.session_id, 20) }}</p>
      </div>
    </td>
    <td
      @click="openPromptModal"
      class="px-6 border-transparent cursor-pointer hover:shadow-lg"
    >
      {{ truncate(chat.prompt, 40) }}
    </td>
    <td
      @click="openResponseModal"
      class="px-6 cursor-pointer hover:shadow-lg"
    >
      {{ truncate(safeJsonParse(chat.response, {})?.text, 40) }}
    </td>
    <td class="px-6">{{ chat.createdAt }}</td>
    <td class="px-6 flex items-center gap-x-6 h-full mt-1">
      <button
        @click="handleDelete"
        class="group text-xs font-medium text-theme-text-secondary px-2 py-1 rounded-lg hover:bg-theme-button-delete-hover-bg"
      >
        <span class="group-hover:text-theme-button-delete-hover-text">
          Delete
        </span>
      </button>
    </td>
  </tr>
  <ModalWrapper :isOpen="isPromptOpen">
    <TextPreview :text="chat.prompt" :closeModal="closePromptModal" />
  </ModalWrapper>
  <ModalWrapper :isOpen="isResponseOpen">
    <TextPreview :closeModal="closeResponseModal">
      <template #text>
        <MarkdownRenderer
          :content="safeJsonParse(chat.response, {})?.text"
        />
      </template>
    </TextPreview>
  </ModalWrapper>
  <ModalWrapper :isOpen="isConnectionDetailsModalOpen">
    <TextPreview :closeModal="closeConnectionDetailsModal">
      <template #text>
        <ConnectionDetails
          :sessionId="chat.session_id"
          :verbose="true"
          :connection_information="chat.connection_information"
        />
      </template>
    </TextPreview>
  </ModalWrapper>
</template>

<script setup>
import { ref } from 'vue'
import truncate from 'truncate'
import { X } from '@phosphor-icons/vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import { useModal } from '@/hooks/useModal'
import paths from '@/utils/paths'
import Embed from '@/models/embed'
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
const {
  isOpen: isConnectionDetailsModalOpen,
  openModal: openConnectionDetailsModal,
  closeModal: closeConnectionDetailsModal,
} = useModal()

const handleDelete = async () => {
  if (
    !window.confirm(
      `Are you sure you want to delete this chat?\n\nThis action is irreversible.`
    )
  )
    return false
  await Embed.deleteChat(props.chat.id)
  emit('delete', props.chat.id)
}
</script>

<script>
import { computed } from 'vue'
import { X } from '@phosphor-icons/vue'
import { safeJsonParse } from '@/utils/request'

export const TextPreview = {
  name: 'TextPreview',
  props: {
    text: String,
    closeModal: Function
  },
  template: `
    <div class="relative w-full md:max-w-2xl max-h-full">
      <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b rounded-t border-theme-modal-border">
          <h3 class="text-xl font-semibold text-white">Viewing Text</h3>
          <button
            @click="closeModal"
            type="button"
            class="bg-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center bg-sidebar-button hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
          >
            <X class="text-white text-lg" />
          </button>
        </div>
        <div class="w-full p-6">
          <div class="w-full h-[60vh] py-2 px-4 whitespace-pre-line overflow-auto rounded-lg bg-zinc-900 light:bg-theme-bg-secondary border border-gray-500 text-white text-sm">
            <slot name="text">{{ text }}</slot>
          </div>
        </div>
      </div>
    </div>
  `
}

export const ConnectionDetails = {
  name: 'ConnectionDetails',
  props: {
    sessionId: String,
    verbose: {
      type: Boolean,
      default: false
    },
    connection_information: String
  },
  setup(props) {
    const details = computed(() => safeJsonParse(props.connection_information, {}))
    const hasDetails = computed(() => Object.keys(details.value).length > 0)

    return {
      details,
      hasDetails
    }
  },
  template: `
    <template v-if="hasDetails">
      <template v-if="verbose">
        <p class="text-xs text-theme-text-secondary">
          sessionID: {{ sessionId }}
        </p>
        <p v-if="details.username" class="text-xs text-theme-text-secondary">
          username: {{ details.username }}
        </p>
        <p v-if="details.ip" class="text-xs text-theme-text-secondary">
          client ip address: {{ details.ip }}
        </p>
        <p v-if="details.host" class="text-xs text-theme-text-secondary">
          client host URL: {{ details.host }}
        </p>
      </template>
      <template v-else>
        <p v-if="details.username" class="text-xs text-theme-text-secondary">{{ details.username }}</p>
        <p v-if="details.ip" class="text-xs text-theme-text-secondary">{{ details.ip }}</p>
        <p v-if="details.host" class="text-xs text-theme-text-secondary">{{ details.host }}</p>
      </template>
    </template>
  `
}
</script>

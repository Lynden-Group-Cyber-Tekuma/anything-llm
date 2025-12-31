<template>
  <tr
    ref="rowRef"
    class="bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10"
  >
    <th
      scope="row"
      class="px-6 whitespace-nowrap flex item-center gap-x-1"
    >
      <a
        :href="paths.workspace.chat(embed.workspace.slug)"
        target="_blank"
        rel="noreferrer"
        class="text-white flex items-center hover:underline"
      >
        {{ embed.workspace.name }}
      </a>
    </th>
    <th scope="row" class="px-6 whitespace-nowrap">
      {{ nFormatter(embed._count.embed_chats) }}
    </th>
    <th scope="row" class="px-6 whitespace-nowrap">
      <ActiveDomains :domainList="embed.allowlist_domains" />
    </th>
    <th
      scope="row"
      class="px-6 whitespace-nowrap text-theme-text-secondary !font-normal"
    >
      {{
        // If the embed was created more than a day ago, show the date, otherwise show the time ago
        moment(embed.createdAt).diff(moment(), 'days') > 0
          ? moment(embed.createdAt).format('MMM D, YYYY')
          : moment(embed.createdAt).fromNow()
      }}
    </th>
    <td class="px-6 flex items-center gap-x-6 h-full mt-1">
      <button
        @click="openSnippetModal"
        class="group text-xs font-medium text-theme-text-secondary px-2 py-1 rounded-lg hover:bg-theme-button-code-hover-bg"
      >
        <span class="group-hover:text-theme-button-code-hover-text">
          Code
        </span>
      </button>
      <button
        @click="handleSuspend"
        class="group text-xs font-medium text-theme-text-secondary px-2 py-1 rounded-lg hover:bg-theme-button-disable-hover-bg"
      >
        <span class="group-hover:text-theme-button-disable-hover-text">
          {{ enabled ? 'Disable' : 'Enable' }}
        </span>
      </button>
      <button
        @click="handleDelete"
        class="group text-xs font-medium text-theme-text-secondary px-2 py-1 rounded-lg hover:bg-theme-button-delete-hover-bg"
      >
        <span class="group-hover:text-theme-button-delete-hover-text">
          Delete
        </span>
      </button>
      <button
        @click="openSettingsModal"
        class="text-xs font-medium text-theme-button-text hover:text-theme-text-secondary hover:bg-theme-hover px-2 py-1 rounded-lg"
      >
        <DotsThreeOutline weight="fill" class="h-5 w-5" />
      </button>
    </td>
  </tr>
  <ModalWrapper :isOpen="isSettingsOpen">
    <EditEmbedModal :embed="embed" :closeModal="closeSettingsModal" />
  </ModalWrapper>
  <ModalWrapper :isOpen="isSnippetOpen">
    <CodeSnippetModal :embed="embed" :closeModal="closeSnippetModal" />
  </ModalWrapper>
</template>

<script setup>
import { ref } from 'vue'
import { DotsThreeOutline } from '@phosphor-icons/vue'
import showToast from '@/utils/toast'
import { useModal } from '@/hooks/useModal'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import Embed from '@/models/embed'
import paths from '@/utils/paths'
import { nFormatter } from '@/utils/numbers'
import EditEmbedModal from './EditEmbedModal/index.vue'
import CodeSnippetModal from './CodeSnippetModal/index.vue'
import moment from 'moment'
import { safeJsonParse } from '@/utils/request'

const props = defineProps({
  embed: {
    type: Object,
    required: true
  }
})

const rowRef = ref(null)
const enabled = ref(Number(props.embed.enabled) === 1)
const {
  isOpen: isSettingsOpen,
  openModal: openSettingsModal,
  closeModal: closeSettingsModal,
} = useModal()
const {
  isOpen: isSnippetOpen,
  openModal: openSnippetModal,
  closeModal: closeSnippetModal,
} = useModal()

const handleSuspend = async () => {
  if (
    !window.confirm(
      `Are you sure you want to disabled this embed?\nOnce disabled the embed will no longer respond to any chat requests.`
    )
  )
    return false

  const { success, error } = await Embed.updateEmbed(props.embed.id, {
    enabled: !enabled.value,
  })
  if (!success) showToast(error, 'error', { clear: true })
  if (success) {
    showToast(
      `Embed ${enabled.value ? 'has been disabled' : 'is active'}.`,
      'success',
      { clear: true }
    )
    enabled.value = !enabled.value
  }
}

const handleDelete = async () => {
  if (
    !window.confirm(
      `Are you sure you want to delete this embed?\nOnce deleted this embed will no longer respond to chats or be active.\n\nThis action is irreversible.`
    )
  )
    return false
  const { success, error } = await Embed.deleteEmbed(props.embed.id)
  if (!success) showToast(error, 'error', { clear: true })
  if (success) {
    rowRef.value?.remove()
    showToast('Embed deleted from system.', 'success', { clear: true })
  }
}
</script>

<script>
import { safeJsonParse } from '@/utils/request'

export const ActiveDomains = {
  name: 'ActiveDomains',
  props: {
    domainList: String
  },
  setup(props) {
    const domains = computed(() => safeJsonParse(props.domainList, []))
    return { domains }
  },
  template: `
    <p v-if="domains.length === 0">all</p>
    <div v-else class="flex flex-col gap-y-2">
      <p
        v-for="(domain, index) in domains"
        :key="index"
        class="font-mono !font-normal"
      >
        {{ domain }}
      </p>
    </div>
  `
}
</script>

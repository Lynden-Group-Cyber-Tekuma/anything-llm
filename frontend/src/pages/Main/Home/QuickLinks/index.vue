<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PhPaperPlaneTilt, PhFileArrowUp, PhPlus } from '@phosphor-icons/vue'
import Workspace from '@/models/workspace'
import paths from '@/utils/paths'
import showToast from '@/utils/toast'
import { useManageWorkspaceModal } from '@/components/Modals/ManageWorkspace'
import { useNewWorkspaceModal } from '@/components/Modals/NewWorkspace'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const workspaces = ref([])
const selectedWorkspace = ref(null)

const { showModal: showNewWsModal } = useNewWorkspaceModal()
const { showModal: showManageWsModal } = useManageWorkspaceModal()

onMounted(async () => {
  workspaces.value = await Workspace.all()
})

const sendChat = async () => {
  if (workspaces.value.length === 0) {
    showToast(t('main-page.noWorkspaceError'), 'warning', { clear: true })
    return
  }

  const firstWorkspace = workspaces.value[0]
  router.push(paths.workspace.chat(firstWorkspace.slug))
}

const embedDocument = async () => {
  if (workspaces.value.length === 0) {
    showToast(t('main-page.noWorkspaceError'), 'warning', { clear: true })
    return
  }

  const firstWorkspace = workspaces.value[0]
  selectedWorkspace.value = firstWorkspace
  showManageWsModal()
}

const createWorkspace = () => {
  showNewWsModal()
}

const quickLinks = [
  {
    title: t('main-page.quick-links.send_chat.title'),
    description: t('main-page.quick-links.send_chat.description'),
    icon: PaperPlaneTilt,
    onClick: sendChat,
  },
  {
    title: t('main-page.quick-links.embed_document.title'),
    description: t('main-page.quick-links.embed_document.description'),
    icon: FileArrowUp,
    onClick: embedDocument,
  },
  {
    title: t('main-page.quick-links.create_workspace.title'),
    description: t('main-page.quick-links.create_workspace.description'),
    icon: Plus,
    onClick: createWorkspace,
  },
]
</script>

<template>
  <div class="flex flex-col gap-y-4">
    <h2 class="text-lg font-semibold text-theme-text-primary">
      Quick Actions
    </h2>
    <div class="grid grid-cols-1 gap-3">
      <button
        v-for="link in quickLinks"
        :key="link.title"
        @click="link.onClick"
        class="group flex items-start gap-x-3 p-3 rounded-lg border border-theme-modal-border hover:border-theme-action-primary/50 hover:bg-theme-bg-secondary/50 transition-all text-left"
      >
        <div class="flex-shrink-0 mt-0.5">
          <component
            :is="link.icon"
            class="w-5 h-5 text-theme-text-primary group-hover:text-theme-action-primary transition-colors"
            weight="duotone"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-theme-text-primary group-hover:text-theme-action-primary transition-colors">
            {{ link.title }}
          </h3>
          <p class="text-xs text-theme-text-secondary mt-0.5">
            {{ link.description }}
          </p>
        </div>
      </button>
    </div>
  </div>
</template>

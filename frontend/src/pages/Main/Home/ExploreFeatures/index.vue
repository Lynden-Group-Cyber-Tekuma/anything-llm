<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Robot, Command, ChatCircleText } from '@phosphor-icons/vue'
import Workspace from '@/models/workspace'
import paths from '@/utils/paths'
import showToast from '@/utils/toast'
import { TOGGLE_LLM_SELECTOR_EVENT } from '@/components/WorkspaceChat/ChatContainer/PromptInput/LLMSelector/action.vue'

const router = useRouter()
const workspaces = ref([])

onMounted(async () => {
  workspaces.value = await Workspace.all()
})

const chatWithAgent = async () => {
  if (workspaces.value.length === 0) {
    showToast('Please create a workspace first', 'info', { clear: true })
    return
  }

  const firstWorkspace = workspaces.value[0]
  router.push({
    path: paths.workspace.chat(firstWorkspace.slug),
    query: { action: 'set-agent-chat' }
  })
}

const learnAboutAgents = () => {
  window.open('https://docs.anythingllm.com/agent/custom-agents', '_blank')
}

const useSlashCommand = async () => {
  if (workspaces.value.length === 0) {
    showToast('Please create a workspace first', 'info', { clear: true })
    return
  }

  const firstWorkspace = workspaces.value[0]
  router.push(paths.workspace.chat(firstWorkspace.slug))
}

const learnAboutSlashCommands = () => {
  window.open('https://docs.anythingllm.com/features/slash-commands', '_blank')
}

const changeSystemPrompt = async () => {
  if (workspaces.value.length === 0) {
    showToast('Please create a workspace first', 'info', { clear: true })
    return
  }

  const firstWorkspace = workspaces.value[0]
  router.push({
    path: paths.workspace.chat(firstWorkspace.slug),
    query: { action: 'open-llm-selector' }
  })

  // Trigger the LLM selector modal after navigation
  setTimeout(() => {
    window.dispatchEvent(new Event(TOGGLE_LLM_SELECTOR_EVENT))
  }, 500)
}

const learnAboutSystemPrompts = () => {
  window.open('https://docs.anythingllm.com/features/custom-prompts', '_blank')
}

const features = [
  {
    title: 'Custom Agents',
    description: 'Create specialized AI agents for specific tasks',
    icon: Robot,
    primaryAction: {
      label: 'Chat with Agent',
      onClick: chatWithAgent,
    },
    secondaryAction: {
      label: 'Learn More',
      onClick: learnAboutAgents,
    },
    isNew: true,
  },
  {
    title: 'Slash Commands',
    description: 'Use shortcuts to quickly perform common actions',
    icon: Command,
    primaryAction: {
      label: 'Try It Out',
      onClick: useSlashCommand,
    },
    secondaryAction: {
      label: 'Learn More',
      onClick: learnAboutSlashCommands,
    },
    isNew: false,
  },
  {
    title: 'System Prompts',
    description: 'Customize how the AI responds to your queries',
    icon: ChatCircleText,
    primaryAction: {
      label: 'Change Prompt',
      onClick: changeSystemPrompt,
    },
    secondaryAction: {
      label: 'Learn More',
      onClick: learnAboutSystemPrompts,
    },
    isNew: false,
  },
]
</script>

<template>
  <div class="flex flex-col gap-y-4">
    <h2 class="text-lg font-semibold text-theme-text-primary">
      Explore Features
    </h2>
    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="group flex flex-col gap-y-3 p-4 rounded-lg border border-theme-modal-border hover:border-theme-action-primary/50 hover:bg-theme-bg-secondary/50 transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-x-3 flex-1">
            <div class="flex-shrink-0 mt-0.5">
              <component
                :is="feature.icon"
                class="w-6 h-6 text-theme-text-primary group-hover:text-theme-action-primary transition-colors"
                weight="duotone"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium text-theme-text-primary">
                {{ feature.title }}
              </h3>
              <p class="text-xs text-theme-text-secondary mt-1">
                {{ feature.description }}
              </p>
            </div>
          </div>
          <span
            v-if="feature.isNew"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500"
          >
            New
          </span>
        </div>
        <div class="flex items-center gap-x-2">
          <button
            @click="feature.primaryAction.onClick"
            class="px-3 py-1.5 text-xs font-medium rounded-md bg-theme-action-primary hover:bg-theme-action-primary-hover text-white transition-colors"
          >
            {{ feature.primaryAction.label }}
          </button>
          <button
            @click="feature.secondaryAction.onClick"
            class="px-3 py-1.5 text-xs font-medium rounded-md border border-theme-modal-border hover:bg-theme-bg-secondary text-theme-text-primary transition-colors"
          >
            {{ feature.secondaryAction.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

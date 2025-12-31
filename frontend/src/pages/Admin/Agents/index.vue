<template>
  <SkillLayout
    :has-changes="hasChanges"
    :handle-cancel="() => hasChanges = false"
    :handle-submit="handleSubmit"
  >
    <FullScreenLoader v-if="loading" />

    <form
      v-else
      ref="formEl"
      @submit.prevent="handleSubmit"
      @change="() => !selectedFlow && (hasChanges = true)"
      :class="isMobile ? 'flex flex-col w-full p-4 mt-10' : 'flex-1 flex gap-x-6 p-4 mt-10'"
    >
      <input
        name="system::default_agent_skills"
        type="hidden"
        :value="agentSkills.join(',')"
      />
      <input
        name="system::disabled_agent_skills"
        type="hidden"
        :value="disabledAgentSkills.join(',')"
      />
      <input
        type="hidden"
        name="system::active_agent_flows"
        id="active_agent_flows"
        :value="activeFlowIds.join(',')"
      />

      <!-- Mobile view -->
      <template v-if="isMobile">
        <!-- Skill settings nav -->
        <div
          v-show="!showSkillModal"
          class="flex flex-col gap-y-[18px] overflow-y-scroll no-scroll"
        >
          <div class="text-theme-text-primary flex items-center gap-x-2">
            <Robot :size="24" />
            <p class="text-lg font-medium">Agent Skills</p>
          </div>
          <!-- Default skills -->
          <SkillList
            :skills="defaultSkills"
            :selected-skill="selectedSkill"
            :handle-click="handleDefaultSkillClick"
            :active-skills="Object.keys(defaultSkills).filter(
              (skill) => !disabledAgentSkills.includes(skill)
            )"
          />
          <!-- Configurable skills -->
          <SkillList
            :skills="configurableSkills"
            :selected-skill="selectedSkill"
            :handle-click="handleDefaultSkillClick"
            :active-skills="agentSkills"
          />

          <div class="text-theme-text-primary flex items-center gap-x-2">
            <Plug :size="24" />
            <p class="text-lg font-medium">Custom Skills</p>
          </div>
          <ImportedSkillList
            :skills="importedSkills"
            :selected-skill="selectedSkill"
            :handle-click="handleSkillClick"
          />

          <div class="text-theme-text-primary flex items-center gap-x-2 mt-6">
            <FlowArrow :size="24" />
            <p class="text-lg font-medium">Agent Flows</p>
          </div>
          <AgentFlowsList
            :flows="agentFlows"
            :selected-flow="selectedFlow"
            :handle-click="handleFlowClick"
          />

          <MCPServerHeader
            :set-mcp-servers="setMcpServers"
            :set-selected-mcp-server="setSelectedMcpServer"
          >
            <template #default="{ loadingMcpServers }">
              <MCPServersList
                :is-loading="loadingMcpServers"
                :servers="mcpServers"
                :selected-server="selectedMcpServer"
                :handle-click="handleMCPClick"
              />
            </template>
          </MCPServerHeader>
        </div>

        <!-- Selected agent skill modal -->
        <div v-if="showSkillModal" class="fixed top-0 left-0 w-full h-full bg-sidebar z-30">
          <div class="flex flex-col h-full">
            <div class="flex items-center p-4">
              <button
                type="button"
                @click="() => {
                  showSkillModal = false
                  selectedSkill = ''
                }"
                class="text-white/60 hover:text-white transition-colors duration-200"
              >
                <div class="flex items-center text-sky-400">
                  <CaretLeft :size="24" />
                  <div>Back</div>
                </div>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
              <div class="bg-theme-bg-secondary text-white rounded-xl p-4 overflow-y-scroll no-scroll">
                <SelectedSkillRenderer
                  v-if="hasSelectedComponent"
                  :selected-mcp-server="selectedMcpServer"
                  :selected-flow="selectedFlow"
                  :selected-skill="selectedSkill"
                  :toggle-mcp="toggleMCP"
                  :on-mcp-delete="handleMCPServerDelete"
                  :toggle-flow="toggleFlow"
                  :active-flow-ids="activeFlowIds"
                  :on-flow-delete="handleFlowDelete"
                  :set-imported-skills="setImportedSkills"
                  :default-skills="defaultSkills"
                  :configurable-skills="configurableSkills"
                  :settings="settings"
                  :toggle-default-skill="toggleDefaultSkill"
                  :toggle-agent-skill="toggleAgentSkill"
                  :disabled-agent-skills="disabledAgentSkills"
                  :agent-skills="agentSkills"
                  :set-has-changes="setHasChanges"
                />
                <div
                  v-else
                  class="flex flex-col items-center justify-center h-full text-theme-text-secondary"
                >
                  <Robot :size="40" />
                  <p class="font-medium">
                    Select an Agent Skill, Agent Flow, or MCP Server
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Desktop view -->
      <template v-else>
        <!-- Skill settings nav - Make this section scrollable -->
        <div class="flex flex-col min-w-[360px] h-[calc(100vh-90px)]">
          <div class="flex-none mb-4">
            <div class="text-theme-text-primary flex items-center gap-x-2">
              <Robot :size="24" />
              <p class="text-lg font-medium">Agent Skills</p>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto pr-2 pb-4">
            <div class="space-y-4">
              <!-- Default skills list -->
              <SkillList
                :skills="defaultSkills"
                :selected-skill="selectedSkill"
                :handle-click="handleSkillClick"
                :active-skills="Object.keys(defaultSkills).filter(
                  (skill) => !disabledAgentSkills.includes(skill)
                )"
              />
              <!-- Configurable skills -->
              <SkillList
                :skills="configurableSkills"
                :selected-skill="selectedSkill"
                :handle-click="handleSkillClick"
                :active-skills="agentSkills"
              />

              <div class="text-theme-text-primary flex items-center gap-x-2 mt-4">
                <Plug :size="24" />
                <p class="text-lg font-medium">Custom Skills</p>
              </div>
              <ImportedSkillList
                :skills="importedSkills"
                :selected-skill="selectedSkill"
                :handle-click="handleSkillClick"
              />

              <div class="text-theme-text-primary flex items-center justify-between gap-x-2 mt-4">
                <div class="flex items-center gap-x-2">
                  <FlowArrow :size="24" />
                  <p class="text-lg font-medium">Agent Flows</p>
                </div>
                <RouterLink
                  v-if="agentFlows.length === 0"
                  :to="paths.agents.builder()"
                  class="text-cta-button flex items-center gap-x-1 hover:underline"
                >
                  <Hammer :size="16" />
                  <p class="text-sm">Create Flow</p>
                </RouterLink>
                <RouterLink
                  v-else
                  :to="paths.agents.builder()"
                  class="text-theme-text-secondary hover:text-cta-button flex items-center gap-x-1"
                >
                  <Hammer :size="16" />
                  <p class="text-sm">Open Builder</p>
                </RouterLink>
              </div>
              <AgentFlowsList
                :flows="agentFlows"
                :selected-flow="selectedFlow"
                :handle-click="handleFlowClick"
              />

              <MCPServerHeader
                :set-mcp-servers="setMcpServers"
                :set-selected-mcp-server="setSelectedMcpServer"
              >
                <template #default="{ loadingMcpServers }">
                  <MCPServersList
                    :is-loading="loadingMcpServers"
                    :servers="mcpServers"
                    :selected-server="selectedMcpServer"
                    :handle-click="handleMCPClick"
                  />
                </template>
              </MCPServerHeader>
            </div>
          </div>
        </div>

        <!-- Selected agent skill setting panel -->
        <div class="flex-[2] flex flex-col gap-y-[18px] mt-10">
          <div class="bg-theme-bg-secondary text-white rounded-xl flex-1 p-4 overflow-y-scroll no-scroll">
            <SelectedSkillRenderer
              v-if="hasSelectedComponent"
              :selected-mcp-server="selectedMcpServer"
              :selected-flow="selectedFlow"
              :selected-skill="selectedSkill"
              :toggle-mcp="toggleMCP"
              :on-mcp-delete="handleMCPServerDelete"
              :toggle-flow="toggleFlow"
              :active-flow-ids="activeFlowIds"
              :on-flow-delete="handleFlowDelete"
              :set-imported-skills="setImportedSkills"
              :default-skills="defaultSkills"
              :configurable-skills="configurableSkills"
              :settings="settings"
              :toggle-default-skill="toggleDefaultSkill"
              :toggle-agent-skill="toggleAgentSkill"
              :disabled-agent-skills="disabledAgentSkills"
              :agent-skills="agentSkills"
              :set-has-changes="setHasChanges"
            />
            <div
              v-else
              class="flex flex-col items-center justify-center h-full text-theme-text-secondary"
            >
              <Robot :size="40" />
              <p class="font-medium">
                Select an Agent Skill, Agent Flow, or MCP Server
              </p>
            </div>
          </div>
        </div>
      </template>
    </form>
  </SkillLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { isMobile } from 'react-device-detect'
import { RouterLink } from 'vue-router'
import Admin from '@/models/admin'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { PhCaretLeft, PhPlug, PhRobot, PhHammer, PhFlowArrow } from '@phosphor-icons/vue'
import { castToType } from '@/utils/types'
import FullScreenLoader from '@/components/Preloader/index.vue'
import { defaultSkills, configurableSkills } from './skills.js'
import ImportedSkillList from './Imported/SkillList/index.vue'
import AgentFlowsList from './AgentFlows/index.vue'
import MCPServerHeader from './MCPServers/MCPServerHeader.vue'
import MCPServersList from './MCPServers/MCPServersList.vue'
import paths from '@/utils/paths'
import AgentFlows from '@/models/agentFlows'
import SkillLayout from './components/SkillLayout.vue'
import SkillList from './components/SkillList.vue'
import SelectedSkillRenderer from './components/SelectedSkillRenderer.vue'

const formEl = ref(null)
const hasChanges = ref(false)
const settings = ref({})
const selectedSkill = ref('')
const loading = ref(true)
const showSkillModal = ref(false)

const agentSkills = ref([])
const importedSkills = ref([])
const disabledAgentSkills = ref([])

const agentFlows = ref([])
const selectedFlow = ref(null)
const activeFlowIds = ref([])

// MCP Servers are lazy loaded to not block the UI thread
const mcpServers = ref([])
const selectedMcpServer = ref(null)

const setMcpServers = (updater) => {
  mcpServers.value = typeof updater === 'function' ? updater(mcpServers.value) : updater
}

const setSelectedMcpServer = (value) => {
  selectedMcpServer.value = value
}

const setImportedSkills = (updater) => {
  importedSkills.value = typeof updater === 'function' ? updater(importedSkills.value) : updater
}

const setHasChanges = (value) => {
  hasChanges.value = value
}

const hasSelectedComponent = computed(() => {
  return selectedFlow.value || selectedMcpServer.value || selectedSkill.value
})

// Alert user if they try to leave the page with unsaved changes
const handleBeforeUnload = (event) => {
  if (hasChanges.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)

  const _settings = await System.keys()
  const _preferences = await Admin.systemPreferencesByFields([
    'disabled_agent_skills',
    'default_agent_skills',
    'imported_agent_skills',
    'active_agent_flows'
  ])
  const { flows = [] } = await AgentFlows.listFlows()

  settings.value = { ..._settings, preferences: _preferences.settings } ?? {}
  agentSkills.value = _preferences.settings?.default_agent_skills ?? []
  disabledAgentSkills.value = _preferences.settings?.disabled_agent_skills ?? []
  importedSkills.value = _preferences.settings?.imported_agent_skills ?? []
  activeFlowIds.value = _preferences.settings?.active_agent_flows ?? []
  agentFlows.value = flows
  loading.value = false
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const toggleDefaultSkill = (skillName) => {
  disabledAgentSkills.value = disabledAgentSkills.value.includes(skillName)
    ? disabledAgentSkills.value.filter((name) => name !== skillName)
    : [...disabledAgentSkills.value, skillName]
  hasChanges.value = true
}

const toggleAgentSkill = (skillName) => {
  agentSkills.value = agentSkills.value.includes(skillName)
    ? agentSkills.value.filter((name) => name !== skillName)
    : [...agentSkills.value, skillName]
  hasChanges.value = true
}

const toggleFlow = (flowId) => {
  activeFlowIds.value = activeFlowIds.value.includes(flowId)
    ? activeFlowIds.value.filter((id) => id !== flowId)
    : [...activeFlowIds.value, flowId]
}

const toggleMCP = (serverName) => {
  mcpServers.value = mcpServers.value.map((server) => {
    if (server.name !== serverName) return server
    return { ...server, running: !server.running }
  })
}

const handleSubmit = async (e) => {
  e.preventDefault()
  const data = {
    workspace: {},
    system: {},
    env: {}
  }

  const form = new FormData(formEl.value)
  for (const [key, value] of form.entries()) {
    if (key.startsWith('system::')) {
      const [_, label] = key.split('system::')
      data.system[label] = String(value)
      continue
    }

    if (key.startsWith('env::')) {
      const [_, label] = key.split('env::')
      data.env[label] = String(value)
      continue
    }
    data.workspace[key] = castToType(key, value)
  }

  const { success } = await Admin.updateSystemPreferences(data.system)
  await System.updateSystem(data.env)

  if (success) {
    const _settings = await System.keys()
    const _preferences = await Admin.systemPreferencesByFields([
      'disabled_agent_skills',
      'default_agent_skills',
      'imported_agent_skills'
    ])
    settings.value = { ..._settings, preferences: _preferences.settings } ?? {}
    agentSkills.value = _preferences.settings?.default_agent_skills ?? []
    disabledAgentSkills.value = _preferences.settings?.disabled_agent_skills ?? []
    importedSkills.value = _preferences.settings?.imported_agent_skills ?? []
    showToast('Agent preferences saved successfully.', 'success', {
      clear: true
    })
  } else {
    showToast('Agent preferences failed to save.', 'error', { clear: true })
  }

  hasChanges.value = false
}

// Update the click handlers to clear the other selection
const handleDefaultSkillClick = (skill) => {
  selectedFlow.value = null
  selectedMcpServer.value = null
  selectedSkill.value = skill
  if (isMobile) showSkillModal.value = true
}

const handleSkillClick = (skill) => {
  selectedFlow.value = null
  selectedMcpServer.value = null
  selectedSkill.value = skill
  if (isMobile) showSkillModal.value = true
}

const handleFlowClick = (flow) => {
  selectedSkill.value = null
  selectedMcpServer.value = null
  selectedFlow.value = flow
  if (isMobile) showSkillModal.value = true
}

const handleMCPClick = (server) => {
  selectedSkill.value = null
  selectedFlow.value = null
  selectedMcpServer.value = server
  if (isMobile) showSkillModal.value = true
}

const handleFlowDelete = (flowId) => {
  selectedFlow.value = null
  activeFlowIds.value = activeFlowIds.value.filter((id) => id !== flowId)
  agentFlows.value = agentFlows.value.filter((flow) => flow.uuid !== flowId)
}

const handleMCPServerDelete = (serverName) => {
  selectedMcpServer.value = null
  mcpServers.value = mcpServers.value.filter((server) => server.name !== serverName)
}
</script>

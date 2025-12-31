<template>
  <ServerPanel
    v-if="selectedMcpServer"
    :server="selectedMcpServer"
    :toggle-server="toggleMcp"
    :on-delete="onMcpDelete"
  />
  <FlowPanel
    v-else-if="selectedFlow"
    :flow="selectedFlow"
    :toggle-flow="toggleFlow"
    :enabled="activeFlowIds.includes(selectedFlow.uuid)"
    :on-delete="onFlowDelete"
  />
  <ImportedSkillConfig
    v-else-if="selectedSkill?.imported"
    :key="selectedSkill.hubId"
    :selected-skill="selectedSkill"
    :set-imported-skills="setImportedSkills"
  />
  <component
    v-else-if="defaultSkills?.[selectedSkill]"
    :is="defaultSkills[selectedSkill]?.component"
    :skill="defaultSkills[selectedSkill]?.skill"
    :settings="settings"
    :toggle-skill="toggleDefaultSkill"
    :enabled="!disabledAgentSkills.includes(defaultSkills[selectedSkill]?.skill)"
    :set-has-changes="setHasChanges"
    v-bind="defaultSkills[selectedSkill]"
  />
  <component
    v-else-if="configurableSkills?.[selectedSkill]"
    :is="configurableSkills[selectedSkill]?.component"
    :skill="configurableSkills[selectedSkill]?.skill"
    :settings="settings"
    :toggle-skill="toggleAgentSkill"
    :enabled="agentSkills.includes(configurableSkills[selectedSkill]?.skill)"
    :set-has-changes="setHasChanges"
    v-bind="configurableSkills[selectedSkill]"
  />
</template>

<script setup>
import ServerPanel from '../MCPServers/ServerPanel.vue'
import FlowPanel from '../AgentFlows/FlowPanel.vue'
import ImportedSkillConfig from '../Imported/ImportedSkillConfig/index.vue'

defineProps({
  selectedMcpServer: {
    type: Object,
    default: null
  },
  selectedFlow: {
    type: Object,
    default: null
  },
  selectedSkill: {
    type: [String, Object],
    default: null
  },
  toggleMcp: {
    type: Function,
    required: true
  },
  onMcpDelete: {
    type: Function,
    required: true
  },
  toggleFlow: {
    type: Function,
    required: true
  },
  activeFlowIds: {
    type: Array,
    required: true
  },
  onFlowDelete: {
    type: Function,
    required: true
  },
  setImportedSkills: {
    type: Function,
    required: true
  },
  defaultSkills: {
    type: Object,
    required: true
  },
  configurableSkills: {
    type: Object,
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  toggleDefaultSkill: {
    type: Function,
    required: true
  },
  toggleAgentSkill: {
    type: Function,
    required: true
  },
  disabledAgentSkills: {
    type: Array,
    required: true
  },
  agentSkills: {
    type: Array,
    required: true
  },
  setHasChanges: {
    type: Function,
    required: true
  }
})
</script>

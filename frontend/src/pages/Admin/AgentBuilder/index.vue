<template>
  <div
    :style="{
      backgroundImage:
        theme === 'light'
          ? 'radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 0)'
          : 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 0)',
      backgroundSize: '15px 15px',
      backgroundPosition: '-7.5px -7.5px',
    }"
    class="w-full h-screen flex bg-theme-bg-primary"
  >
    <PublishEntityModal
      :show="showPublishModal"
      :on-close="() => showPublishModal = false"
      entity-type="agent-flow"
      :entity="flowEntity"
    />
    <div class="w-full flex flex-col">
      <HeaderMenu
        :agent-name="agentName"
        :available-flows="availableFlows"
        :on-new-flow="clearFlow"
        :on-save-flow="saveFlow"
        :on-publish-flow="handlePublishFlow"
      />
      <div class="flex-1 p-6 overflow-y-auto">
        <div class="max-w-xl mx-auto mt-14">
          <BlockList
            ref="blockListRef"
            :blocks="blocks"
            :update-block-config="updateBlockConfig"
            :remove-block="removeBlock"
            :toggle-block-expansion="toggleBlockExpansion"
            :render-variable-select="renderVariableSelect"
            :on-delete-variable="deleteVariable"
            :move-block="moveBlock"
            :refs="{ nameRef, descriptionRef }"
          />

          <AddBlockMenu
            :blocks="blocks"
            :show-block-menu="showBlockMenu"
            :set-show-block-menu="(val) => showBlockMenu = val"
            :add-block="addBlock"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BlockList from './BlockList/index.vue'
import { BLOCK_TYPES, BLOCK_INFO } from './BlockList/blockTypes'
import AddBlockMenu from './AddBlockMenu/index.vue'
import showToast from '@/utils/toast'
import AgentFlows from '@/models/agentFlows'
import { useTheme } from '@/hooks/useTheme'
import HeaderMenu from './HeaderMenu/index.vue'
import paths from '@/utils/paths'
import PublishEntityModal from '@/components/CommunityHub/PublishEntityModal/index.vue'

const DEFAULT_BLOCKS = [
  {
    id: 'flow_info',
    type: BLOCK_TYPES.FLOW_INFO,
    config: {
      name: '',
      description: '',
    },
    isExpanded: true,
  },
  {
    id: 'start',
    type: BLOCK_TYPES.START,
    config: {
      variables: [{ name: '', value: '' }],
    },
    isExpanded: true,
  },
  {
    id: 'finish',
    type: BLOCK_TYPES.FINISH,
    config: {},
    isExpanded: false,
  },
]

const route = useRoute()
const router = useRouter()
const { theme } = useTheme()

const flowId = computed(() => route.params.flowId)
const agentName = ref('')
const agentDescription = ref('')
const currentFlowUuid = ref(null)
const active = ref(true)
const blocks = ref([...DEFAULT_BLOCKS])
const selectedBlock = ref('start')
const showBlockMenu = ref(false)
const showLoadMenu = ref(false)
const availableFlows = ref([])
const selectedFlowForDetails = ref(null)
const nameRef = ref(null)
const descriptionRef = ref(null)
const showPublishModal = ref(false)
const blockListRef = ref(null)

const loadAvailableFlows = async () => {
  try {
    const { success, error, flows } = await AgentFlows.listFlows()
    if (!success) throw new Error(error)
    availableFlows.value = flows
  } catch (error) {
    console.error(error)
    showToast('Failed to load available flows', 'error', { clear: true })
  }
}

const loadFlow = async (uuid) => {
  try {
    const { success, error, flow } = await AgentFlows.getFlow(uuid)
    if (!success) throw new Error(error)

    // Convert steps to blocks with IDs, ensuring finish block is at the end
    const flowBlocks = [
      {
        id: 'flow_info',
        type: BLOCK_TYPES.FLOW_INFO,
        config: {
          name: flow.config.name,
          description: flow.config.description,
        },
        isExpanded: true,
      },
      ...flow.config.steps.map((step, index) => ({
        id: index === 0 ? 'start' : `block_${index}`,
        type: step.type,
        config: step.config,
        isExpanded: true,
      })),
    ]

    // Add finish block if not present
    if (flowBlocks[flowBlocks.length - 1]?.type !== BLOCK_TYPES.FINISH) {
      flowBlocks.push({
        id: 'finish',
        type: BLOCK_TYPES.FINISH,
        config: {},
        isExpanded: false,
      })
    }

    agentName.value = flow.config.name
    agentDescription.value = flow.config.description
    active.value = flow.config.active ?? true
    currentFlowUuid.value = flow.uuid
    blocks.value = flowBlocks
    showLoadMenu.value = false
  } catch (error) {
    console.error(error)
    showToast('Failed to load flow', 'error', { clear: true })
  }
}

const addBlock = (type) => {
  const newBlock = {
    id: `block_${blocks.value.length}`,
    type,
    config: { ...BLOCK_INFO[type].defaultConfig },
    isExpanded: true,
  }
  // Insert the new block before the finish block
  const newBlocks = [...blocks.value]
  newBlocks.splice(newBlocks.length - 1, 0, newBlock)
  blocks.value = newBlocks
  showBlockMenu.value = false
}

const updateBlockConfig = (blockId, config) => {
  blocks.value = blocks.value.map((block) =>
    block.id === blockId
      ? { ...block, config: { ...block.config, ...config } }
      : block
  )
}

const removeBlock = (blockId) => {
  if (blockId === 'start') return
  blocks.value = blocks.value.filter((block) => block.id !== blockId)
  if (selectedBlock.value === blockId) {
    selectedBlock.value = 'start'
  }
}

const saveFlow = async () => {
  const flowInfoBlock = blocks.value.find(
    (block) => block.type === BLOCK_TYPES.FLOW_INFO
  )
  const name = flowInfoBlock?.config?.name
  const description = flowInfoBlock?.config?.description

  if (!name?.trim() || !description?.trim()) {
    // Make sure the flow info block is expanded first
    if (!flowInfoBlock.isExpanded) {
      blocks.value = blocks.value.map((block) =>
        block.type === BLOCK_TYPES.FLOW_INFO
          ? { ...block, isExpanded: true }
          : block
      )
      // Small delay to allow expansion animation to complete
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    if (!name?.trim()) {
      // Access the flow info node ref through the block list ref
      if (blockListRef.value?.flowInfoNodeRef?.nameRef) {
        blockListRef.value.flowInfoNodeRef.nameRef.focus()
      }
    } else if (!description?.trim()) {
      if (blockListRef.value?.flowInfoNodeRef?.descriptionRef) {
        blockListRef.value.flowInfoNodeRef.descriptionRef.focus()
      }
    }
    showToast(
      'Please provide both a name and description for your flow',
      'error',
      {
        clear: true,
      }
    )
    return
  }

  const flowConfig = {
    name,
    description,
    active: active.value,
    steps: blocks.value
      .filter(
        (block) =>
          block.type !== BLOCK_TYPES.FINISH &&
          block.type !== BLOCK_TYPES.FLOW_INFO
      )
      .map((block) => ({
        type: block.type,
        config: block.config,
      })),
  }

  try {
    const { success, error, flow } = await AgentFlows.saveFlow(
      name,
      flowConfig,
      currentFlowUuid.value
    )
    if (!success) throw new Error(error)

    currentFlowUuid.value = flow.uuid
    showToast('Agent flow saved successfully!', 'success', { clear: true })
    await loadAvailableFlows()
  } catch (error) {
    console.error('Save error details:', error)
    showToast(`Failed to save agent flow. ${error.message}`, 'error', {
      clear: true,
    })
  }
}

const toggleBlockExpansion = (blockId) => {
  blocks.value = blocks.value.map((block) =>
    block.id === blockId
      ? { ...block, isExpanded: !block.isExpanded }
      : block
  )
}

// Get all available variables from the start block
const getAvailableVariables = () => {
  const startBlock = blocks.value.find((b) => b.type === BLOCK_TYPES.START)
  return startBlock?.config?.variables?.filter((v) => v.name) || []
}

// Provide getAvailableVariables to child components
provide('getAvailableVariables', getAvailableVariables)

const renderVariableSelect = (
  value,
  onChange,
  placeholder = 'Select variable'
) => {
  // This function is used by legacy block components
  // New Vue components should use the injected getAvailableVariables instead
  return {
    value,
    onChange,
    placeholder,
    availableVariables: getAvailableVariables()
  }
}

const deleteVariable = (variableName) => {
  // Clean up references in other blocks
  blocks.value.forEach((block) => {
    if (block.type === BLOCK_TYPES.START) return

    let configUpdated = false
    const newConfig = { ...block.config }

    // Check and clean responseVariable/resultVariable
    if (newConfig.responseVariable === variableName) {
      newConfig.responseVariable = ''
      configUpdated = true
    }
    if (newConfig.resultVariable === variableName) {
      newConfig.resultVariable = ''
      configUpdated = true
    }

    if (configUpdated) {
      updateBlockConfig(block.id, newConfig)
    }
  })
}

const clearFlow = () => {
  if (flowId.value) router.push(paths.agents.builder())
  agentName.value = ''
  agentDescription.value = ''
  currentFlowUuid.value = null
  active.value = true
  blocks.value = [...DEFAULT_BLOCKS]
}

const moveBlock = (fromIndex, toIndex) => {
  const newBlocks = [...blocks.value]
  const [movedBlock] = newBlocks.splice(fromIndex, 1)
  newBlocks.splice(toIndex, 0, movedBlock)
  blocks.value = newBlocks
}

const handlePublishFlow = () => {
  showPublishModal.value = true
}

const flowEntity = computed(() => {
  const flowInfoBlock = blocks.value.find(
    (block) => block.type === BLOCK_TYPES.FLOW_INFO
  )
  return {
    name: flowInfoBlock?.config?.name || '',
    description: flowInfoBlock?.config?.description || '',
    steps: blocks.value
      .filter(
        (block) =>
          block.type !== BLOCK_TYPES.FINISH &&
          block.type !== BLOCK_TYPES.FLOW_INFO
      )
      .map((block) => ({ type: block.type, config: block.config })),
  }
})

onMounted(() => {
  loadAvailableFlows()
})

watch(
  () => flowId.value,
  (newFlowId) => {
    if (newFlowId) {
      loadFlow(newFlowId)
    }
  },
  { immediate: true }
)

watch(
  blocks,
  (newBlocks) => {
    const flowInfoBlock = newBlocks.find(
      (block) => block.type === BLOCK_TYPES.FLOW_INFO
    )
    agentName.value = flowInfoBlock?.config?.name || ''
  },
  { deep: true }
)
</script>

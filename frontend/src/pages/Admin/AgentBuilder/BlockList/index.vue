<template>
  <div class="space-y-1">
    <div
      v-for="(block, index) in blocks"
      :key="block.id"
      class="flex flex-col"
    >
      <div
        :class="[
          'bg-theme-action-menu-bg border border-white/10 rounded-lg overflow-hidden transition-all duration-300',
          block.isExpanded ? 'w-full' : 'w-[280px] mx-auto'
        ]"
      >
        <div
          @click="toggleBlockExpansion(block.id)"
          class="w-full p-4 flex items-center justify-between hover:bg-theme-action-menu-item-hover transition-colors duration-300 group cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-white/10 light:bg-white flex items-center justify-center">
              <component
                :is="BLOCK_INFO[block.type].icon"
                class="w-4 h-4 text-white"
              />
            </div>
            <div class="flex-1 text-left min-w-0 max-w-[115px]">
              <span class="text-sm font-medium text-white block">
                {{ BLOCK_INFO[block.type].label }}
              </span>
              <p v-if="!block.isExpanded" class="text-xs text-white/60 truncate">
                {{ BLOCK_INFO[block.type].getSummary(block.config) }}
              </p>
            </div>
          </div>
          <div class="flex items-center">
            <div
              v-if="
                block.id !== 'start' &&
                block.type !== BLOCK_TYPES.FINISH &&
                block.type !== BLOCK_TYPES.FLOW_INFO
              "
              class="flex items-center gap-1"
            >
              <button
                v-if="index > 2"
                @click.stop="moveBlock(index, index - 1)"
                class="w-7 h-7 flex items-center justify-center rounded-lg bg-theme-bg-primary border border-white/5 text-white hover:bg-theme-action-menu-item-hover transition-colors duration-300"
                data-tooltip-id="block-action"
                data-tooltip-content="Move block up"
                type="button"
              >
                <CaretUp class="w-3.5 h-3.5" />
              </button>
              <button
                v-if="index < blocks.length - 2"
                @click.stop="moveBlock(index, index + 1)"
                class="w-7 h-7 flex items-center justify-center rounded-lg bg-theme-bg-primary border border-white/5 text-white hover:bg-theme-action-menu-item-hover transition-colors duration-300"
                data-tooltip-id="block-action"
                data-tooltip-content="Move block down"
                type="button"
              >
                <CaretDown class="w-3.5 h-3.5" />
              </button>
              <button
                @click.stop="removeBlock(block.id)"
                class="w-7 h-7 flex items-center justify-center rounded-lg bg-theme-bg-primary border border-white/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors duration-300"
                data-tooltip-id="block-action"
                data-tooltip-content="Delete block"
                type="button"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        <div
          :class="[
            'overflow-hidden transition-all duration-300 ease-in-out',
            block.isExpanded
              ? 'max-h-[1000px] opacity-100'
              : 'max-h-0 opacity-0'
          ]"
        >
          <div class="border-t border-white/10 p-4 bg-theme-bg-secondary rounded-b-lg">
            <div
              v-if="shouldShowDirectOutput(block, index)"
              class="space-y-4"
            >
              <component
                :is="getBlockComponent(block.type)"
                v-bind="getBlockProps(block)"
                :ref="block.type === BLOCK_TYPES.FLOW_INFO ? 'flowInfoNodeRef' : undefined"
              />
              <div class="flex justify-between items-center pt-4 border-t border-white/10">
                <div>
                  <label class="block text-sm font-medium text-theme-text-primary">
                    Direct Output
                  </label>
                  <p class="text-xs text-theme-text-secondary">
                    The output of this block will be returned directly to the chat.
                    <br />
                    This will prevent any further tool calls from being executed.
                  </p>
                </div>
                <label class="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    :checked="block.config.directOutput || false"
                    @change="(e) =>
                      updateBlockConfig(block.id, {
                        ...block.config,
                        directOutput: e.target.checked,
                      })
                    "
                    class="peer sr-only"
                    aria-label="Toggle direct output"
                  />
                  <div class="pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
                </label>
              </div>
            </div>
            <component
              v-else
              :is="getBlockComponent(block.type)"
              v-bind="getBlockProps(block)"
              :ref="block.type === BLOCK_TYPES.FLOW_INFO ? 'flowInfoNodeRef' : undefined"
            />
          </div>
        </div>
      </div>
      <div v-if="index < blocks.length - 1" class="flex justify-center my-1">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="text-white/40 light:invert"
        >
          <path
            d="M12 4L12 20M12 20L6 14M12 20L18 14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import { X, CaretUp, CaretDown } from '@phosphor-icons/vue'
import { BLOCK_TYPES, BLOCK_INFO } from './blockTypes'
import StartNode from '../nodes/StartNode/index.vue'
import ApiCallNode from '../nodes/ApiCallNode/index.vue'
import WebsiteNode from '../nodes/WebsiteNode/index.vue'
import FileNode from '../nodes/FileNode/index.vue'
import CodeNode from '../nodes/CodeNode/index.vue'
import LLMInstructionNode from '../nodes/LLMInstructionNode/index.vue'
import FinishNode from '../nodes/FinishNode/index.vue'
import WebScrapingNode from '../nodes/WebScrapingNode/index.vue'
import FlowInfoNode from '../nodes/FlowInfoNode/index.vue'

const props = defineProps({
  blocks: {
    type: Array,
    required: true
  },
  updateBlockConfig: {
    type: Function,
    required: true
  },
  removeBlock: {
    type: Function,
    required: true
  },
  toggleBlockExpansion: {
    type: Function,
    required: true
  },
  renderVariableSelect: {
    type: Function,
    required: false
  },
  onDeleteVariable: {
    type: Function,
    required: true
  },
  moveBlock: {
    type: Function,
    required: true
  },
  refs: {
    type: Object,
    default: () => ({})
  }
})

const flowInfoNodeRef = ref(null)

// Get all available variables from the start block
const getAvailableVariables = () => {
  const startBlock = props.blocks.find((b) => b.type === BLOCK_TYPES.START)
  return startBlock?.config?.variables?.filter((v) => v.name) || []
}

// Provide getAvailableVariables to child components
provide('getAvailableVariables', getAvailableVariables)

const getBlockComponent = (type) => {
  switch (type) {
    case BLOCK_TYPES.FLOW_INFO:
      return FlowInfoNode
    case BLOCK_TYPES.START:
      return StartNode
    case BLOCK_TYPES.API_CALL:
      return ApiCallNode
    case BLOCK_TYPES.WEBSITE:
      return WebsiteNode
    case BLOCK_TYPES.FILE:
      return FileNode
    case BLOCK_TYPES.CODE:
      return CodeNode
    case BLOCK_TYPES.LLM_INSTRUCTION:
      return LLMInstructionNode
    case BLOCK_TYPES.WEB_SCRAPING:
      return WebScrapingNode
    case BLOCK_TYPES.FINISH:
      return FinishNode
    default:
      return null
  }
}

const shouldShowDirectOutput = (block, index) => {
  const isLastConfigurableBlock = props.blocks[props.blocks.length - 2]?.id === block.id
  return (
    isLastConfigurableBlock &&
    block.type !== BLOCK_TYPES.START &&
    block.type !== BLOCK_TYPES.FLOW_INFO
  )
}

const getBlockProps = (block) => {
  return {
    config: block.config,
    onConfigChange: (config) => props.updateBlockConfig(block.id, config),
    renderVariableSelect: props.renderVariableSelect,
    onDeleteVariable: props.onDeleteVariable
  }
}

// Expose refs to parent component
defineExpose({
  flowInfoNodeRef
})
</script>

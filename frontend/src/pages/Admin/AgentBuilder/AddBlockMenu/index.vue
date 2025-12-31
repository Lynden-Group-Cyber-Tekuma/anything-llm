<template>
  <div
    v-if="canAddBlock"
    ref="menuRef"
    class="relative mt-4 w-[280px] mx-auto pb-[50%]"
  >
    <button
      @click="setShowBlockMenu(!showBlockMenu)"
      class="transition-all duration-300 w-full p-2.5 bg-theme-action-menu-bg hover:bg-theme-action-menu-item-hover border border-white/10 rounded-lg text-white flex items-center justify-center gap-2 text-sm font-medium"
      type="button"
    >
      <Plus class="w-4 h-4" />
      Add Block
      <CaretDown
        :class="['w-3.5 h-3.5 transition-transform duration-300', showBlockMenu ? 'rotate-180' : '']"
      />
    </button>
    <div
      v-if="showBlockMenu"
      class="absolute left-0 right-0 mt-2 bg-theme-action-menu-bg border border-white/10 rounded-lg shadow-lg overflow-hidden z-10 animate-fadeUpIn"
    >
      <button
        v-for="[type, info] in Object.entries(BLOCK_INFO).filter(
          ([type]) =>
            type !== BLOCK_TYPES.START &&
            type !== BLOCK_TYPES.FINISH &&
            type !== BLOCK_TYPES.FLOW_INFO
        )"
        :key="type"
        @click="() => {
          addBlock(type)
          setShowBlockMenu(false)
        }"
        class="w-full p-2.5 flex items-center gap-3 hover:bg-theme-action-menu-item-hover text-white transition-colors duration-300 group"
        type="button"
      >
        <div class="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
          <component :is="info.icon" class="w-5 h-5 text-white" />
        </div>
        <div class="text-left flex-1">
          <div class="text-sm font-medium">{{ info.label }}</div>
          <div class="text-xs text-white/60">
            {{ info.description }}
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { PhPlus, PhCaretDown } from '@phosphor-icons/vue'
import { BLOCK_TYPES, BLOCK_INFO } from '../BlockList/blockTypes'

const props = defineProps({
  blocks: {
    type: Array,
    required: true
  },
  showBlockMenu: {
    type: Boolean,
    required: true
  },
  setShowBlockMenu: {
    type: Function,
    required: true
  },
  addBlock: {
    type: Function,
    required: true
  }
})

const menuRef = ref(null)

/**
 * Check if the last configurable block has direct output disabled or undefined
 * If this property is true then you cannot add a new block after it.
 */
const canAddBlock = computed(() => {
  const lastConfigurableBlock = props.blocks[props.blocks.length - 2]
  if (!lastConfigurableBlock) return true
  return (
    lastConfigurableBlock?.config?.directOutput === false ||
    lastConfigurableBlock?.config?.directOutput === undefined
  )
})

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    props.setShowBlockMenu(false)
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

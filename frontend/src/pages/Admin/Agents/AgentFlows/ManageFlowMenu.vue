<template>
  <div class="relative" ref="menuRef">
    <button
      type="button"
      @click="open = !open"
      class="p-1.5 rounded-lg text-white hover:bg-theme-action-menu-item-hover transition-colors duration-300"
    >
      <Gear class="h-5 w-5" weight="bold" />
    </button>
    <div
      v-if="open"
      class="absolute w-[100px] -top-1 left-7 mt-1 border-[1.5px] border-white/40 rounded-lg bg-theme-action-menu-bg flex flex-col shadow-[0_4px_14px_rgba(0,0,0,0.25)] text-white z-99 md:z-10"
    >
      <button
        type="button"
        @click="handleEdit"
        class="border-none flex items-center rounded-lg gap-x-2 hover:bg-theme-action-menu-item-hover py-1.5 px-2 transition-colors duration-200 w-full text-left"
      >
        <span class="text-sm">Edit Flow</span>
      </button>
      <button
        type="button"
        @click="deleteFlow"
        class="border-none flex items-center rounded-lg gap-x-2 hover:bg-theme-action-menu-item-hover py-1.5 px-2 transition-colors duration-200 w-full text-left"
      >
        <span class="text-sm">Delete Flow</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AgentFlows from '@/models/agentFlows'
import showToast from '@/utils/toast'
import { Gear } from '@phosphor-icons/vue'
import paths from '@/utils/paths'

const props = defineProps({
  flow: {
    type: Object,
    required: true
  },
  onDelete: {
    type: Function,
    required: true
  }
})

const router = useRouter()
const open = ref(false)
const menuRef = ref(null)

async function deleteFlow() {
  if (
    !window.confirm(
      'Are you sure you want to delete this flow? This action cannot be undone.'
    )
  )
    return
  const { success, error } = await AgentFlows.deleteFlow(props.flow.uuid)
  if (success) {
    showToast('Flow deleted successfully.', 'success')
    props.onDelete(props.flow.uuid)
  } else {
    showToast(error || 'Failed to delete flow.', 'error')
  }
}

function handleEdit() {
  router.push(paths.agents.editAgent(props.flow.uuid))
}

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

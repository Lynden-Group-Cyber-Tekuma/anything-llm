<template>
  <div class="p-2">
    <div class="flex flex-col gap-y-[18px] max-w-[500px]">
      <div class="flex items-center gap-x-2">
        <FlowArrow :size="24" weight="bold" class="text-white" />
        <label for="name" class="text-white text-md font-bold">
          {{ flow.name }}
        </label>
        <label class="border-none relative inline-flex items-center ml-auto cursor-pointer">
          <input
            type="checkbox"
            class="peer sr-only"
            :checked="isActive"
            @change="handleToggle"
          />
          <div class="peer-disabled:opacity-50 pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
          <span class="ml-3 text-sm font-medium"></span>
        </label>
        <ManageFlowMenu :flow="flow" :on-delete="onDelete" />
      </div>
      <p class="whitespace-pre-wrap text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ flow.description || 'No description provided' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AgentFlows from '@/models/agentFlows'
import showToast from '@/utils/toast'
import { FlowArrow } from '@phosphor-icons/vue'
import ManageFlowMenu from './ManageFlowMenu.vue'

const props = defineProps({
  flow: {
    type: Object,
    required: true
  },
  toggleFlow: {
    type: Function,
    required: true
  },
  onDelete: {
    type: Function,
    required: true
  }
})

const isActive = ref(props.flow.active)

watch(() => props.flow.uuid, () => {
  isActive.value = props.flow.active
})

watch(() => props.flow.active, () => {
  isActive.value = props.flow.active
})

const handleToggle = async () => {
  try {
    const { success, error } = await AgentFlows.toggleFlow(
      props.flow.uuid,
      !isActive.value
    )
    if (!success) throw new Error(error)
    isActive.value = !isActive.value
    props.toggleFlow(props.flow.uuid)
    showToast('Flow status updated successfully', 'success', { clear: true })
  } catch (error) {
    console.error('Failed to toggle flow:', error)
    showToast('Failed to toggle flow', 'error', { clear: true })
  }
}
</script>

<script setup>
import { ref, computed } from 'vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import EditVariableModal from './EditVariableModal/index.vue'
import { titleCase } from 'text-case'
import truncate from 'truncate'
import { Trash } from '@phosphor-icons/vue'

const props = defineProps({
  variable: {
    type: Object,
    required: true
  },
  onRefresh: {
    type: Function,
    required: true
  }
})

const rowRef = ref(null)
const isOpen = ref(false)

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const handleDelete = async () => {
  if (!props.variable.id) return
  if (
    !window.confirm(
      `Are you sure you want to delete the variable "${props.variable.key}"?\nThis action is irreversible.`
    )
  )
    return false

  try {
    await System.promptVariables.delete(props.variable.id)
    rowRef.value?.remove()
    showToast('Variable deleted successfully', 'success', { clear: true })
    if (props.onRefresh) props.onRefresh()
  } catch (error) {
    console.error('Error deleting variable:', error)
    showToast('Failed to delete variable', 'error', { clear: true })
  }
}

const colorTheme = computed(() => {
  const type = props.variable.type
  switch (type) {
    case 'system':
      return {
        bg: 'bg-blue-600/20',
        text: 'text-blue-400 light:text-blue-800'
      }
    case 'user':
      return {
        bg: 'bg-green-600/20',
        text: 'text-green-400 light:text-green-800'
      }
    case 'workspace':
      return {
        bg: 'bg-cyan-600/20',
        text: 'text-cyan-400 light:text-cyan-800'
      }
    default:
      return {
        bg: 'bg-yellow-600/20',
        text: 'text-yellow-400 light:text-yellow-800'
      }
  }
})
</script>

<template>
  <tr
    ref="rowRef"
    class="bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10"
  >
    <th scope="row" class="px-4 py-2 whitespace-nowrap">
      {{ variable.key }}
    </th>
    <td class="px-4 py-2">
      {{
        typeof variable.value === 'function'
          ? variable.value()
          : truncate(variable.value, 50)
      }}
    </td>
    <td class="px-4 py-2">
      {{ truncate(variable.description || '-', 50) }}
    </td>
    <td class="px-4 py-2">
      <span
        :class="[
          'rounded-full px-2 py-0.5 text-xs leading-5 font-semibold shadow-sm',
          colorTheme.bg,
          colorTheme.text
        ]"
      >
        {{ titleCase(variable?.type ?? 'static') }}
      </span>
    </td>
    <td class="px-4 py-2 flex items-center justify-end gap-x-4">
      <template v-if="variable.type === 'static'">
        <button
          @click="openModal"
          class="text-xs font-medium text-white/80 light:text-black/80 rounded-lg hover:text-white hover:light:text-gray-500 px-2 py-1 hover:bg-white hover:bg-opacity-10"
        >
          Edit
        </button>
        <button
          @click="handleDelete"
          class="text-xs font-medium text-white/80 light:text-black/80 hover:light:text-red-500 hover:text-red-300 rounded-lg px-2 py-1 hover:bg-white hover:light:bg-red-50 hover:bg-opacity-10"
        >
          <Trash class="h-4 w-4" />
        </button>
      </template>
    </td>
  </tr>
  <ModalWrapper :is-open="isOpen">
    <EditVariableModal
      :variable="variable"
      :close-modal="closeModal"
      :on-refresh="onRefresh"
    />
  </ModalWrapper>
</template>

<script setup>
import { ref, computed } from 'vue'
import { titleCase } from 'text-case'
import Admin from '@/models/admin'
import EditUserModal from './EditUserModal/index.vue'
import showToast from '@/utils/toast'
import ModalWrapper from '@/components/ModalWrapper/index.vue'

const props = defineProps({
  currUser: {
    type: Object,
    default: null
  },
  user: {
    type: Object,
    required: true
  }
})

const ModMap = {
  admin: ['admin', 'manager', 'default'],
  manager: ['manager', 'default'],
  default: []
}

const rowRef = ref(null)
const canModify = computed(() => ModMap[props.currUser?.role || 'default'].includes(props.user.role))
const suspended = ref(props.user.suspended === 1)
const isOpen = ref(false)

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const handleSuspend = async () => {
  if (
    !window.confirm(
      `Are you sure you want to suspend ${props.user.username}?\nAfter you do this they will be logged out and unable to log back into this instance of AnythingLLM until unsuspended by an admin.`
    )
  )
    return false

  const { success, error } = await Admin.updateUser(props.user.id, {
    suspended: suspended.value ? 0 : 1
  })
  if (!success) showToast(error, 'error', { clear: true })
  if (success) {
    showToast(
      `User ${!suspended.value ? 'has been suspended' : 'is no longer suspended'}.`,
      'success',
      { clear: true }
    )
    suspended.value = !suspended.value
  }
}

const handleDelete = async () => {
  if (
    !window.confirm(
      `Are you sure you want to delete ${props.user.username}?\nAfter you do this they will be logged out and unable to use this instance of AnythingLLM.\n\nThis action is irreversible.`
    )
  )
    return false

  const { success, error } = await Admin.deleteUser(props.user.id)
  if (!success) showToast(error, 'error', { clear: true })
  if (success) {
    rowRef.value?.remove()
    showToast('User deleted from system.', 'success', { clear: true })
  }
}
</script>

<template>
  <tr
    ref="rowRef"
    class="bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10"
  >
    <th scope="row" class="px-6 whitespace-nowrap">
      {{ user.username }}
    </th>
    <td class="px-6">{{ titleCase(user.role) }}</td>
    <td class="px-6">{{ user.createdAt }}</td>
    <td class="px-6 flex items-center gap-x-6 h-full mt-2">
      <button
        v-if="canModify"
        @click="openModal"
        class="text-xs font-medium text-white/80 light:text-black/80 rounded-lg hover:text-white hover:light:text-gray-500 px-2 py-1 hover:bg-white hover:bg-opacity-10"
      >
        Edit
      </button>
      <template v-if="currUser?.id !== user.id && canModify">
        <button
          @click="handleSuspend"
          class="text-xs font-medium text-white/80 light:text-black/80 hover:light:text-orange-500 hover:text-orange-300 rounded-lg px-2 py-1 hover:bg-white hover:light:bg-orange-50 hover:bg-opacity-10"
        >
          {{ suspended ? 'Unsuspend' : 'Suspend' }}
        </button>
        <button
          @click="handleDelete"
          class="text-xs font-medium text-white/80 light:text-black/80 hover:light:text-red-500 hover:text-red-300 rounded-lg px-2 py-1 hover:bg-white hover:light:bg-red-50 hover:bg-opacity-10"
        >
          Delete
        </button>
      </template>
    </td>
  </tr>
  <ModalWrapper :is-open="isOpen">
    <EditUserModal
      :current-user="currUser"
      :user="user"
      :close-modal="closeModal"
    />
  </ModalWrapper>
</template>

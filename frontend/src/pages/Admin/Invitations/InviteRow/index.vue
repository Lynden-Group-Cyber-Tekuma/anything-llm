<script setup>
import { ref, watch, onMounted } from 'vue'
import { titleCase } from 'text-case'
import Admin from '@/models/admin'
import { Trash } from '@phosphor-icons/vue'

const props = defineProps({
  invite: {
    type: Object,
    required: true
  }
})

const rowRef = ref(null)
const status = ref(props.invite.status)
const copied = ref(false)

const handleDelete = async () => {
  if (
    !window.confirm(
      'Are you sure you want to deactivate this invite?\nAfter you do this it will not longer be useable.\n\nThis action is irreversible.'
    )
  )
    return false

  if (rowRef.value) {
    rowRef.value.children[0].innerText = 'Disabled'
  }
  status.value = 'disabled'
  await Admin.disableInvite(props.invite.id)
}

const copyInviteLink = () => {
  if (!props.invite) return false
  window.navigator.clipboard.writeText(
    `${window.location.origin}/accept-invite/${props.invite.code}`
  )
  copied.value = true
}

watch(copied, (newValue) => {
  if (!newValue) return
  setTimeout(() => {
    copied.value = false
  }, 3000)
})
</script>

<template>
  <tr
    ref="rowRef"
    class="bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10"
  >
    <td scope="row" class="px-6 whitespace-nowrap">
      {{ titleCase(status) }}
    </td>
    <td class="px-6">
      {{ invite.claimedBy ? (invite.claimedBy?.username || 'deleted user') : '--' }}
    </td>
    <td class="px-6">
      {{ invite.createdBy?.username || 'deleted user' }}
    </td>
    <td class="px-6">
      {{ invite.createdAt }}
    </td>
    <td class="px-6 flex items-center gap-x-6 h-full mt-1">
      <template v-if="status === 'pending'">
        <button
          @click="copyInviteLink"
          :disabled="copied"
          class="text-xs font-medium text-blue-300 rounded-lg hover:text-blue-400 hover:underline"
        >
          {{ copied ? 'Copied' : 'Copy Invite Link' }}
        </button>
        <button
          @click="handleDelete"
          class="text-xs font-medium text-white/80 light:text-black/80 hover:light:text-red-500 hover:text-red-300 rounded-lg px-2 py-1 hover:bg-white hover:light:bg-red-50 hover:bg-opacity-10"
        >
          <Trash class="h-5 w-5" />
        </button>
      </template>
    </td>
  </tr>
</template>

<script setup>
import { ref } from 'vue'
import Admin from '@/models/admin'
import paths from '@/utils/paths'
import { LinkSimple, Trash } from '@phosphor-icons/vue'

const props = defineProps({
  workspace: {
    type: Object,
    required: true
  },
  users: {
    type: Array,
    default: () => []
  }
})

const rowRef = ref(null)

const handleDelete = async () => {
  if (
    !window.confirm(
      `Are you sure you want to delete ${props.workspace.name}?\nAfter you do this it will be unavailable in this instance of AnythingLLM.\n\nThis action is irreversible.`
    )
  )
    return false

  rowRef.value?.remove()
  await Admin.deleteWorkspace(props.workspace.id)
}
</script>

<template>
  <tr
    ref="rowRef"
    class="bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10"
  >
    <th scope="row" class="px-6 whitespace-nowrap">
      {{ workspace.name }}
    </th>
    <td class="px-6 flex items-center">
      <a
        :href="paths.workspace.chat(workspace.slug)"
        target="_blank"
        rel="noreferrer"
        class="text-white flex items-center hover:underline"
      >
        <LinkSimple class="mr-2 w-4 h-4" /> {{ workspace.slug }}
      </a>
    </td>
    <td class="px-6">
      <a
        :href="paths.workspace.settings.members(workspace.slug)"
        class="text-white flex items-center underline"
      >
        {{ workspace.userIds?.length }}
      </a>
    </td>
    <td class="px-6">{{ workspace.createdAt }}</td>
    <td class="px-6 flex items-center gap-x-6 h-full mt-1">
      <button
        @click="handleDelete"
        class="text-xs font-medium text-white/80 light:text-black/80 hover:light:text-red-500 hover:text-red-300 rounded-lg px-2 py-1 hover:bg-white hover:light:bg-red-50 hover:bg-opacity-10"
      >
        <Trash class="h-5 w-5" />
      </button>
    </td>
  </tr>
</template>

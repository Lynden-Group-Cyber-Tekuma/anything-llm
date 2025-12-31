<script setup>
import { ref } from 'vue'
import { PhTrash } from '@phosphor-icons/vue'
import { stripUuidAndJsonFromString } from '@/components/Modals/ManageWorkspace/Documents/Directory/utils'
import moment from 'moment'
import System from '@/models/system'

const props = defineProps({
  queue: {
    type: Object,
    required: true
  }
})

const rowRef = ref(null)

const handleDelete = async () => {
  rowRef.value?.remove()
  await System.experimentalFeatures.liveSync.setWatchStatusForDocument(
    props.queue.workspaceDoc.workspace.slug,
    props.queue.workspaceDoc.docpath,
    false
  )
}
</script>

<template>
  <tr
    ref="rowRef"
    class="bg-transparent text-white text-opacity-80 text-sm font-medium"
  >
    <td scope="row" class="px-6 py-4 whitespace-nowrap">
      {{ stripUuidAndJsonFromString(queue.workspaceDoc.filename) }}
    </td>
    <td class="px-6 py-4">{{ moment(queue.lastSyncedAt).fromNow() }}</td>
    <td class="px-6 py-4">
      {{ moment(queue.nextSyncAt).format('lll') }}
      <i class="text-xs px-2">({{ moment(queue.nextSyncAt).fromNow() }})</i>
    </td>
    <td class="px-6 py-4">{{ moment(queue.createdAt).format('lll') }}</td>
    <td class="px-6 py-4 flex items-center gap-x-6">
      <button
        @click="handleDelete"
        class="border-none font-medium px-2 py-1 rounded-lg text-theme-text-primary hover:text-red-500"
      >
        <Trash class="h-5 w-5" />
      </button>
    </td>
  </tr>
</template>

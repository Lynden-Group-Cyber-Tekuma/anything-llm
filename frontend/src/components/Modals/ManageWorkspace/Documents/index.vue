<script setup>
import { ref, onMounted } from 'vue'
import { PhArrowsDownUp } from '@phosphor-icons/vue'
import Workspace from '@/models/workspace'
import System from '@/models/system'
import showToast from '@/utils/toast'
import Directory from './Directory/index.vue'
import WorkspaceDirectory from './WorkspaceDirectory/index.vue'

// OpenAI Cost per token
// ref: https://openai.com/pricing#:~:text=%C2%A0/%201K%20tokens-,Embedding%20models,-Build%20advanced%20search
const MODEL_COSTS = {
  'text-embedding-ada-002': 0.0000001, // $0.0001 / 1K tokens
  'text-embedding-3-small': 0.00000002, // $0.00002 / 1K tokens
  'text-embedding-3-large': 0.00000013, // $0.00013 / 1K tokens
}

const props = defineProps({
  workspace: {
    type: Object,
    required: true
  },
  systemSettings: {
    type: Object,
    default: null
  }
})

const highlightWorkspace = ref(false)
const availableDocs = ref([])
const loading = ref(true)
const workspaceDocs = ref([])
const selectedItems = ref({})
const hasChanges = ref(false)
const movedItems = ref([])
const embeddingsCost = ref(0)
const loadingMessage = ref('')

const fetchKeys = async (refetchWorkspace = false) => {
  loading.value = true
  const localFiles = await System.localFiles()
  const currentWorkspace = refetchWorkspace
    ? await Workspace.bySlug(props.workspace.slug)
    : props.workspace

  const documentsInWorkspace =
    currentWorkspace.documents.map((doc) => doc.docpath) || []

  // Documents that are not in the workspace
  const availableDocsData = {
    ...localFiles,
    items: localFiles.items.map((folder) => {
      if (folder.items && folder.type === 'folder') {
        return {
          ...folder,
          items: folder.items.filter(
            (file) =>
              file.type === 'file' &&
              !documentsInWorkspace.includes(`${folder.name}/${file.name}`)
          ),
        }
      } else {
        return folder
      }
    }),
  }

  // Documents that are already in the workspace
  const workspaceDocsData = {
    ...localFiles,
    items: localFiles.items.map((folder) => {
      if (folder.items && folder.type === 'folder') {
        return {
          ...folder,
          items: folder.items.filter(
            (file) =>
              file.type === 'file' &&
              documentsInWorkspace.includes(`${folder.name}/${file.name}`)
          ),
        }
      } else {
        return folder
      }
    }),
  }

  availableDocs.value = availableDocsData
  workspaceDocs.value = workspaceDocsData
  loading.value = false
}

onMounted(() => {
  fetchKeys(true)
})

const updateWorkspace = async (e) => {
  e.preventDefault()
  loading.value = true
  showToast('Updating workspace...', 'info', { autoClose: false })
  loadingMessage.value = 'This may take a while for large documents'

  const changesToSend = {
    adds: movedItems.value.map((item) => `${item.folderName}/${item.name}`),
  }

  selectedItems.value = {}
  hasChanges.value = false
  highlightWorkspace.value = false

  await Workspace.modifyEmbeddings(props.workspace.slug, changesToSend)
    .then((res) => {
      if (!!res.message) {
        showToast(`Error: ${res.message}`, 'error', { clear: true })
        return
      }
      showToast('Workspace updated successfully.', 'success', {
        clear: true,
      })
    })
    .catch((error) => {
      showToast(`Workspace update failed: ${error}`, 'error', {
        clear: true,
      })
    })

  movedItems.value = []
  await fetchKeys(true)
  loading.value = false
  loadingMessage.value = ''
}

const moveSelectedItemsToWorkspace = () => {
  highlightWorkspace.value = false
  hasChanges.value = true

  const newMovedItems = []

  for (const itemId of Object.keys(selectedItems.value)) {
    for (const folder of availableDocs.value.items) {
      const foundItem = folder.items.find((file) => file.id === itemId)
      if (foundItem) {
        newMovedItems.push({ ...foundItem, folderName: folder.name })
        break
      }
    }
  }

  let totalTokenCount = 0
  newMovedItems.forEach((item) => {
    const { cached, token_count_estimate } = item
    if (!cached) {
      totalTokenCount += token_count_estimate
    }
  })

  // Do not do cost estimation unless the embedding engine is OpenAi.
  if (props.systemSettings?.EmbeddingEngine === 'openai') {
    const COST_PER_TOKEN =
      MODEL_COSTS[
        props.systemSettings?.EmbeddingModelPref || 'text-embedding-ada-002'
      ]

    const dollarAmount = (totalTokenCount / 1000) * COST_PER_TOKEN
    embeddingsCost.value = dollarAmount
  }

  movedItems.value = [...movedItems.value, ...newMovedItems]

  let newAvailableDocs = JSON.parse(JSON.stringify(availableDocs.value))
  let newWorkspaceDocs = JSON.parse(JSON.stringify(workspaceDocs.value))

  for (const itemId of Object.keys(selectedItems.value)) {
    let foundItem = null
    let foundFolderIndex = null

    newAvailableDocs.items = newAvailableDocs.items.map(
      (folder, folderIndex) => {
        const remainingItems = folder.items.filter((file) => {
          const match = file.id === itemId
          if (match) {
            foundItem = { ...file }
            foundFolderIndex = folderIndex
          }
          return !match
        })

        return {
          ...folder,
          items: remainingItems,
        }
      }
    )

    if (foundItem) {
      newWorkspaceDocs.items[foundFolderIndex].items.push(foundItem)
    }
  }

  availableDocs.value = newAvailableDocs
  workspaceDocs.value = newWorkspaceDocs
  selectedItems.value = {}
}
</script>

<template>
  <div class="flex upload-modal -mt-6 z-10 relative">
    <Directory
      :files="availableDocs"
      :loading="loading"
      :loadingMessage="loadingMessage"
      :workspace="workspace"
      :fetchKeys="fetchKeys"
      :selectedItems="selectedItems"
      :highlightWorkspace="highlightWorkspace"
      :moveToWorkspace="moveSelectedItemsToWorkspace"
      @update:files="availableDocs = $event"
      @update:loading="loading = $event"
      @update:selectedItems="selectedItems = $event"
      @update:highlightWorkspace="highlightWorkspace = $event"
      @update:loadingMessage="loadingMessage = $event"
    />
    <div class="upload-modal-arrow">
      <PhArrowsDownUp class="text-white text-base font-bold rotate-90 w-11 h-11" />
    </div>
    <WorkspaceDirectory
      :workspace="workspace"
      :files="workspaceDocs"
      :highlightWorkspace="highlightWorkspace"
      :loading="loading"
      :loadingMessage="loadingMessage"
      :hasChanges="hasChanges"
      :embeddingCosts="embeddingsCost"
      :movedItems="movedItems"
      :fetchKeys="fetchKeys"
      @update:loadingMessage="loadingMessage = $event"
      @update:loading="loading = $event"
      @saveChanges="updateWorkspace"
      @fetchKeys="fetchKeys($event)"
    />
  </div>
</template>

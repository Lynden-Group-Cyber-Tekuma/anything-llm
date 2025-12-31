<template>
  <tr
    ref="rowRef"
    class="bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10"
  >
    <td scope="row" class="px-6 py-2 whitespace-nowrap">
      <div class="flex items-center">
        <span class="mr-2 font-mono">{{ connectionString }}</span>
        <div class="flex items-center space-x-2">
          <button
            @click="handleCopy"
            data-tooltip-id="copy-connection-text"
            data-tooltip-content="Copy connection string"
            class="border-none text-theme-text-primary hover:text-theme-text-secondary transition-colors duration-200 p-1 rounded"
          >
            <Check v-if="copied" class="h-4 w-4 text-green-500" />
            <Copy v-else class="h-4 w-4" />
          </button>

          <button
            @click="handleConnect"
            data-tooltip-id="auto-connection"
            data-tooltip-content="Automatically connect to extension"
            class="border-none text-theme-text-primary hover:text-theme-text-secondary transition-colors duration-200 p-1 rounded"
          >
            <Plug class="h-4 w-4" />
          </button>
        </div>
      </div>
    </td>
    <td v-if="isMultiUser" class="px-6 py-2">
      {{ apiKey.user ? apiKey.user.username : 'N/A' }}
    </td>
    <td class="px-6 py-2">
      {{ new Date(apiKey.createdAt).toLocaleString() }}
    </td>
    <td class="px-6 py-2">
      <button
        @click="handleRevoke"
        class="text-xs font-medium text-white/80 light:text-black/80 hover:light:text-red-500 hover:text-red-300 rounded-lg px-2 py-1 hover:bg-white hover:light:bg-red-50 hover:bg-opacity-10"
      >
        <Trash class="h-4 w-4" />
      </button>
    </td>
  </tr>
</template>

<script setup>
import { ref } from 'vue'
import BrowserExtensionApiKey from '@/models/browserExtensionApiKey'
import showToast from '@/utils/toast'
import { PhTrash, PhCopy, PhCheck, PhPlug } from '@phosphor-icons/vue'
import { POPUP_BROWSER_EXTENSION_EVENT } from '@/utils/constants'

const props = defineProps({
  apiKey: {
    type: Object,
    required: true
  },
  connectionString: {
    type: String,
    required: true
  },
  isMultiUser: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['remove'])

const rowRef = ref(null)
const copied = ref(false)

const handleRevoke = async () => {
  if (
    !window.confirm(
      `Are you sure you want to revoke this browser extension API key?\nAfter you do this it will no longer be useable.\n\nThis action is irreversible.`
    )
  )
    return false

  const result = await BrowserExtensionApiKey.revoke(props.apiKey.id)
  if (result.success) {
    emit('remove', props.apiKey.id)
    showToast('Browser Extension API Key permanently revoked', 'info', {
      clear: true,
    })
  } else {
    showToast('Failed to revoke API Key', 'error', {
      clear: true,
    })
  }
}

const handleCopy = () => {
  navigator.clipboard.writeText(props.connectionString)
  showToast('Connection string copied to clipboard', 'success', {
    clear: true,
  })
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

const handleConnect = () => {
  window.postMessage(
    { type: POPUP_BROWSER_EXTENSION_EVENT, apiKey: props.connectionString },
    '*'
  )
  showToast('Attempting to connect to browser extension...', 'info', {
    clear: true,
  })
}
</script>

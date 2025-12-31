<template>
  <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
    <div class="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            New Browser Extension API Key
          </h3>
        </div>
        <button
          @click="$emit('close')"
          type="button"
          class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
        >
          <X :size="24" weight="bold" class="text-white" />
        </button>
      </div>
      <div class="px-7 py-6">
        <form @submit.prevent="handleCreate">
          <div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <p v-if="error" class="text-red-400 text-sm">Error: {{ error }}</p>
            <input
              v-if="apiKey"
              type="text"
              :value="apiKey"
              disabled
              class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg block w-full p-2.5"
            />
            <p
              v-if="isMultiUser"
              class="text-yellow-300 light:text-orange-500 text-xs md:text-sm font-semibold"
            >
              Warning: You are in multi-user mode, this API key will allow
              access to all workspaces associated with your account. Please
              share it cautiously.
            </p>
            <p class="text-white text-opacity-60 text-xs md:text-sm">
              After clicking "Create API Key", AnythingLLM will attempt to
              connect to your browser extension automatically.
            </p>
            <p class="text-white text-opacity-60 text-xs md:text-sm">
              If you see "Connected to AnythingLLM" in the extension, the
              connection was successful. If not, please copy the connection
              string and paste it into the extension manually.
            </p>
          </div>
          <div class="flex justify-between items-center mt-6 pt-6 border-t border-theme-modal-border">
            <template v-if="!apiKey">
              <button
                @click="$emit('close')"
                type="button"
                class="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
              >
                Create API Key
              </button>
            </template>
            <button
              v-else
              @click="copyApiKey"
              type="button"
              :disabled="copied"
              class="w-full transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm cursor-pointer"
            >
              {{ copied ? 'API Key Copied!' : 'Copy API Key' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X } from '@phosphor-icons/vue'
import BrowserExtensionApiKey from '@/models/browserExtensionApiKey'
import { fullApiUrl, POPUP_BROWSER_EXTENSION_EVENT } from '@/utils/constants'

const props = defineProps({
  isMultiUser: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const apiKey = ref(null)
const error = ref(null)
const copied = ref(false)

const handleCreate = async (e) => {
  error.value = null

  const { apiKey: newApiKey, error: apiError } =
    await BrowserExtensionApiKey.generateKey()
  if (!!newApiKey) {
    const fullApiKey = `${fullApiUrl()}|${newApiKey}`
    apiKey.value = fullApiKey
    emit('success')

    window.postMessage(
      { type: POPUP_BROWSER_EXTENSION_EVENT, apiKey: fullApiKey },
      '*'
    )
  }
  error.value = apiError
}

const copyApiKey = () => {
  if (!apiKey.value) return false
  window.navigator.clipboard.writeText(apiKey.value)
  copied.value = true
}

watch(copied, (newVal) => {
  if (!newVal) return false
  setTimeout(() => {
    copied.value = false
  }, 3000)
})
</script>

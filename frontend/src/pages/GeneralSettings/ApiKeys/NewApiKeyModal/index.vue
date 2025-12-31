<template>
  <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
    <div class="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            Create new API key
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
            <div v-if="apiKey" class="relative">
              <input
                type="text"
                :value="apiKey.secret"
                disabled
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg outline-none block w-full p-2.5 pr-10"
              />
              <button
                type="button"
                @click="copyApiKey"
                :disabled="copied"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-theme-modal-border transition-all duration-300"
              >
                <Check
                  v-if="copied"
                  :size="20"
                  class="text-green-400"
                  weight="bold"
                />
                <Copy
                  v-else
                  :size="20"
                  class="text-white"
                  weight="bold"
                />
              </button>
            </div>
            <p class="text-white text-opacity-60 text-xs md:text-sm">
              Once created the API key can be used to programmatically access
              and configure this AnythingLLM instance.
            </p>
            <a
              :href="paths.apiDocs()"
              target="_blank"
              rel="noreferrer"
              class="text-blue-400 hover:underline"
            >
              Read the API documentation &rarr;
            </a>
          </div>
          <div class="flex justify-end items-center mt-6 pt-6 border-t border-theme-modal-border">
            <template v-if="!apiKey">
              <button
                @click="$emit('close')"
                type="button"
                class="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm mr-2"
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
              @click="$emit('close')"
              type="button"
              class="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, Copy, Check } from '@phosphor-icons/vue'
import Admin from '@/models/admin'
import paths from '@/utils/paths'
import { userFromStorage } from '@/utils/request'
import System from '@/models/system'
import showToast from '@/utils/toast'

const emit = defineEmits(['close', 'success'])

const apiKey = ref(null)
const error = ref(null)
const copied = ref(false)

const handleCreate = async (e) => {
  error.value = null
  const user = userFromStorage()
  const Model = !!user ? Admin : System

  const { apiKey: newApiKey, error: apiError } = await Model.generateApiKey()
  if (!!newApiKey) {
    apiKey.value = newApiKey
    emit('success')
  }
  error.value = apiError
}

const copyApiKey = () => {
  if (!apiKey.value) return false
  window.navigator.clipboard.writeText(apiKey.value.secret)
  copied.value = true
  showToast('API key copied to clipboard', 'success', {
    clear: true,
  })
}

watch(copied, (newVal) => {
  if (!newVal) return false
  setTimeout(() => {
    copied.value = false
  }, 3000)
})
</script>

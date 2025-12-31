<script setup>
import { ref } from 'vue'
import { X } from '@phosphor-icons/vue'
import System from '@/models/system'
import showToast from '@/utils/toast'

const props = defineProps({
  closeModal: {
    type: Function,
    required: true
  },
  onRefresh: {
    type: Function,
    required: true
  }
})

const error = ref(null)

const handleCreate = async (e) => {
  e.preventDefault()
  error.value = null
  const formData = new FormData(e.target)
  const newVariable = {}
  for (const [key, value] of formData.entries())
    newVariable[key] = value.trim()

  if (!newVariable.key || !newVariable.value) {
    error.value = 'Key and value are required'
    return
  }

  try {
    await System.promptVariables.create(newVariable)
    showToast('Variable created successfully', 'success', { clear: true })
    if (props.onRefresh) props.onRefresh()
    props.closeModal()
  } catch (err) {
    console.error('Error creating variable:', err)
    error.value = 'Failed to create variable'
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
    <div class="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            Add New Variable
          </h3>
        </div>
        <button
          @click="closeModal"
          type="button"
          class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
        >
          <X :size="24" weight="bold" class="text-white" />
        </button>
      </div>
      <div class="p-6">
        <form @submit="handleCreate">
          <div class="space-y-4">
            <div>
              <label
                for="key"
                class="block mb-2 text-sm font-medium text-white"
              >
                Key
              </label>
              <input
                name="key"
                type="text"
                minlength="3"
                maxlength="255"
                class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="e.g., company_name"
                required
                autocomplete="off"
                pattern="^[a-zA-Z0-9_]+$"
              />
              <p class="mt-2 text-xs text-white/60">
                Key must be unique and will be used in prompts as {key}.
                Only letters, numbers and underscores are allowed.
              </p>
            </div>
            <div>
              <label
                for="value"
                class="block mb-2 text-sm font-medium text-white"
              >
                Value
              </label>
              <input
                name="value"
                type="text"
                class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="e.g., Acme Corp"
                required
                autocomplete="off"
              />
            </div>
            <div>
              <label
                for="description"
                class="block mb-2 text-sm font-medium text-white"
              >
                Description
              </label>
              <input
                name="description"
                type="text"
                class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="Optional description"
                autocomplete="off"
              />
            </div>
            <p v-if="error" class="text-red-400 text-sm">Error: {{ error }}</p>
          </div>
          <div class="flex justify-between items-center mt-6 pt-6 border-t border-theme-modal-border">
            <button
              @click="closeModal"
              type="button"
              class="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
            >
              Create variable
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X } from '@phosphor-icons/vue'
import Document from '@/models/document'

const props = defineProps({
  closeModal: {
    type: Function,
    required: true
  },
  files: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:files'])

const error = ref(null)
const folderName = ref('')

const handleCreate = async (e) => {
  e.preventDefault()
  error.value = null
  if (folderName.value.trim() !== '') {
    const newFolder = {
      name: folderName.value,
      type: 'folder',
      items: [],
    }
    const { success } = await Document.createFolder(folderName.value)
    if (success) {
      emit('update:files', {
        ...props.files,
        items: [...props.files.items, newFolder],
      })
      props.closeModal()
    } else {
      error.value = 'Failed to create folder'
    }
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
    <div class="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            Create New Folder
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
                for="folderName"
                class="block mb-2 text-sm font-medium text-white"
              >
                Folder Name
              </label>
              <input
                name="folderName"
                type="text"
                class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="Enter folder name"
                required
                autocomplete="off"
                v-model="folderName"
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
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X } from '@phosphor-icons/vue'
import ModalWrapper from '@/components/ModalWrapper'
import { CMD_REGEX } from './index.vue'

const props = defineProps({
  isOpen: Boolean,
  onClose: Function,
  onSave: Function,
  onDelete: Function,
  preset: Object
})

const command = ref('')
const deleting = ref(false)

// Update command when preset or isOpen changes
watch([() => props.preset, () => props.isOpen], ([newPreset, newIsOpen]) => {
  if (newPreset && newIsOpen) {
    command.value = newPreset.command?.slice(1) || ''
  }
})

const handleSubmit = (e) => {
  e.preventDefault()
  const form = new FormData(e.target)
  const sanitizedCommand = command.value.replace(CMD_REGEX, '')
  props.onSave({
    id: props.preset.id,
    command: `/${sanitizedCommand}`,
    prompt: form.get('prompt'),
    description: form.get('description'),
  })
}

const handleCommandChange = (e) => {
  const value = e.target.value.replace(CMD_REGEX, '')
  command.value = value
}

const handleDelete = async () => {
  if (!window.confirm('Are you sure you want to delete this preset?')) return

  deleting.value = true
  await props.onDelete(props.preset.id)
  deleting.value = false
  props.onClose()
}
</script>

<template>
  <ModalWrapper :is-open="isOpen">
    <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            Edit Preset
          </h3>
        </div>
        <button
          @click="onClose"
          type="button"
          class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
        >
          <X :size="24" weight="bold" class="text-white" />
        </button>
      </div>
      <div
        class="h-full w-full overflow-y-auto"
        style="max-height: calc(100vh - 200px)"
      >
        <form @submit="handleSubmit">
          <div class="py-7 px-9 space-y-2 flex-col">
            <div class="w-full flex flex-col gap-y-4">
              <div>
                <label
                  for="command"
                  class="block mb-2 text-sm font-medium text-white"
                >
                  Command
                </label>
                <div class="flex items-center">
                  <span class="text-white text-sm mr-2 font-bold">/</span>
                  <input
                    type="text"
                    name="command"
                    placeholder="your-command"
                    v-model="command"
                    @input="handleCommandChange"
                    required
                    class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                  />
                </div>
              </div>
              <div>
                <label
                  for="prompt"
                  class="block mb-2 text-sm font-medium text-white"
                >
                  Prompt
                </label>
                <textarea
                  name="prompt"
                  placeholder="This is a test prompt. Please respond with a poem about LLMs."
                  :value="preset.prompt"
                  required
                  class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                ></textarea>
              </div>
              <div>
                <label
                  for="description"
                  class="block mb-2 text-sm font-medium text-white"
                >
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  :value="preset.description"
                  placeholder="Responds with a poem about LLMs."
                  required
                  class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                />
              </div>
            </div>
          </div>
          <div class="flex w-full justify-between items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
            <button
              :disabled="deleting"
              @click="handleDelete"
              type="button"
              class="border-none transition-all duration-300 bg-transparent text-red-500 hover:bg-red-500/25 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {{ deleting ? 'Deleting...' : 'Delete Preset' }}
            </button>
            <div class="flex space-x-2">
              <button
                @click="onClose"
                type="button"
                class="border-none transition-all duration-300 bg-transparent text-white hover:opacity-60 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </ModalWrapper>
</template>

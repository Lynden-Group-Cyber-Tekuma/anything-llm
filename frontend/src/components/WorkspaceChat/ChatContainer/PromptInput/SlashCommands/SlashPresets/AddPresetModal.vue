<script setup>
import { ref } from 'vue'
import { PhX } from '@phosphor-icons/vue'
import ModalWrapper from '@/components/ModalWrapper'
import { CMD_REGEX } from './index.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  isOpen: Boolean,
  onClose: Function,
  onSave: Function
})

const { t } = useI18n()
const command = ref('')

const handleSubmit = async (e) => {
  e.preventDefault()
  const form = new FormData(e.target)
  const sanitizedCommand = command.value.replace(CMD_REGEX, '')
  const saved = await props.onSave({
    command: `/${sanitizedCommand}`,
    prompt: form.get('prompt'),
    description: form.get('description'),
  })
  if (saved) command.value = ''
}

const handleCommandChange = (e) => {
  const value = e.target.value.replace(CMD_REGEX, '')
  command.value = value
}
</script>

<template>
  <ModalWrapper :is-open="isOpen">
    <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            {{ t('chat_window.add_new_preset') }}
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
                  {{ t('chat_window.command') }}
                </label>
                <div class="flex items-center">
                  <span class="text-white text-sm mr-2 font-bold">/</span>
                  <input
                    name="command"
                    type="text"
                    id="command"
                    :placeholder="t('chat_window.your_command')"
                    v-model="command"
                    @input="handleCommandChange"
                    maxlength="25"
                    autocomplete="off"
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
                  id="prompt"
                  autocomplete="off"
                  :placeholder="t('chat_window.placeholder_prompt')"
                  required
                  class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                ></textarea>
              </div>
              <div>
                <label
                  for="description"
                  class="block mb-2 text-sm font-medium text-white"
                >
                  {{ t('chat_window.description') }}
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  :placeholder="t('chat_window.placeholder_description')"
                  maxlength="80"
                  autocomplete="off"
                  required
                  class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                />
              </div>
            </div>
          </div>
          <div class="flex w-full justify-end items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
            <button
              @click="onClose"
              type="button"
              class="transition-all duration-300 bg-transparent text-white hover:opacity-60 px-4 py-2 rounded-lg text-sm"
            >
              {{ t('chat_window.cancel') }}
            </button>
            <button
              type="submit"
              class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
            >
              {{ t('chat_window.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </ModalWrapper>
</template>

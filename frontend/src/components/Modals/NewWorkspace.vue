<script setup>
import { ref } from 'vue'
import { X } from '@phosphor-icons/vue'
import Workspace from '@/models/workspace'
import paths from '@/utils/paths'
import { useI18n } from 'vue-i18n'
import ModalWrapper from '@/components/ModalWrapper/index.vue'

const props = defineProps({
  hideModal: {
    type: Function,
    default: () => false
  }
})

const { t } = useI18n()
const formEl = ref(null)
const error = ref(null)

const handleCreate = async (e) => {
  error.value = null
  e.preventDefault()
  const data = {}
  const form = new FormData(formEl.value)
  for (var [key, value] of form.entries()) data[key] = value
  const { workspace, message } = await Workspace.new(data)
  if (!!workspace) {
    window.location.href = paths.workspace.chat(workspace.slug)
  }
  error.value = message
}
</script>

<template>
  <ModalWrapper :isOpen="true">
    <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            {{ t('new-workspace.title') }}
          </h3>
        </div>
        <button
          @click="hideModal"
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
        <form ref="formEl" @submit="handleCreate">
          <div class="py-7 px-9 space-y-2 flex-col">
            <div class="w-full flex flex-col gap-y-4">
              <div>
                <label
                  for="name"
                  class="block mb-2 text-sm font-medium text-white"
                >
                  {{ t('common.workspaces-name') }}
                </label>
                <input
                  name="name"
                  type="text"
                  id="name"
                  class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                  :placeholder="t('new-workspace.placeholder')"
                  required
                  autocomplete="off"
                  autofocus
                />
              </div>
              <p v-if="error" class="text-red-400 text-sm">Error: {{ error }}</p>
            </div>
          </div>
          <div class="flex w-full justify-end items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
            <button
              type="submit"
              class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </ModalWrapper>
</template>

<script>
import { defineComponent, ref } from 'vue'

export function useNewWorkspaceModal() {
  const showing = ref(false)
  const showModal = () => {
    showing.value = true
  }
  const hideModal = () => {
    showing.value = false
  }

  return { showing, showModal, hideModal }
}

export default defineComponent({
  name: 'NewWorkspaceModal'
})
</script>

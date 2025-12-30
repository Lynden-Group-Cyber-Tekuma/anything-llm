<script setup>
import { Teleport } from 'vue'
import ModalWrapper from '@/components/ModalWrapper'
import { X } from '@phosphor-icons/vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  isOpen: Boolean,
  closeModal: Function,
  postSubmit: Function,
  settings: Object,
  llmProvider: Object
})

const { t } = useI18n()

async function handleUpdate(e) {
  e.preventDefault()
  e.stopPropagation()
  const data = {}
  const form = new FormData(e.target)
  for (var [key, value] of form.entries()) data[key] = value
  const { error } = await System.updateSystem(data)
  if (error) {
    showToast(
      `Failed to save ${props.llmProvider.name} settings: ${error}`,
      'error'
    )
    return
  }

  props.closeModal()
  props.postSubmit()
  return false
}
</script>

<script>
import { defineComponent, h } from 'vue'
import { useI18n } from 'vue-i18n'

// NoSetupWarning component
export const NoSetupWarning = defineComponent({
  props: {
    showing: Boolean,
    onSetupClick: Function
  },
  setup(props) {
    const { t } = useI18n()

    if (!props.showing) return () => null

    return () => h('button', {
      type: 'button',
      onClick: props.onSetupClick,
      class: 'border border-blue-500 rounded-lg p-2 flex flex-col items-center gap-y-2 bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-all duration-300'
    }, [
      h('p', { class: 'text-sm text-center' }, [
        h('b', t('chat_window.workspace_llm_manager.missing_credentials'))
      ]),
      h('p', { class: 'text-xs text-center' },
        t('chat_window.workspace_llm_manager.missing_credentials_description')
      )
    ])
  }
})
</script>

<template>
  <Teleport v-if="isOpen" to="body">
    <ModalWrapper :is-open="isOpen">
      <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div class="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
          <div class="relative p-6 border-b rounded-t border-theme-modal-border">
            <div class="w-full flex gap-x-2 items-center">
              <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
                {{ llmProvider.name }} Settings
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
          <form id="provider-form" @submit="handleUpdate">
            <div class="px-7 py-6">
              <div class="space-y-6 max-h-[60vh] overflow-y-auto p-1">
                <p class="text-sm text-white/60">
                  To use {{ llmProvider.name }} as this workspace's LLM you need to
                  set it up first.
                </p>
                <div v-html="llmProvider.options(settings, { credentialsOnly: true })"></div>
              </div>
            </div>
            <div class="flex justify-between items-center mt-6 pt-6 border-t border-theme-modal-border px-7 pb-6">
              <button
                type="button"
                @click="closeModal"
                class="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="provider-form"
                class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
              >
                Save settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalWrapper>
  </Teleport>
</template>

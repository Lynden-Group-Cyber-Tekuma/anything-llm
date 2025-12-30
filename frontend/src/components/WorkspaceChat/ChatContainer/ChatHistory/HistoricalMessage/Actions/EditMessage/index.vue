<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Pencil } from '@phosphor-icons/vue'
import Appearance from '@/models/appearance'
import { useI18n } from 'vue-i18n'

const EDIT_EVENT = 'toggle-message-edit'

// Composable for edit message functionality
export function useEditMessage({ chatId, role }) {
  const isEditing = ref(false)

  function onEditEvent(e) {
    if (e.detail.chatId !== chatId || e.detail.role !== role) {
      isEditing.value = false
      return false
    }
    isEditing.value = !isEditing.value
  }

  onMounted(() => {
    if (!chatId || !role) return
    window.addEventListener(EDIT_EVENT, onEditEvent)
  })

  onUnmounted(() => {
    window.removeEventListener(EDIT_EVENT, onEditEvent)
  })

  return { isEditing, setIsEditing: (value) => { isEditing.value = value } }
}
</script>

<script>
import { defineComponent, h } from 'vue'

// EditMessageAction component
export const EditMessageAction = defineComponent({
  props: {
    chatId: String,
    role: String,
    isEditing: Boolean
  },
  setup(props) {
    const { t } = useI18n()

    function handleEditClick() {
      window.dispatchEvent(
        new CustomEvent(EDIT_EVENT, { detail: { chatId: props.chatId, role: props.role } })
      )
    }

    if (!props.chatId || props.isEditing) return () => null

    return () => h('div', {
      class: `mt-3 relative ${props.role === 'user' && !props.isEditing ? '' : '!opacity-100'}`
    }, [
      h('button', {
        onClick: handleEditClick,
        'data-tooltip-id': 'edit-input-text',
        'data-tooltip-content': `${
          props.role === 'user'
            ? t('chat_window.edit_prompt')
            : t('chat_window.edit_response')
        } `,
        class: 'border-none text-zinc-300',
        'aria-label': `Edit ${props.role === 'user' ? t('chat_window.edit_prompt') : t('chat_window.edit_response')}`
      }, [
        h(Pencil, {
          color: 'var(--theme-sidebar-footer-icon-fill)',
          size: 21,
          class: 'mb-1'
        })
      ])
    ])
  }
})

// EditMessageForm component
export const EditMessageForm = defineComponent({
  props: {
    role: String,
    chatId: String,
    message: String,
    attachments: {
      type: Array,
      default: () => []
    },
    adjustTextArea: Function,
    saveChanges: Function
  },
  setup(props) {
    const formRef = ref(null)
    const { t } = useI18n()

    function handleSaveMessage(e) {
      e.preventDefault()
      const form = new FormData(e.target)
      const editedMessage = form.get('editedMessage')
      props.saveChanges({ editedMessage, chatId: props.chatId, role: props.role, attachments: props.attachments })
      window.dispatchEvent(
        new CustomEvent(EDIT_EVENT, { detail: { chatId: props.chatId, role: props.role, attachments: props.attachments } })
      )
    }

    function cancelEdits() {
      window.dispatchEvent(
        new CustomEvent(EDIT_EVENT, { detail: { chatId: props.chatId, role: props.role, attachments: props.attachments } })
      )
      return false
    }

    watch(formRef, (newVal) => {
      if (!newVal) return
      newVal.focus()
      props.adjustTextArea({ target: newVal })
    })

    return () => h('form', {
      onSubmit: handleSaveMessage,
      class: 'flex flex-col w-full'
    }, [
      h('textarea', {
        ref: formRef,
        name: 'editedMessage',
        spellCheck: Appearance.get('enableSpellCheck'),
        class: 'text-white w-full rounded bg-theme-bg-secondary border border-white/20 active:outline-none focus:outline-none focus:ring-0 pr-16 pl-1.5 pt-1.5 resize-y',
        value: props.message,
        onChange: props.adjustTextArea
      }),
      h('div', { class: 'mt-3 flex justify-center' }, [
        h('button', {
          type: 'submit',
          class: 'border-none px-2 py-1 bg-gray-200 text-gray-700 font-medium rounded-md mr-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }, t('chat_window.save_submit')),
        h('button', {
          type: 'button',
          class: 'border-none px-2 py-1 bg-historical-msg-system text-white font-medium rounded-md hover:bg-historical-msg-user/90 light:hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
          onClick: cancelEdits
        }, t('chat_window.cancel'))
      ])
    ])
  }
})
</script>

<template>
  <slot />
</template>

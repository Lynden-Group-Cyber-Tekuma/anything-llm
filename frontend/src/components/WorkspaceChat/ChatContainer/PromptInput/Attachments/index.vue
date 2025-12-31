<script setup>
import { defineComponent, h } from 'vue'
import { PhCircleNotch, PhFileCode, PhFileCsv, PhFileDoc, PhFileHtml, PhFileText, PhFileImage, PhFilePdf, PhWarningOctagon, PhX,  } from '@phosphor-icons/vue'
import { REMOVE_ATTACHMENT_EVENT } from '../../DnDWrapper'

const props = defineProps({
  attachments: {
    type: Array,
    default: () => []
  }
})

function displayFromFile(file) {
  const extension = file?.name?.split('.')?.pop()?.toLowerCase() ?? 'txt'
  switch (extension) {
    case 'pdf':
      return { iconBgColor: 'bg-magenta', Icon: FilePdf }
    case 'doc':
    case 'docx':
      return { iconBgColor: 'bg-royalblue', Icon: FileDoc }
    case 'html':
      return { iconBgColor: 'bg-purple', Icon: FileHtml }
    case 'csv':
    case 'xlsx':
      return { iconBgColor: 'bg-success', Icon: FileCsv }
    case 'json':
    case 'sql':
    case 'js':
    case 'jsx':
    case 'cpp':
    case 'c':
      return { iconBgColor: 'bg-warn', Icon: FileCode }
    case 'png':
    case 'jpg':
    case 'jpeg':
      return { iconBgColor: 'bg-royalblue', Icon: FileImage }
    default:
      return { iconBgColor: 'bg-royalblue', Icon: FileText }
  }
}

// AttachmentItem component
const AttachmentItem = defineComponent({
  props: {
    attachment: Object
  },
  setup(props) {
    const { uid, file, status, error, document, type, contentString } = props.attachment
    const { iconBgColor, Icon } = displayFromFile(file)

    function removeFileFromQueue() {
      window.dispatchEvent(
        new CustomEvent(REMOVE_ATTACHMENT_EVENT, { detail: { uid, document } })
      )
    }

    // In progress state
    if (status === 'in_progress') {
      return () => h('div', {
        class: 'relative flex items-center gap-x-1 rounded-lg bg-theme-attachment-bg border-none w-[180px] group'
      }, [
        h('div', {
          class: 'bg-theme-attachment-icon-spinner-bg rounded-md flex items-center justify-center flex-shrink-0 h-[32px] w-[32px] m-1'
        }, [
          h(CircleNotch, {
            size: 18,
            weight: 'bold',
            class: 'text-theme-attachment-icon-spinner animate-spin'
          })
        ]),
        h('div', { class: 'flex flex-col w-[125px]' }, [
          h('p', { class: 'text-theme-attachment-text text-xs font-semibold truncate' }, file.name),
          h('p', { class: 'text-theme-attachment-text-secondary text-[10px] leading-[14px] font-medium' }, 'Uploading...')
        ])
      ])
    }

    // Failed state
    if (status === 'failed') {
      return () => h('div', {}, [
        h('div', {
          'data-tooltip-id': `attachment-uid-${uid}-error`,
          'data-tooltip-content': error,
          class: 'relative flex items-center gap-x-1 rounded-lg bg-theme-attachment-error-bg border-none w-[180px] group'
        }, [
          h('div', { class: 'invisible group-hover:visible absolute -top-[5px] -right-[5px] w-fit h-fit z-[10]' }, [
            h('button', {
              onClick: removeFileFromQueue,
              type: 'button',
              class: 'bg-white hover:bg-error hover:text-theme-attachment-text rounded-full p-1 flex items-center justify-center hover:border-transparent border border-theme-attachment-bg'
            }, [
              h(X, { size: 10, class: 'flex-shrink-0' })
            ])
          ]),
          h('div', { class: 'bg-error rounded-md flex items-center justify-center flex-shrink-0 h-[32px] w-[32px] m-1' }, [
            h(WarningOctagon, { size: 24, class: 'text-theme-attachment-icon' })
          ]),
          h('div', { class: 'flex flex-col w-[125px]' }, [
            h('p', { class: 'text-theme-attachment-text text-xs font-semibold truncate' }, file.name),
            h('p', { class: 'text-theme-attachment-text-secondary text-[10px] leading-[14px] font-medium truncate' }, error ?? 'File not embedded!')
          ])
        ])
      ])
    }

    // Attachment type (image)
    if (type === 'attachment') {
      return () => h('div', {}, [
        h('div', {
          'data-tooltip-id': `attachment-uid-${uid}-success`,
          'data-tooltip-content': `${file.name} will be attached to this prompt. It will not be embedded into the workspace permanently.`,
          class: 'relative flex items-center gap-x-1 rounded-lg bg-theme-attachment-success-bg border-none w-[180px] group'
        }, [
          h('div', { class: 'invisible group-hover:visible absolute -top-[5px] -right-[5px] w-fit h-fit z-[10]' }, [
            h('button', {
              onClick: removeFileFromQueue,
              type: 'button',
              class: 'bg-white hover:bg-error hover:text-theme-attachment-text rounded-full p-1 flex items-center justify-center hover:border-transparent border border-theme-attachment-bg'
            }, [
              h(X, { size: 10, class: 'flex-shrink-0' })
            ])
          ]),
          contentString
            ? h('img', {
                alt: `Preview of ${file.name}`,
                src: contentString,
                class: `${iconBgColor} w-[30px] h-[30px] rounded-lg flex items-center justify-center m-1`
              })
            : h('div', { class: `${iconBgColor} rounded-md flex items-center justify-center flex-shrink-0 h-[32px] w-[32px] m-1` }, [
                h(Icon, { size: 24, class: 'text-theme-attachment-icon' })
              ]),
          h('div', { class: 'flex flex-col w-[125px]' }, [
            h('p', { class: 'text-theme-attachment-text text-xs font-semibold truncate' }, file.name),
            h('p', { class: 'text-theme-attachment-text-secondary text-[10px] leading-[14px] font-medium' }, 'Image attached!')
          ])
        ])
      ])
    }

    // Default/embedded state
    return () => h('div', {}, [
      h('div', {
        'data-tooltip-id': `attachment-uid-${uid}-success`,
        'data-tooltip-content': status === 'embedded'
          ? `${file.name} was uploaded and embedded into this workspace. It will be available for RAG chat now.`
          : `${file.name} will be used as context for this chat only.`,
        class: 'relative flex items-center gap-x-1 rounded-lg bg-theme-attachment-bg border-none w-[180px] group'
      }, [
        h('div', { class: 'invisible group-hover:visible absolute -top-[5px] -right-[5px] w-fit h-fit z-[10]' }, [
          h('button', {
            onClick: removeFileFromQueue,
            type: 'button',
            class: 'bg-white hover:bg-error hover:text-theme-attachment-text rounded-full p-1 flex items-center justify-center hover:border-transparent border border-theme-attachment-bg'
          }, [
            h(X, { size: 10, class: 'flex-shrink-0' })
          ])
        ]),
        h('div', { class: `${iconBgColor} rounded-md flex items-center justify-center flex-shrink-0 h-[32px] w-[32px] m-1` }, [
          h(Icon, { size: 24, weight: 'light', class: 'text-theme-attachment-icon' })
        ]),
        h('div', { class: 'flex flex-col w-[125px]' }, [
          h('p', { class: 'text-white text-xs font-semibold truncate' }, file.name),
          h('p', { class: 'text-theme-attachment-text-secondary text-[10px] leading-[14px] font-medium' },
            status === 'embedded' ? 'File embedded!' : 'Added as context!')
        ])
      ])
    ])
  }
})
</script>

<template>
  <div v-if="attachments.length > 0" class="flex flex-wrap gap-2 mt-2 mb-4">
    <AttachmentItem
      v-for="attachment in attachments"
      :key="attachment.uid"
      :attachment="attachment"
    />
  </div>
</template>

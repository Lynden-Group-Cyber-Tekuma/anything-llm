<script setup>
import { ref, onMounted, onUnmounted, provide, inject } from 'vue'
import { v4 } from 'uuid'
import System from '@/models/system'
import { useDropzone } from 'vue3-dropzone'
import DndIcon from './dnd-icon.png'
import Workspace from '@/models/workspace'
import showToast from '@/utils/toast'
import FileUploadWarningModal from './FileUploadWarningModal/index.vue'
import pluralize from 'pluralize'

export const REMOVE_ATTACHMENT_EVENT = 'ATTACHMENT_REMOVE'
export const CLEAR_ATTACHMENTS_EVENT = 'ATTACHMENT_CLEAR'
export const PASTE_ATTACHMENT_EVENT = 'ATTACHMENT_PASTED'
export const ATTACHMENTS_PROCESSING_EVENT = 'ATTACHMENTS_PROCESSING'
export const ATTACHMENTS_PROCESSED_EVENT = 'ATTACHMENTS_PROCESSED'
export const PARSED_FILE_ATTACHMENT_REMOVED_EVENT = 'PARSED_FILE_ATTACHMENT_REMOVED'

// DnDUploaderContext key
const DndUploaderContextKey = Symbol('DndUploaderContext')

/**
 * Convert image types into Base64 strings for requests.
 * @param {File} file
 * @returns {Promise<string>}
 */
async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = reader.result.split(',')[1]
      resolve(`data:${file.type};base64,${base64String}`)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}
</script>

<script>
// DnDFileUploaderProvider component
export const DnDFileUploaderProvider = {
  props: {
    workspace: Object,
    threadSlug: {
      type: String,
      default: null
    }
  },
  setup(props, { slots }) {
    const files = ref([])
    const ready = ref(false)
    const dragging = ref(false)
    const showWarningModal = ref(false)
    const isEmbedding = ref(false)
    const embedProgress = ref(0)
    const pendingFiles = ref([])
    const tokenCount = ref(0)
    const maxTokens = ref(Number.POSITIVE_INFINITY)

    onMounted(async () => {
      const status = await System.checkDocumentProcessorOnline()
      ready.value = status
    })

    /**
     * Handles the removal of a parsed file attachment from the uploader queue.
     * @param {CustomEvent} event
     */
    async function handleRemoveParsedFile(event) {
      const { document } = event.detail
      files.value = files.value.filter((prevFile) => prevFile.document.id !== document.id)
    }

    /**
     * Remove file from uploader queue.
     * @param {CustomEvent} event
     */
    async function handleRemove(event) {
      const { uid, document } = event.detail
      files.value = files.value.filter((prevFile) => prevFile.uid !== uid)
      if (!document?.location) return
      await Workspace.deleteAndUnembedFile(props.workspace.slug, document.location)
    }

    /**
     * Clear queue of attached files currently in prompt box
     */
    function resetAttachments() {
      files.value = []
    }

    /**
     * Turns files into attachments we can send as body request to backend
     * for a chat.
     * @returns {{name:string,mime:string,contentString:string}[]}
     */
    function parseAttachments() {
      return (
        files.value
          ?.filter((file) => file.type === 'attachment')
          ?.map((attachment) => {
            return {
              name: attachment.file.name,
              mime: attachment.file.type,
              contentString: attachment.contentString,
            }
          }) || []
      )
    }

    /**
     * Handle pasted attachments.
     * @param {CustomEvent} event
     */
    async function handlePastedAttachment(event) {
      const { files: pastedFiles = [] } = event.detail
      if (!pastedFiles.length) return
      const newAccepted = []
      for (const file of pastedFiles) {
        if (file.type.startsWith('image/')) {
          newAccepted.push({
            uid: v4(),
            file,
            contentString: await toBase64(file),
            status: 'success',
            error: null,
            type: 'attachment',
          })
        } else {
          newAccepted.push({
            uid: v4(),
            file,
            contentString: null,
            status: 'in_progress',
            error: null,
            type: 'upload',
          })
        }
      }
      files.value = [...files.value, ...newAccepted]
      embedEligibleAttachments(newAccepted)
    }

    /**
     * Handle dropped files.
     * @param {File[]} acceptedFiles
     */
    async function onDrop(acceptedFiles) {
      dragging.value = false

      const newAccepted = []
      for (const file of acceptedFiles) {
        if (file.type.startsWith('image/')) {
          newAccepted.push({
            uid: v4(),
            file,
            contentString: await toBase64(file),
            status: 'success',
            error: null,
            type: 'attachment',
          })
        } else {
          newAccepted.push({
            uid: v4(),
            file,
            contentString: null,
            status: 'in_progress',
            error: null,
            type: 'upload',
          })
        }
      }

      files.value = [...files.value, ...newAccepted]
      embedEligibleAttachments(newAccepted)
    }

    /**
     * Embeds attachments that are eligible for embedding - basically files that are not images.
     * @param {Array} newAttachments
     */
    async function embedEligibleAttachments(newAttachments = []) {
      window.dispatchEvent(new CustomEvent(ATTACHMENTS_PROCESSING_EVENT))
      const promises = []

      const { currentContextTokenCount, contextWindow } =
        await Workspace.getParsedFiles(props.workspace.slug, props.threadSlug)
      const workspaceContextWindow = contextWindow
        ? Math.floor(contextWindow * Workspace.maxContextWindowLimit)
        : Number.POSITIVE_INFINITY
      maxTokens.value = workspaceContextWindow

      let totalTokenCount = currentContextTokenCount
      let batchPendingFiles = []

      for (const attachment of newAttachments) {
        // Images/attachments are chat specific.
        if (attachment.type === 'attachment') continue

        const formData = new FormData()
        formData.append('file', attachment.file, attachment.file.name)
        formData.append('threadSlug', props.threadSlug || null)
        promises.push(
          Workspace.parseFile(props.workspace.slug, formData).then(
            async ({ response, data }) => {
              if (!response.ok) {
                const updates = {
                  status: 'failed',
                  error: data?.error ?? null,
                }
                files.value = files.value.map((prevFile) =>
                  prevFile.uid !== attachment.uid
                    ? prevFile
                    : { ...prevFile, ...updates }
                )
                return
              }
              // Will always be one file in the array
              const file = data.files[0]

              // Add token count for this file
              // and add it to the batch pending files
              totalTokenCount += file.tokenCountEstimate
              batchPendingFiles.push({
                attachment,
                parsedFileId: file.id,
                tokenCount: file.tokenCountEstimate,
              })

              if (totalTokenCount > workspaceContextWindow) {
                tokenCount.value = totalTokenCount
                pendingFiles.value = batchPendingFiles
                showWarningModal.value = true
                return
              }

              // File is within limits, keep in parsed files
              const result = { success: true, document: file }
              const updates = {
                status: result.success ? 'added_context' : 'failed',
                error: result.error ?? null,
                document: result.document,
              }

              files.value = files.value.map((prevFile) =>
                prevFile.uid !== attachment.uid
                  ? prevFile
                  : { ...prevFile, ...updates }
              )
            }
          )
        )
      }

      // Wait for all promises to resolve in some way before dispatching the event to unlock the send button
      Promise.all(promises).finally(() =>
        window.dispatchEvent(new CustomEvent(ATTACHMENTS_PROCESSED_EVENT))
      )
    }

    // Handle modal actions
    const handleCloseModal = async () => {
      if (!pendingFiles.value.length) return

      // Delete all files from this batch
      await Workspace.deleteParsedFiles(
        props.workspace.slug,
        pendingFiles.value.map((file) => file.parsedFileId)
      )

      // Remove all files from this batch from the UI
      files.value = files.value.filter(
        (prevFile) =>
          !pendingFiles.value.some((file) => file.attachment.uid === prevFile.uid)
      )
      showWarningModal.value = false
      pendingFiles.value = []
      tokenCount.value = 0
      window.dispatchEvent(new CustomEvent(ATTACHMENTS_PROCESSED_EVENT))
    }

    const handleContinueAnyway = async () => {
      if (!pendingFiles.value.length) return
      const results = pendingFiles.value.map((file) => ({
        success: true,
        document: { id: file.parsedFileId },
      }))

      const fileUpdates = pendingFiles.value.map((file, i) => ({
        uid: file.attachment.uid,
        updates: {
          status: results[i].success ? 'success' : 'failed',
          error: results[i].error ?? null,
          document: results[i].document,
        },
      }))

      files.value = files.value.map((prevFile) => {
        const update = fileUpdates.find((f) => f.uid === prevFile.uid)
        return update ? { ...prevFile, ...update.updates } : prevFile
      })
      showWarningModal.value = false
      pendingFiles.value = []
      tokenCount.value = 0
    }

    const handleEmbed = async () => {
      if (!pendingFiles.value.length) return
      isEmbedding.value = true
      embedProgress.value = 0

      // Embed all pending files
      let completed = 0
      const results = await Promise.all(
        pendingFiles.value.map((file) =>
          Workspace.embedParsedFile(props.workspace.slug, file.parsedFileId).then(
            (result) => {
              completed++
              embedProgress.value = completed
              return result
            }
          )
        )
      )

      // Update status for all files
      const fileUpdates = pendingFiles.value.map((file, i) => ({
        uid: file.attachment.uid,
        updates: {
          status: results[i].response.ok ? 'embedded' : 'failed',
          error: results[i].data?.error ?? null,
          document: results[i].data?.document,
        },
      }))

      files.value = files.value.map((prevFile) => {
        const update = fileUpdates.find((f) => f.uid === prevFile.uid)
        return update ? { ...prevFile, ...update.updates } : prevFile
      })
      showWarningModal.value = false
      pendingFiles.value = []
      tokenCount.value = 0
      isEmbedding.value = false
      window.dispatchEvent(new CustomEvent(ATTACHMENTS_PROCESSED_EVENT))
      showToast(
        `${pendingFiles.value.length} ${pluralize('file', pendingFiles.value.length)} embedded successfully`,
        'success'
      )
    }

    onMounted(() => {
      window.addEventListener(REMOVE_ATTACHMENT_EVENT, handleRemove)
      window.addEventListener(CLEAR_ATTACHMENTS_EVENT, resetAttachments)
      window.addEventListener(PASTE_ATTACHMENT_EVENT, handlePastedAttachment)
      window.addEventListener(
        PARSED_FILE_ATTACHMENT_REMOVED_EVENT,
        handleRemoveParsedFile
      )
    })

    onUnmounted(() => {
      window.removeEventListener(REMOVE_ATTACHMENT_EVENT, handleRemove)
      window.removeEventListener(CLEAR_ATTACHMENTS_EVENT, resetAttachments)
      window.removeEventListener(
        PARSED_FILE_ATTACHMENT_REMOVED_EVENT,
        handleRemoveParsedFile
      )
      window.removeEventListener(
        PASTE_ATTACHMENT_EVENT,
        handlePastedAttachment
      )
    })

    // Provide context
    provide(DndUploaderContextKey, {
      files,
      ready,
      dragging,
      setDragging: (value) => { dragging.value = value },
      onDrop,
      parseAttachments
    })

    return () => [
      h(FileUploadWarningModal, {
        show: showWarningModal.value,
        onClose: handleCloseModal,
        onContinue: handleContinueAnyway,
        onEmbed: handleEmbed,
        tokenCount: tokenCount.value,
        maxTokens: maxTokens.value,
        fileCount: pendingFiles.value.length,
        isEmbedding: isEmbedding.value,
        embedProgress: embedProgress.value,
      }),
      slots.default?.()
    ]
  }
}

// DnDFileUploaderWrapper component (consumer)
export default {
  setup(props, { slots }) {
    const context = inject(DndUploaderContextKey)
    if (!context) {
      console.error('DnDFileUploaderWrapper must be used within DnDFileUploaderProvider')
      return () => slots.default?.()
    }

    const { onDrop, ready, dragging, setDragging } = context

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      disabled: !ready.value,
      noClick: true,
      noKeyboard: true,
      onDragEnter: () => setDragging(true),
      onDragLeave: () => setDragging(false),
    })

    return () => h('div', {
      class: 'relative flex flex-col h-full w-full md:mt-0 mt-[40px] p-[1px]',
      ...getRootProps()
    }, [
      h('div', {
        hidden: !dragging.value,
        class: 'absolute top-0 w-full h-full bg-dark-text/90 light:bg-[#C2E7FE]/90 rounded-2xl border-[4px] border-white z-[9999]'
      }, [
        h('div', { class: 'w-full h-full flex justify-center items-center rounded-xl' }, [
          h('div', { class: 'flex flex-col gap-y-[14px] justify-center items-center' }, [
            h('img', {
              src: DndIcon,
              width: 69,
              height: 69,
              alt: 'Drag and drop icon'
            }),
            h('p', { class: 'text-white text-[24px] font-semibold' }, 'Add anything'),
            h('p', { class: 'text-white text-[16px] text-center' }, [
              'Drop a file or image here to attach it to your ',
              h('br'),
              'workspace auto-magically.'
            ])
          ])
        ])
      ]),
      h('input', {
        id: 'dnd-chat-file-uploader',
        ...getInputProps()
      }),
      slots.default?.()
    ])
  }
}
</script>

<script setup>
import { h } from 'vue'
</script>

<template>
  <slot />
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FolderOpen, Info } from '@phosphor-icons/vue'
import System from '@/models/system'
import showToast from '@/utils/toast'

const { t } = useI18n()
const loading = ref(false)
const vaultPath = ref('')
const selectedFiles = ref([])

const handleFolderPick = async (e) => {
  const files = Array.from(e.target.files)
  if (files.length === 0) return

  // Filter for .md files only
  const markdownFiles = files.filter((file) => file.name.endsWith('.md'))
  selectedFiles.value = markdownFiles

  // Set the folder path from the first file
  if (markdownFiles.length > 0) {
    const path = markdownFiles[0].webkitRelativePath.split('/')[0]
    vaultPath.value = path
  }
}

const handleSubmit = async (e) => {
  e.preventDefault()
  if (selectedFiles.value.length === 0) return

  try {
    loading.value = true
    showToast('Importing Obsidian vault - this may take a while.', 'info', {
      clear: true,
      autoClose: false,
    })

    // Read all files and prepare them for submission
    const fileContents = await Promise.all(
      selectedFiles.value.map(async (file) => {
        const content = await file.text()
        return {
          name: file.name,
          path: file.webkitRelativePath,
          content: content,
        }
      })
    )

    const { data, error } = await System.dataConnectors.obsidian.collect({
      files: fileContents,
    })

    if (!!error) {
      showToast(error, 'error', { clear: true })
      loading.value = false
      selectedFiles.value = []
      vaultPath.value = ''
      return
    }

    // Show results
    const successCount = data.processed
    const failCount = data.failed
    const totalCount = data.total

    if (successCount === totalCount) {
      showToast(
        `Successfully imported ${successCount} files from your vault!`,
        'success',
        { clear: true }
      )
    } else {
      showToast(
        `Imported ${successCount} files, ${failCount} failed`,
        'warning',
        { clear: true }
      )
    }

    loading.value = false
  } catch (e) {
    console.error(e)
    showToast(e.message, 'error', { clear: true })
    loading.value = false
  }
}
</script>

<template>
  <div class="flex w-full">
    <div class="flex flex-col w-full px-1 md:pb-6 pb-16">
      <form class="w-full" @submit="handleSubmit">
        <div class="w-full flex flex-col py-2">
          <div class="w-full flex flex-col gap-4">
            <div class="flex flex-col md:flex-row md:items-center gap-x-2 text-white mb-4 bg-blue-800/30 w-fit rounded-lg px-4 py-2">
              <div class="gap-x-2 flex items-center">
                <Info class="shrink-0" :size="25" />
                <p class="text-sm">
                  {{ t('connectors.obsidian.vault_warning') }}
                </p>
              </div>
            </div>

            <div class="flex flex-col">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white text-sm font-bold">
                  {{ t('connectors.obsidian.vault_location') }}
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.obsidian.vault_description') }}
                </p>
              </div>
              <div class="flex gap-x-2">
                <input
                  type="text"
                  v-model="vaultPath"
                  placeholder="/path/to/your/vault"
                  class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                  required
                  autocomplete="off"
                  spellcheck="false"
                  readonly
                />
                <label class="px-3 py-2 bg-theme-settings-input-bg border border-none rounded-lg text-white hover:bg-theme-settings-input-bg/80 cursor-pointer">
                  <FolderOpen :size="20" />
                  <input
                    type="file"
                    webkitdirectory
                    @change="handleFolderPick"
                    class="hidden"
                  />
                </label>
              </div>
              <template v-if="selectedFiles.length > 0">
                <p class="text-xs text-white mt-2 font-bold">
                  {{ t('connectors.obsidian.selected_files', { count: selectedFiles.length }) }}
                </p>

                <p
                  v-for="(file, i) in selectedFiles"
                  :key="i"
                  class="text-xs text-white mt-2"
                >
                  {{ file.webkitRelativePath }}
                </p>
              </template>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-y-2 w-full pr-10">
          <button
            type="submit"
            :disabled="loading || selectedFiles.length === 0"
            class="border-none mt-2 w-full justify-center px-4 py-2 rounded-lg text-dark-text light:text-white text-sm font-bold items-center flex gap-x-2 bg-theme-home-button-primary hover:bg-theme-home-button-primary-hover disabled:bg-theme-home-button-primary-hover disabled:cursor-not-allowed"
          >
            {{ loading ? t('connectors.obsidian.importing') : t('connectors.obsidian.import_vault') }}
          </button>
          <p v-if="loading" class="text-xs text-white/50">
            {{ t('connectors.obsidian.processing_time') }}
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

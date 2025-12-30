<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import System from '@/models/system'
import showToast from '@/utils/toast'

const { t } = useI18n()
const loading = ref(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  const form = new FormData(e.target)

  try {
    loading.value = true
    showToast('Fetching transcript for YouTube video.', 'info', {
      clear: true,
      autoClose: false,
    })

    const { data, error } = await System.dataConnectors.youtube.transcribe({
      url: form.get('url'),
    })

    if (!!error) {
      showToast(error, 'error', { clear: true })
      loading.value = false
      return
    }

    showToast(
      `${data.title} by ${data.author} transcription completed. Output folder is ${data.destination}.`,
      'success',
      { clear: true }
    )
    e.target.reset()
    loading.value = false
    return
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
            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white text-sm font-bold">
                  {{ t('connectors.youtube.URL') }}
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.youtube.URL_explained_start') }}
                  <a
                    href="https://support.google.com/youtube/answer/6373554"
                    rel="noreferrer"
                    target="_blank"
                    class="underline"
                    @click.stop
                  >
                    {{ t('connectors.youtube.URL_explained_link') }}
                  </a>
                  {{ t('connectors.youtube.URL_explained_end') }}
                </p>
              </div>
              <input
                type="url"
                name="url"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="https://youtube.com/watch?v=abc123"
                required
                autocomplete="off"
                spellcheck="false"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-y-2 w-full pr-10">
          <button
            type="submit"
            :disabled="loading"
            class="mt-2 w-full justify-center border-none px-4 py-2 rounded-lg text-dark-text light:text-white text-sm font-bold items-center flex gap-x-2 bg-theme-home-button-primary hover:bg-theme-home-button-primary-hover disabled:bg-theme-home-button-primary-hover disabled:cursor-not-allowed"
          >
            {{ loading ? 'Collecting transcript...' : 'Collect transcript' }}
          </button>
          <p v-if="loading" class="text-xs text-theme-text-secondary max-w-sm">
            {{ t('connectors.youtube.task_explained') }}
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

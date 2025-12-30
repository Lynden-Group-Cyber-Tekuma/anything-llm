<script setup>
import { ref } from 'vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { Info } from '@phosphor-icons/vue'

const loading = ref(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  const form = new FormData(e.target)

  try {
    loading.value = true
    showToast(
      'Fetching documents from Paperless-ngx - this may take a while.',
      'info',
      { clear: true, autoClose: false }
    )

    const { data, error } = await System.dataConnectors.paperlessNgx.collect({
      baseUrl: form.get('baseUrl'),
      apiToken: form.get('apiToken'),
    })

    if (!!error) {
      showToast(error, 'error', { clear: true })
      loading.value = false
      return
    }

    showToast(
      `Successfully imported ${data.files} documents from Paperless-ngx. Output folder is ${data.destination}.`,
      'success',
      { clear: true }
    )
    e.target.reset()
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
            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white text-sm font-bold">
                  Base URL
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  The URL where your Paperless-ngx instance is running (e.g.,
                  http://localhost:8000)
                </p>
              </div>
              <input
                type="url"
                name="baseUrl"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="http://localhost:8000"
                required
                autocomplete="off"
                spellcheck="false"
              />
            </div>

            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white text-sm font-bold flex gap-x-2 items-center">
                  <p class="font-bold text-white">API Token</p>
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  Your Paperless-ngx API token. You can find this under
                  'My Profile' and then 'API Auth Token'.
                </p>
              </div>
              <input
                type="password"
                name="apiToken"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="Enter your API token"
                required
                autocomplete="off"
                spellcheck="false"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-y-2 w-full pr-10">
          <div class="flex flex-col md:flex-row md:items-center gap-x-2 text-white mb-4 bg-blue-800/30 w-fit rounded-lg px-4 py-2">
            <div class="gap-x-2 flex items-center">
              <Info class="shrink-0" :size="25" />
              <p class="text-sm">
                Make sure your Paperless-ngx instance is running and
                accessible from this machine.
              </p>
            </div>
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="mt-2 w-full justify-center border-none px-4 py-2 rounded-lg text-dark-text light:text-white text-sm font-bold items-center flex gap-x-2 bg-theme-home-button-primary hover:bg-theme-home-button-primary-hover disabled:bg-theme-home-button-primary-hover disabled:cursor-not-allowed"
          >
            {{ loading ? 'Importing documents...' : 'Submit' }}
          </button>
          <p v-if="loading" class="text-xs text-white/50">
            Once complete, all documents will be available for embedding
            into workspaces.
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

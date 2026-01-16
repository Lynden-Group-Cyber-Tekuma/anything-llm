<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import System from '@/models/system'
import showToast from '@/utils/toast'
import pluralize from 'pluralize'

const { t } = useI18n()
const loading = ref(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  const form = new FormData(e.target)

  try {
    loading.value = true
    showToast('Scraping website - this may take a while.', 'info', {
      clear: true,
      autoClose: false,
    })

    const { data, error } = await System.dataConnectors.websiteDepth.scrape({
      url: form.get('url'),
      depth: parseInt(form.get('depth')),
      maxLinks: parseInt(form.get('maxLinks')),
    })

    if (!!error) {
      showToast(error, 'error', { clear: true })
      loading.value = false
      return
    }

    showToast(
      `Successfully scraped ${data.length} ${pluralize(
        'page',
        data.length
      )}!`,
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
                  {{ t('connectors.website-depth.URL') }}
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.website-depth.URL_explained') }}
                </p>
              </div>
              <input
                type="url"
                name="url"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="https://example.com"
                required
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white text-sm font-bold">
                  {{ t('connectors.website-depth.depth') }}
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.website-depth.depth_explained') }}
                </p>
              </div>
              <input
                type="number"
                name="depth"
                min="1"
                max="5"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                required
                value="1"
              />
            </div>
            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white text-sm font-bold">
                  {{ t('connectors.website-depth.max_pages') }}
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.website-depth.max_pages_explained') }}
                </p>
              </div>
              <input
                type="number"
                name="maxLinks"
                min="1"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                required
                value="20"
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
            {{ loading ? 'Scraping website...' : 'Submit' }}
          </button>
          <p v-if="loading" class="text-xs text-theme-text-secondary">
            {{ t('connectors.website-depth.task_explained') }}
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { PhWarning } from '@phosphor-icons/vue'

const { t } = useI18n()
const loading = ref(false)
const accessType = ref('username')
const isCloud = ref(true)
const showTooltip = ref(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  const form = new FormData(e.target)

  try {
    loading.value = true
    showToast(
      'Fetching all pages for Confluence space - this may take a while.',
      'info',
      {
        clear: true,
        autoClose: false,
      }
    )
    const { data, error } = await System.dataConnectors.confluence.collect({
      baseUrl: form.get('baseUrl'),
      spaceKey: form.get('spaceKey'),
      username: form.get('username'),
      accessToken: form.get('accessToken'),
      cloud: form.get('isCloud') === 'true',
      personalAccessToken: form.get('personalAccessToken'),
      bypassSSL: form.get('bypassSSL') === 'true',
    })

    if (!!error) {
      showToast(error, 'error', { clear: true })
      loading.value = false
      return
    }

    showToast(
      `Pages collected from Confluence space ${data.spaceKey}. Output folder is ${data.destination}.`,
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
                <label class="text-white text-sm font-bold flex gap-x-2 items-center">
                  <p class="font-bold text-theme-text-primary">
                    {{ t('connectors.confluence.deployment_type') }}
                  </p>
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.confluence.deployment_type_explained') }}
                </p>
              </div>
              <select
                name="isCloud"
                v-model="isCloud"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                required
                autocomplete="off"
                spellcheck="false"
              >
                <option :value="true">Atlassian Cloud</option>
                <option :value="false">Self-hosted</option>
              </select>
            </div>

            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white text-sm font-bold flex gap-x-2 items-center">
                  <p class="font-bold text-white">
                    {{ t('connectors.confluence.base_url') }}
                  </p>
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.confluence.base_url_explained') }}
                </p>
              </div>
              <input
                type="url"
                name="baseUrl"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="eg: https://example.atlassian.net, http://localhost:8211, etc..."
                required
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white text-sm font-bold">
                  {{ t('connectors.confluence.space_key') }}
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.confluence.space_key_explained') }}
                </p>
              </div>
              <input
                type="text"
                name="spaceKey"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="eg: ~7120208c08555d52224113949698b933a3bb56"
                required
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white text-sm font-bold">
                  {{ t('connectors.confluence.auth_type') }}
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.confluence.auth_type_explained') }}
                </p>
              </div>
              <select
                name="accessType"
                v-model="accessType"
                class="border-none bg-theme-settings-input-bg w-fit mt-2 px-4 border-gray-500 text-white text-sm rounded-lg block py-2"
              >
                <option value="username">
                  {{ t('connectors.confluence.auth_type_username') }}
                </option>
                <option value="personalToken">
                  {{ t('connectors.confluence.auth_type_personal') }}
                </option>
              </select>
            </div>
            <template v-if="accessType === 'username'">
              <div class="flex flex-col pr-10">
                <div class="flex flex-col gap-y-1 mb-4">
                  <label class="text-white text-sm font-bold">
                    {{ t('connectors.confluence.username') }}
                  </label>
                  <p class="text-xs font-normal text-theme-text-secondary">
                    {{ t('connectors.confluence.username_explained') }}
                  </p>
                </div>
                <input
                  type="text"
                  name="username"
                  class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                  placeholder="jdoe@example.com"
                  required
                  autocomplete="off"
                  spellcheck="false"
                />
              </div>
              <div class="flex flex-col pr-10">
                <div class="flex flex-col gap-y-1 mb-4">
                  <label class="text-white text-sm font-bold flex gap-x-2 items-center">
                    <p class="font-bold text-white">
                      {{ t('connectors.confluence.token') }}
                    </p>
                    <div class="relative inline-block">
                      <Warning
                        :size="14"
                        class="ml-1 text-orange-500 cursor-pointer"
                        @mouseenter="showTooltip = true"
                        @mouseleave="showTooltip = false"
                      />
                      <div
                        v-if="showTooltip"
                        class="absolute left-0 top-6 z-99 max-w-xs bg-theme-bg-secondary border border-theme-modal-border rounded-lg p-3 shadow-lg"
                      >
                        <p class="text-sm text-white">
                          {{ t('connectors.confluence.token_explained_start') }}
                          <a
                            href="https://id.atlassian.com/manage-profile/security/api-tokens"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="underline"
                            @click.stop
                          >
                            {{ t('connectors.confluence.token_explained_link') }}
                          </a>
                          .
                        </p>
                      </div>
                    </div>
                  </label>
                  <p class="text-xs font-normal text-theme-text-secondary">
                    {{ t('connectors.confluence.token_desc') }}
                  </p>
                </div>
                <input
                  type="password"
                  name="accessToken"
                  class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                  placeholder="abcd1234"
                  required
                  autocomplete="off"
                  spellcheck="false"
                />
              </div>
            </template>
            <template v-if="accessType === 'personalToken'">
              <div class="flex flex-col pr-10">
                <div class="flex flex-col gap-y-1 mb-4">
                  <label class="text-white text-sm font-bold">
                    {{ t('connectors.confluence.pat_token') }}
                  </label>
                  <p class="text-xs font-normal text-theme-text-secondary">
                    {{ t('connectors.confluence.pat_token_explained') }}
                  </p>
                </div>
                <input
                  type="password"
                  name="personalAccessToken"
                  class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                  placeholder="abcd1234"
                  required
                  autocomplete="off"
                  spellcheck="false"
                />
              </div>
            </template>
          </div>
        </div>

        <div v-if="!isCloud" class="w-full flex flex-col py-2">
          <div class="w-full flex flex-col gap-4">
            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white text-sm font-bold flex gap-x-2 items-center">
                  <input
                    type="checkbox"
                    name="bypassSSL"
                    class="mr-2"
                    value="true"
                  />
                  <p class="font-bold text-theme-text-primary">
                    {{ t('connectors.confluence.bypass_ssl') }}
                  </p>
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.confluence.bypass_ssl_explained') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-y-2 w-full pr-10">
          <button
            type="submit"
            :disabled="loading"
            class="mt-2 w-full justify-center border-none px-4 py-2 rounded-lg text-dark-text light:text-white text-sm font-bold items-center flex gap-x-2 bg-theme-home-button-primary hover:bg-theme-home-button-primary-hover disabled:bg-theme-home-button-primary-hover disabled:cursor-not-allowed"
          >
            {{ loading ? 'Collecting pages...' : 'Submit' }}
          </button>
          <p v-if="loading" class="text-xs text-theme-text-secondary">
            {{ t('connectors.confluence.task_explained') }}
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

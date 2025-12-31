<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar />
    <div
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
    >
      <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
        <div class="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
          <div class="items-center flex gap-x-4">
            <p class="text-lg leading-6 font-bold text-theme-text-primary">
              Browser Extension API Keys
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-theme-text-secondary mt-2">
            Manage API keys for browser extensions connecting to your
            AnythingLLM instance.
          </p>
        </div>
        <div class="w-full justify-end flex">
          <CTAButton
            @click="openModal"
            class="mt-3 mr-0 mb-4 md:-mb-14 z-10"
          >
            <PlusCircle class="h-4 w-4" weight="bold" />
            Generate New API Key
          </CTAButton>
        </div>
        <div class="overflow-x-auto mt-6">
          <Skeleton
            v-if="loading"
            height="80vh"
            width="100%"
            highlightColor="var(--theme-bg-primary)"
            baseColor="var(--theme-bg-secondary)"
            :count="1"
            class="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm"
            containerClass="flex w-full"
          />
          <div v-else-if="error" class="text-red-500 mt-6">Error: {{ error }}</div>
          <table
            v-else
            class="w-full text-xs text-left rounded-lg min-w-[640px] border-spacing-0 md:mt-6 mt-0"
          >
            <thead class="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
              <tr>
                <th scope="col" class="px-6 py-2 rounded-tl-lg">
                  Extension Connection String
                </th>
                <th v-if="isMultiUser" scope="col" class="px-6 py-2">
                  Created By
                </th>
                <th scope="col" class="px-6 py-2">
                  Created At
                </th>
                <th scope="col" class="px-6 py-2 rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-if="apiKeys.length === 0"
                class="bg-transparent text-theme-text-secondary text-sm font-medium"
              >
                <td :colspan="isMultiUser ? '4' : '3'" class="px-6 py-4 text-center">
                  No API keys found
                </td>
              </tr>
              <BrowserExtensionApiKeyRow
                v-for="apiKey in apiKeys"
                :key="apiKey.id"
                :apiKey="apiKey"
                :connectionString="`${fullApiUrl()}|${apiKey.key}`"
                :isMultiUser="isMultiUser"
                @remove="removeApiKey"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <ModalWrapper :isOpen="isOpen">
      <NewBrowserExtensionApiKeyModal
        @close="closeModal"
        @success="fetchExistingKeys"
        :isMultiUser="isMultiUser"
      />
    </ModalWrapper>
    <Tooltip
      id="auto-connection"
      place="bottom"
      :delayShow="300"
      class="allm-tooltip !allm-text-xs"
    />
    <Tooltip
      id="copy-connection-text"
      place="bottom"
      :delayShow="300"
      class="allm-tooltip !allm-text-xs"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { isMobile } from 'react-device-detect'
import { PhPlusCircle } from '@phosphor-icons/vue'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import Skeleton from 'vue-loading-skeleton'
import BrowserExtensionApiKey from '@/models/browserExtensionApiKey'
import BrowserExtensionApiKeyRow from './BrowserExtensionApiKeyRow/index.vue'
import CTAButton from '@/components/lib/CTAButton/index.vue'
import NewBrowserExtensionApiKeyModal from './NewBrowserExtensionApiKeyModal/index.vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import { useModal } from '@/hooks/useModal'
import { fullApiUrl } from '@/utils/constants'
import { Tooltip } from 'react-tooltip'

const loading = ref(true)
const apiKeys = ref([])
const error = ref(null)
const { isOpen, openModal, closeModal } = useModal()
const isMultiUser = ref(false)

const fetchExistingKeys = async () => {
  const result = await BrowserExtensionApiKey.getAll()
  if (result.success) {
    apiKeys.value = result.apiKeys
    isMultiUser.value = result.apiKeys.some((key) => key.user !== null)
  } else {
    error.value = result.error || 'Failed to fetch API keys'
  }
  loading.value = false
}

onMounted(() => {
  fetchExistingKeys()
})

const removeApiKey = (id) => {
  apiKeys.value = apiKeys.value.filter((apiKey) => apiKey.id !== id)
}
</script>

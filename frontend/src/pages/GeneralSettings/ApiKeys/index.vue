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
              {{ t('api.title') }}
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-theme-text-secondary mt-2">
            {{ t('api.description') }}
          </p>
          <a
            :href="paths.apiDocs()"
            target="_blank"
            rel="noreferrer"
            class="text-xs leading-[18px] font-base text-blue-300 light:text-blue-500 hover:underline mt-1"
          >
            {{ t('api.link') }} &rarr;
          </a>
        </div>
        <div class="w-full justify-end flex">
          <CTAButton
            @click="openModal"
            class="mt-3 mr-0 mb-4 md:-mb-14 z-10"
          >
            <PlusCircle class="h-4 w-4" weight="bold" />
            {{ t('api.generate') }}
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
          <table
            v-else
            class="w-full text-xs text-left rounded-lg min-w-[640px] border-spacing-0"
          >
            <thead class="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
              <tr>
                <th scope="col" class="px-6 py-3 rounded-tl-lg">
                  {{ t('api.table.key') }}
                </th>
                <th scope="col" class="px-6 py-3">
                  {{ t('api.table.by') }}
                </th>
                <th scope="col" class="px-6 py-3">
                  {{ t('api.table.created') }}
                </th>
                <th scope="col" class="px-6 py-3 rounded-tr-lg">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-if="apiKeys.length === 0"
                class="bg-transparent text-theme-text-secondary text-sm font-medium"
              >
                <td colspan="4" class="px-6 py-4 text-center">
                  No API keys found
                </td>
              </tr>
              <ApiKeyRow
                v-for="apiKey in apiKeys"
                :key="apiKey.id"
                :apiKey="apiKey"
                @remove="removeApiKey"
              />
            </tbody>
          </table>
        </div>
      </div>
      <ModalWrapper :isOpen="isOpen">
        <NewApiKeyModal
          @close="closeModal"
          @success="fetchExistingKeys"
        />
      </ModalWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobile } from 'react-device-detect'
import { PlusCircle } from '@phosphor-icons/vue'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import Skeleton from 'vue-loading-skeleton'
import Admin from '@/models/admin'
import ApiKeyRow from './ApiKeyRow/index.vue'
import NewApiKeyModal from './NewApiKeyModal/index.vue'
import paths from '@/utils/paths'
import { userFromStorage } from '@/utils/request'
import System from '@/models/system'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import { useModal } from '@/hooks/useModal'
import CTAButton from '@/components/lib/CTAButton/index.vue'

const { t } = useI18n()
const { isOpen, openModal, closeModal } = useModal()
const loading = ref(true)
const apiKeys = ref([])

const fetchExistingKeys = async () => {
  const user = userFromStorage()
  const Model = !!user ? Admin : System
  const { apiKeys: foundKeys } = await Model.getApiKeys()
  apiKeys.value = foundKeys
  loading.value = false
}

onMounted(() => {
  fetchExistingKeys()
})

const removeApiKey = (id) => {
  apiKeys.value = apiKeys.value.filter((apiKey) => apiKey.id !== id)
}
</script>

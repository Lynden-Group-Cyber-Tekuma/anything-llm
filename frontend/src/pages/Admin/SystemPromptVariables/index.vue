<script setup>
import { ref, onMounted } from 'vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { PhPlus } from '@phosphor-icons/vue'
import Sidebar from '@/components/SettingsSidebar'
import { isMobile } from 'react-device-detect'
import CTAButton from '@/components/lib/CTAButton/index.vue'
import VariableRow from './VariableRow/index.vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import AddVariableModal from './AddVariableModal/index.vue'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const variables = ref([])
const loading = ref(true)
const isOpen = ref(false)

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const fetchVariables = async () => {
  loading.value = true
  try {
    const { variables: vars } = await System.promptVariables.getAll()
    variables.value = vars || []
  } catch (error) {
    console.error('Error fetching variables:', error)
    showToast('No variables found', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVariables()
})
</script>

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
              System Prompt Variables
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-theme-text-secondary">
            System prompt variables are used to store configuration values
            that can be referenced in your system prompt to enable dynamic
            content in your prompts.
          </p>
        </div>

        <div class="w-full justify-end flex">
          <CTAButton
            @click="openModal"
            class-name="mt-3 mr-0 mb-4 md:-mb-6 z-10"
          >
            <Plus class="h-4 w-4" weight="bold" /> Add Variable
          </CTAButton>
        </div>

        <div class="overflow-x-auto">
          <Skeleton
            v-if="loading"
            height="80vh"
            width="100%"
            highlightColor="var(--theme-bg-primary)"
            baseColor="var(--theme-bg-secondary)"
            :count="1"
            class="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-8"
            containerClassName="flex w-full"
          />
          <div
            v-else-if="variables.length === 0"
            class="text-center py-4 text-theme-text-secondary"
          >
            No variables found
          </div>
          <table
            v-else
            class="w-full text-sm text-left rounded-lg min-w-[640px] border-spacing-0"
          >
            <thead class="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
              <tr>
                <th scope="col" class="px-4 py-2 rounded-tl-lg">
                  Key
                </th>
                <th scope="col" class="px-4 py-2">
                  Value
                </th>
                <th scope="col" class="px-4 py-2">
                  Description
                </th>
                <th scope="col" class="px-4 py-2">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              <VariableRow
                v-for="variable in variables"
                :key="variable.id"
                :variable="variable"
                :on-refresh="fetchVariables"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ModalWrapper :is-open="isOpen">
      <AddVariableModal :close-modal="closeModal" :on-refresh="fetchVariables" />
    </ModalWrapper>
  </div>
</template>

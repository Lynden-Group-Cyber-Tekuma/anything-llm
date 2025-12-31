<script setup>
import { ref, onMounted } from 'vue'
import { isMobile } from 'react-device-detect'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { BookOpen } from '@phosphor-icons/vue'
import Admin from '@/models/admin'
import Sidebar from '@/components/SettingsSidebar'
import WorkspaceRow from './WorkspaceRow/index.vue'
import NewWorkspaceModal from './NewWorkspaceModal/index.vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import CTAButton from '@/components/lib/CTAButton/index.vue'

const isOpen = ref(false)
const loading = ref(true)
const users = ref([])
const workspaces = ref([])

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const fetchData = async () => {
  const _users = await Admin.users()
  const _workspaces = await Admin.workspaces()
  users.value = _users
  workspaces.value = _workspaces
  loading.value = false
}

onMounted(() => {
  fetchData()
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
              Instance Workspaces
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-theme-text-secondary">
            These are all the workspaces that exist on this instance. Removing
            a workspace will delete all of its associated chats and settings.
          </p>
        </div>
        <div class="w-full justify-end flex">
          <CTAButton
            @click="openModal"
            class-name="mt-3 mr-0 mb-4 md:-mb-14 z-10"
          >
            <BookOpen class="h-4 w-4" weight="bold" /> New Workspace
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
            class="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
            containerClassName="flex w-full"
          />
          <table
            v-else
            class="w-full text-xs text-left rounded-lg mt-6 min-w-[640px] border-spacing-0"
          >
            <thead class="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
              <tr>
                <th scope="col" class="px-6 py-3 rounded-tl-lg">
                  Name
                </th>
                <th scope="col" class="px-6 py-3">
                  Link
                </th>
                <th scope="col" class="px-6 py-3">
                  Users
                </th>
                <th scope="col" class="px-6 py-3">
                  Created On
                </th>
                <th scope="col" class="px-6 py-3 rounded-tr-lg">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              <WorkspaceRow
                v-for="workspace in workspaces"
                :key="workspace.id"
                :workspace="workspace"
                :users="users"
              />
            </tbody>
          </table>
        </div>
      </div>
      <ModalWrapper :is-open="isOpen">
        <NewWorkspaceModal :close-modal="closeModal" />
      </ModalWrapper>
    </div>
  </div>
</template>

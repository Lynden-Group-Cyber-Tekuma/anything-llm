<script setup>
import { ref, onMounted, computed } from 'vue'
import { isMobile } from 'react-device-detect'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { UserPlus } from '@phosphor-icons/vue'
import Admin from '@/models/admin'
import Sidebar from '@/components/SettingsSidebar'
import UserRow from './UserRow/index.vue'
import NewUserModal from './NewUserModal/index.vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import CTAButton from '@/components/lib/CTAButton/index.vue'
import { userFromStorage } from '@/utils/request'

const isOpen = ref(false)
const loading = ref(true)
const users = ref([])
const currUser = computed(() => userFromStorage())

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const fetchUsers = async () => {
  const _users = await Admin.users()
  users.value = _users
  loading.value = false
}

onMounted(() => {
  fetchUsers()
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
              Users
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-theme-text-secondary">
            These are all the accounts which have an account on this instance.
            Removing an account will instantly remove their access to this
            instance.
          </p>
        </div>
        <div class="w-full justify-end flex">
          <CTAButton
            @click="openModal"
            class-name="mt-3 mr-0 mb-4 md:-mb-6 z-10"
          >
            <UserPlus class="h-4 w-4" weight="bold" /> Add user
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
          <table
            v-else
            class="w-full text-xs text-left rounded-lg min-w-[640px] border-spacing-0"
          >
            <thead class="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
              <tr>
                <th scope="col" class="px-6 py-3 rounded-tl-lg">
                  Username
                </th>
                <th scope="col" class="px-6 py-3">
                  Role
                </th>
                <th scope="col" class="px-6 py-3">
                  Date Added
                </th>
                <th scope="col" class="px-6 py-3 rounded-tr-lg">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              <UserRow
                v-for="user in users"
                :key="user.id"
                :curr-user="currUser"
                :user="user"
              />
            </tbody>
          </table>
        </div>
      </div>
      <ModalWrapper :is-open="isOpen">
        <NewUserModal :close-modal="closeModal" />
      </ModalWrapper>
    </div>
  </div>
</template>

<script>
const ROLE_HINT = {
  default: [
    'Can only send chats with workspaces they are added to by admin or managers.',
    'Cannot modify any settings at all.'
  ],
  manager: [
    'Can view, create, and delete any workspaces and modify workspace-specific settings.',
    'Can create, update and invite new users to the instance.',
    'Cannot modify LLM, vectorDB, embedding, or other connections.'
  ],
  admin: [
    'Highest user level privilege.',
    'Can see and do everything across the system.'
  ]
}

export { ROLE_HINT }
</script>

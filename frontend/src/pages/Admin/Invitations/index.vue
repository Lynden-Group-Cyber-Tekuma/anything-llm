<script setup>
import { ref, onMounted } from 'vue'
import { isMobile } from 'react-device-detect'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { PhEnvelopeSimple } from '@phosphor-icons/vue'
import Admin from '@/models/admin'
import Sidebar from '@/components/SettingsSidebar'
import InviteRow from './InviteRow/index.vue'
import NewInviteModal from './NewInviteModal/index.vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import CTAButton from '@/components/lib/CTAButton/index.vue'

const loading = ref(true)
const invites = ref([])
const isOpen = ref(false)

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const fetchInvites = async () => {
  const _invites = await Admin.invites()
  invites.value = _invites
  loading.value = false
}

onMounted(() => {
  fetchInvites()
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
              Invitations
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-theme-text-secondary mt-2">
            Create invitation links for people in your organization to accept
            and sign up with. Invitations can only be used by a single user.
          </p>
        </div>
        <div class="w-full justify-end flex">
          <CTAButton
            @click="openModal"
            class-name="mt-3 mr-0 mb-4 md:-mb-12 z-10"
          >
            <EnvelopeSimple class="h-4 w-4" weight="bold" /> Create Invite
            Link
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
            containerClassName="flex w-full"
          />
          <table
            v-else
            class="w-full text-xs text-left rounded-lg min-w-[640px] border-spacing-0"
          >
            <thead class="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
              <tr>
                <th scope="col" class="px-6 py-3 rounded-tl-lg">
                  Status
                </th>
                <th scope="col" class="px-6 py-3">
                  Accepted By
                </th>
                <th scope="col" class="px-6 py-3">
                  Created By
                </th>
                <th scope="col" class="px-6 py-3">
                  Created
                </th>
                <th scope="col" class="px-6 py-3 rounded-tr-lg">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-if="invites.length === 0"
                class="bg-transparent text-theme-text-secondary text-sm font-medium"
              >
                <td colspan="5" class="px-6 py-4 text-center">
                  No invitations found
                </td>
              </tr>
              <InviteRow
                v-for="invite in invites"
                :key="invite.id"
                :invite="invite"
              />
            </tbody>
          </table>
        </div>
      </div>
      <ModalWrapper :is-open="isOpen">
        <NewInviteModal :close-modal="closeModal" :on-success="fetchInvites" />
      </ModalWrapper>
    </div>
  </div>
</template>

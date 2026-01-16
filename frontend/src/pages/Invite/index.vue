<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { FullScreenLoader } from '@/components/Preloader'
import Invite from '@/models/invite'
import NewUserModal from './NewUserModal/index.vue'
import ModalWrapper from '@/components/ModalWrapper'

const route = useRoute()
const code = route.params.code
const result = ref({
  status: 'loading',
  message: null,
})

onMounted(async () => {
  if (!code) {
    result.value = {
      status: 'invalid',
      message: 'No invite code provided.',
    }
    return
  }
  const { invite, error } = await Invite.checkInvite(code)
  result.value = {
    status: invite ? 'valid' : 'invalid',
    message: error,
  }
})
</script>

<template>
  <div v-if="result.status === 'loading'" class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <FullScreenLoader />
  </div>
  <div v-else-if="result.status === 'invalid'" class="w-screen h-screen overflow-hidden bg-theme-bg-container flex items-center justify-center">
    <p class="text-red-400 text-lg">{{ result.message }}</p>
  </div>
  <div v-else class="w-screen h-screen overflow-hidden bg-theme-bg-container flex items-center justify-center">
    <ModalWrapper :is-open="true">
      <NewUserModal />
    </ModalWrapper>
  </div>
</template>

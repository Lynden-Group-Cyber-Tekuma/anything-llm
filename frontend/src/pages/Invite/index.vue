<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Invite from '@/models/invite'
import paths from '@/utils/paths'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref(null)
const inviteData = ref(null)

onMounted(async () => {
  try {
    const code = route.params.code
    const { invite, error: err } = await Invite.checkInvite(code)

    if (err) {
      error.value = err
    } else {
      inviteData.value = invite
    }
  } catch (e) {
    error.value = 'Failed to verify invite'
  } finally {
    loading.value = false
  }
})

async function acceptInvite() {
  // Handle invite acceptance
  router.push(paths.home())
}
</script>

<template>
  <div class="min-h-screen bg-theme-bg-primary flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div v-if="loading" class="text-center">
        <div class="h-16 w-16 mx-auto animate-spin rounded-full border-4 border-solid border-primary-button border-t-transparent" />
        <p class="mt-4 text-theme-text-secondary">Verifying invite...</p>
      </div>

      <div v-else-if="error" class="bg-theme-bg-secondary rounded-lg p-8 text-center">
        <h1 class="text-xl font-semibold text-red-500 mb-4">Invalid Invite</h1>
        <p class="text-theme-text-secondary mb-6">{{ error }}</p>
        <router-link
          to="/login"
          class="inline-block px-6 py-2 bg-primary-button text-white rounded hover:bg-primary-button/80"
        >
          Go to Login
        </router-link>
      </div>

      <div v-else class="bg-theme-bg-secondary rounded-lg p-8">
        <h1 class="text-xl font-semibold text-theme-text-primary text-center mb-4">
          You've Been Invited
        </h1>
        <p class="text-theme-text-secondary text-center mb-6">
          You have been invited to join AnythingLLM. Click below to accept the invitation.
        </p>
        <button
          @click="acceptInvite"
          class="w-full px-6 py-3 bg-primary-button text-white rounded hover:bg-primary-button/80"
        >
          Accept Invitation
        </button>
      </div>
    </div>
  </div>
</template>

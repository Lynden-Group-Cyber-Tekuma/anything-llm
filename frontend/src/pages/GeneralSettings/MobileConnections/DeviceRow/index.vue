<template>
  <tr class="bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10">
    <td scope="row" class="px-6 whitespace-nowrap">
      <div class="flex items-center gap-x-2">
        <AppleLogo
          v-if="device.deviceOs === 'ios'"
          weight="fill"
          :size="16"
          class="fill-theme-text-primary"
        />
        <BugDroid
          v-else
          weight="fill"
          :size="16"
          class="fill-theme-text-primary"
        />
        <span class="text-sm">{{ device.deviceName }}</span>
      </div>
    </td>
    <td class="px-6">
      <div class="flex items-center gap-x-2">
        {{ moment(device.createdAt).format('lll') }}
        <div v-if="device.user" class="flex items-center gap-x-1">
          <span class="text-xs text-theme-text-secondary">by</span>
          <RouterLink
            :to="paths.settings.users()"
            class="text-xs text-theme-text-secondary hover:underline hover:text-cta-button"
          >
            {{ device.user.username }}
          </RouterLink>
        </div>
      </div>
    </td>
    <td class="px-6 flex items-center gap-x-6 h-full mt-1">
      <button
        v-if="status"
        @click="handleDeny"
        class="border-none flex items-center justify-center text-xs font-medium text-white/80 light:text-black/80 rounded-lg p-1 hover:bg-white hover:light:bg-red-50 hover:bg-opacity-10"
      >
        Revoke
      </button>
      <template v-else>
        <button
          @click="handleApprove"
          class="border-none flex items-center justify-center text-xs font-medium text-white/80 light:text-black/80 rounded-lg p-1 hover:bg-white hover:bg-opacity-10 hover:light:bg-green-50 hover:light:text-green-500 hover:text-green-300"
        >
          Approve Access
        </button>
        <button
          @click="handleDeny"
          class="border-none flex items-center justify-center text-xs font-medium text-white/80 light:text-black/80 rounded-lg p-1 hover:bg-white hover:bg-opacity-10 hover:light:bg-red-50 hover:light:text-red-500 hover:text-red-300"
        >
          Deny
        </button>
      </template>
    </td>
  </tr>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import showToast from '@/utils/toast'
import MobileConnection from '@/models/mobile'
import moment from 'moment'
import { PhBugDroid, PhAppleLogo } from '@phosphor-icons/vue'
import paths from '@/utils/paths'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['remove'])

const status = ref(props.device.approved)

const handleApprove = async () => {
  await MobileConnection.updateDevice(props.device.id, { approved: true })
  showToast('Device access granted', 'info')
  status.value = true
}

const handleDeny = async () => {
  await MobileConnection.deleteDevice(props.device.id)
  showToast('Device access denied', 'info')
  status.value = false
  emit('remove', props.device.id)
}
</script>

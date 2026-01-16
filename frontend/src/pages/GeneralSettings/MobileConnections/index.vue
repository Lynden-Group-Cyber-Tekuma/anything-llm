<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex md:mt-0 mt-6">
    <Sidebar />
    <div
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
    >
      <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
        <div class="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
          <div class="items-center flex gap-x-4">
            <p class="text-lg leading-6 font-bold text-theme-text-primary">
              Connected Mobile Devices
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-theme-text-secondary mt-2">
            These are the devices that are connected to your desktop
            application to sync chats, workspaces, and more.
          </p>
        </div>
        <div class="w-full justify-end flex">
          <CTAButton
            @click="openModal"
            class="mt-3 mr-0 mb-4 md:-mb-14 z-10"
          >
            <QrCode class="h-4 w-4" weight="bold" /> Register New Device
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
                <th scope="col" class="px-6 py-3">
                  Device Name
                </th>
                <th scope="col" class="px-6 py-3">
                  Registered
                </th>
                <th scope="col" class="px-6 py-3">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-if="devices.length === 0"
                class="bg-transparent text-theme-text-secondary text-sm font-medium"
              >
                <td colspan="4" class="px-6 py-4 text-center">
                  No devices found
                </td>
              </tr>
              <DeviceRow
                v-for="device in devices"
                :key="device.id"
                :device="device"
                @remove="removeDevice"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <ConnectionModal :isOpen="isOpen" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import Skeleton from 'vue-loading-skeleton'
import { isMobile } from 'react-device-detect'
import { PhQrCode } from '@phosphor-icons/vue'
import { useModal } from '@/hooks/useModal'
import CTAButton from '@/components/lib/CTAButton/index.vue'
import MobileConnection from '@/models/mobile'
import ConnectionModal from './ConnectionModal/index.vue'
import DeviceRow from './DeviceRow/index.vue'

const { isOpen, openModal, closeModal } = useModal()
const loading = ref(true)
const devices = ref([])
let intervalId = null

const fetchDevices = async () => {
  const foundDevices = await MobileConnection.getDevices()
  devices.value = foundDevices
  if (foundDevices.length !== 0 && !isOpen.value) closeModal()
  return foundDevices
}

onMounted(async () => {
  const devicesResult = await fetchDevices()
  if (devicesResult.length === 0) openModal()
  loading.value = false

  intervalId = setInterval(fetchDevices, 5_000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

const removeDevice = (id) => {
  devices.value = devices.value.filter((device) => device.id !== id)
}
</script>

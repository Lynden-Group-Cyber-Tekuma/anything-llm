<template>
  <PreLoader v-if="isLoading" size="[100px]" />
  <p v-else-if="error" class="text-red-500 text-sm w-[300px] p-4 text-center">
    {{ error }}
  </p>
  <QRCodeSVG
    v-else-if="connectionInfo"
    :value="connectionInfo"
    :size="300"
    bgColor="transparent"
    fgColor="white"
    level="L"
    :imageSettings="{
      src: Logo,
      x: 300 / 2 - size.width / 2,
      y: 300 / 2 - size.height / 2,
      height: size.height,
      width: size.width,
      excavate: true,
    }"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import { QRCodeSVG } from 'qrcode.vue'
import MobileConnection from '@/models/mobile'
import PreLoader from '@/components/Preloader/index.vue'
import Logo from '@/media/logo/anything-llm-infinity.png'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const connectionInfo = ref(null)
const isLoading = ref(false)
const error = ref(null)

const size = {
  width: 35 * 1.5,
  height: 22 * 1.5,
}

/**
 * Process the connection url to make it absolute if it is a relative path
 * @param {string} url
 * @returns {string}
 */
function processConnectionUrl(url) {
  if (url.startsWith('http')) return new URL(url)
  const connectionUrl = new URL(`${window.location.origin}${url}`)
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(connectionUrl.hostname))
    throw new Error(
      'Please open this page via your machines private IP address or custom domain. Localhost URLs will not work with the mobile app.'
    )
  return connectionUrl.toString()
}

watch(() => props.isOpen, async (newVal) => {
  if (!newVal) return
  isLoading.value = true
  try {
    const res = await MobileConnection.getConnectionInfo()
    if (res.error) throw new Error(res.error)
    const url = processConnectionUrl(res.connectionUrl)
    connectionInfo.value = url
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}, { immediate: true })
</script>

<script setup>
import { ref, onMounted, watch } from 'vue'
import useLogo from '@/hooks/useLogo'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { PhPlus } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { logo: _initLogo, setLogo: _setLogo } = useLogo()
const logo = ref('')
const isDefaultLogo = ref(true)
const fileInputRef = ref(null)

const logoInit = async () => {
  logo.value = _initLogo || ''
  const _isDefaultLogo = await System.isDefaultLogo()
  isDefaultLogo.value = _isDefaultLogo
}

onMounted(() => {
  logoInit()
})

watch(() => _initLogo, () => {
  logoInit()
})

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return false

  const objectURL = URL.createObjectURL(file)
  logo.value = objectURL

  const formData = new FormData()
  formData.append('logo', file)
  const { success, error } = await System.uploadLogo(formData)
  if (!success) {
    showToast(`Failed to upload logo: ${error}`, 'error')
    logo.value = _initLogo
    return
  }

  const { logoURL } = await System.fetchLogo()
  _setLogo(logoURL)

  showToast('Image uploaded successfully.', 'success')
  isDefaultLogo.value = false
}

const handleRemoveLogo = async () => {
  logo.value = ''
  isDefaultLogo.value = true

  const { success, error } = await System.removeCustomLogo()
  if (!success) {
    console.error('Failed to remove logo:', error)
    showToast(`Failed to remove logo: ${error}`, 'error')
    const { logoURL } = await System.fetchLogo()
    logo.value = logoURL
    isDefaultLogo.value = false
    return
  }

  const { logoURL } = await System.fetchLogo()
  _setLogo(logoURL)

  showToast('Image successfully removed.', 'success')
}

const triggerFileInputClick = () => {
  fileInputRef.value?.click()
}
</script>

<template>
  <div class="flex flex-col gap-y-0.5 my-4">
    <p class="text-sm leading-6 font-semibold text-white">
      {{ t('customization.items.logo.title') }}
    </p>
    <p class="text-xs text-white/60">
      {{ t('customization.items.logo.description') }}
    </p>
    <div v-if="isDefaultLogo" class="flex md:flex-row flex-col items-center">
      <div class="flex flex-row gap-x-8">
        <label
          class="mt-3 transition-all duration-300 hover:opacity-60"
        >
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
          />
          <div
            class="w-80 py-4 bg-theme-settings-input-bg rounded-2xl border-2 border-dashed border-theme-text-secondary border-opacity-60 justify-center items-center inline-flex cursor-pointer"
          >
            <div class="flex flex-col items-center justify-center">
              <div class="rounded-full bg-white/40">
                <Plus class="w-6 h-6 text-black/80 m-2" />
              </div>
              <div class="text-theme-text-primary text-opacity-80 text-sm font-semibold py-1">
                {{ t('customization.items.logo.add') }}
              </div>
              <div class="text-theme-text-secondary text-opacity-60 text-xs font-medium py-1">
                {{ t('customization.items.logo.recommended') }}
              </div>
            </div>
          </div>
        </label>
      </div>
    </div>
    <div v-else class="flex md:flex-row flex-col items-center relative">
      <div class="group w-80 h-[130px] mt-3 overflow-hidden">
        <img
          :src="logo"
          alt="Uploaded Logo"
          class="w-full h-full object-cover border-2 border-theme-text-secondary border-opacity-60 p-1 rounded-2xl"
        />

        <div class="absolute w-80 top-0 left-0 right-0 bottom-0 flex flex-col gap-y-3 justify-center items-center rounded-2xl mt-3 bg-black bg-opacity-80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out border-2 border-transparent hover:border-white">
          <button
            @click="triggerFileInputClick"
            class="text-[#FFFFFF] text-base font-medium hover:text-opacity-60 mx-2"
          >
            {{ t('customization.items.logo.replace') }}
          </button>

          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
            ref="fileInputRef"
          />
          <button
            @click="handleRemoveLogo"
            class="text-[#FFFFFF] text-base font-medium hover:text-opacity-60 mx-2"
          >
            {{ t('customization.items.logo.remove') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

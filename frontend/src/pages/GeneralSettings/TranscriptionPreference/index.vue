<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar />
    <div
      v-if="loading"
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
    >
      <div class="w-full h-full flex justify-center items-center">
        <PreLoader />
      </div>
    </div>
    <div
      v-else
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
    >
      <form @submit.prevent="handleSubmit" class="flex w-full">
        <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] py-16 md:py-6">
          <div class="w-full flex flex-col gap-y-1 pb-6 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10">
            <div class="flex gap-x-4 items-center">
              <p class="text-lg leading-6 font-bold text-white">
                {{ t('transcription.title') }}
              </p>
            </div>
            <p class="text-xs leading-[18px] font-base text-white text-opacity-60">
              {{ t('transcription.description') }}
            </p>
          </div>
          <div class="w-full justify-end flex">
            <CTAButton
              v-if="hasChanges"
              @click="handleSubmit"
              class="mt-3 mr-0 -mb-14 z-10"
            >
              {{ saving ? 'Saving...' : 'Save changes' }}
            </CTAButton>
          </div>
          <div class="text-base font-bold text-white mt-6 mb-4">
            {{ t('transcription.provider') }}
          </div>
          <div class="relative">
            <div
              v-if="searchMenuOpen"
              class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 backdrop-blur-sm z-10"
              @click="searchMenuOpen = false"
            />
            <div
              v-if="searchMenuOpen"
              class="absolute top-0 left-0 w-full max-w-[640px] max-h-[310px] min-h-[64px] bg-theme-settings-input-bg rounded-lg flex flex-col justify-between cursor-pointer border-2 border-primary-button z-20"
            >
              <div class="w-full flex flex-col gap-y-1">
                <div class="flex items-center sticky top-0 z-10 border-b border-[#9CA3AF] mx-4 bg-theme-settings-input-bg">
                  <MagnifyingGlass
                    :size="20"
                    weight="bold"
                    class="absolute left-4 z-30 text-theme-text-primary -ml-4 my-2"
                  />
                  <input
                    ref="searchInputRef"
                    type="text"
                    name="provider-search"
                    autocomplete="off"
                    placeholder="Search audio transcription providers"
                    class="border-none -ml-4 my-2 bg-transparent z-20 pl-12 h-[38px] w-full px-4 py-1 text-sm outline-none focus:outline-primary-button active:outline-primary-button outline-none text-theme-text-primary placeholder:text-theme-text-primary placeholder:font-medium"
                    @input="searchQuery = $event.target.value"
                    @keydown.enter.prevent
                  />
                  <X
                    :size="20"
                    weight="bold"
                    class="cursor-pointer text-white hover:text-x-button"
                    @click="handleXButton"
                  />
                </div>
                <div class="flex-1 pl-4 pr-2 flex flex-col gap-y-1 overflow-y-auto white-scrollbar pb-4 max-h-[245px]">
                  <LLMItem
                    v-for="provider in filteredProviders"
                    :key="provider.name"
                    :name="provider.name"
                    :value="provider.value"
                    :image="provider.logo"
                    :description="provider.description"
                    :checked="selectedProvider === provider.value"
                    @click="updateProviderChoice(provider.value)"
                  />
                </div>
              </div>
            </div>
            <button
              v-else
              class="w-full max-w-[640px] h-[64px] bg-theme-settings-input-bg rounded-lg flex items-center p-[14px] justify-between cursor-pointer border-2 border-transparent hover:border-primary-button transition-all duration-300"
              type="button"
              @click="searchMenuOpen = true"
            >
              <div class="flex gap-x-4 items-center">
                <img
                  :src="selectedProviderObject.logo"
                  :alt="`${selectedProviderObject.name} logo`"
                  class="w-10 h-10 rounded-md"
                />
                <div class="flex flex-col text-left">
                  <div class="text-sm font-semibold text-white">
                    {{ selectedProviderObject.name }}
                  </div>
                  <div class="mt-1 text-xs text-description">
                    {{ selectedProviderObject.description }}
                  </div>
                </div>
              </div>
              <CaretUpDown
                :size="24"
                weight="bold"
                class="text-white"
              />
            </button>
          </div>
          <div
            @change="hasChanges = true"
            class="mt-4 flex flex-col gap-y-1"
          >
            <component
              v-if="selectedProvider && selectedProviderObject"
              :is="selectedProviderObject.options"
              :settings="settings"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobile } from 'react-device-detect'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import PreLoader from '@/components/Preloader/index.vue'
import OpenAiLogo from '@/media/llmprovider/openai.png'
import AnythingLLMIcon from '@/media/logo/anything-llm-icon.png'
import OpenAiWhisperOptions from '@/components/TranscriptionSelection/OpenAiOptions/index.vue'
import NativeTranscriptionOptions from '@/components/TranscriptionSelection/NativeTranscriptionOptions/index.vue'
import LLMItem from '@/components/LLMSelection/LLMItem/index.vue'
import { CaretUpDown, MagnifyingGlass, X } from '@phosphor-icons/vue'
import CTAButton from '@/components/lib/CTAButton/index.vue'

const PROVIDERS = [
  {
    name: 'OpenAI',
    value: 'openai',
    logo: OpenAiLogo,
    options: OpenAiWhisperOptions,
    description: 'Leverage the OpenAI Whisper-large model using your API key.',
  },
  {
    name: 'AnythingLLM Built-In',
    value: 'local',
    logo: AnythingLLMIcon,
    options: NativeTranscriptionOptions,
    description: 'Run a built-in whisper model on this instance privately.',
  },
]

const { t } = useI18n()
const saving = ref(false)
const hasChanges = ref(false)
const settings = ref(null)
const loading = ref(true)
const searchQuery = ref('')
const selectedProvider = ref(null)
const searchMenuOpen = ref(false)
const searchInputRef = ref(null)

const filteredProviders = computed(() => {
  return PROVIDERS.filter((provider) =>
    provider.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectedProviderObject = computed(() => {
  return PROVIDERS.find((provider) => provider.value === selectedProvider.value)
})

const handleSubmit = async (e) => {
  if (e) e.preventDefault()
  const form = e?.target || document.getElementById('transcription-form')
  const data = { WhisperProvider: selectedProvider.value }
  const formData = new FormData(form)

  for (const [key, value] of formData.entries()) data[key] = value
  const { error } = await System.updateSystem(data)
  saving.value = true

  if (error) {
    showToast(`Failed to save preferences: ${error}`, 'error')
  } else {
    showToast('Transcription preferences saved successfully.', 'success')
  }
  saving.value = false
  hasChanges.value = !!error
}

const updateProviderChoice = (selection) => {
  searchQuery.value = ''
  selectedProvider.value = selection
  searchMenuOpen.value = false
  hasChanges.value = true
}

const handleXButton = () => {
  if (searchQuery.value.length > 0) {
    searchQuery.value = ''
    if (searchInputRef.value) searchInputRef.value.value = ''
  } else {
    searchMenuOpen.value = !searchMenuOpen.value
  }
}

onMounted(async () => {
  const _settings = await System.keys()
  settings.value = _settings
  selectedProvider.value = _settings?.WhisperProvider || 'local'
  loading.value = false
})
</script>

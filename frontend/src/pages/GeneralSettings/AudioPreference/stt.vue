<template>
  <form @submit.prevent="handleSubmit" class="flex w-full">
    <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
      <div class="w-full flex flex-col gap-y-1 pb-6 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10">
        <div class="flex gap-x-4 items-center">
          <p class="text-lg leading-6 font-bold text-white">
            Speech-to-text Preference
          </p>
        </div>
        <p class="text-xs leading-[18px] font-base text-white text-opacity-60">
          Here you can specify what kind of text-to-speech and speech-to-text
          providers you would want to use in your AnythingLLM experience. By
          default, we use the browser's built in support for these services,
          but you may want to use others.
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
      <div class="text-base font-bold text-white mt-6 mb-4">Provider</div>
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
                name="stt-provider-search"
                autocomplete="off"
                placeholder="Search speech to text providers"
                class="border-none -ml-4 my-2 bg-transparent z-20 pl-12 h-[38px] w-full px-4 py-1 text-sm outline-none text-theme-text-primary placeholder:text-theme-text-primary placeholder:font-medium"
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
          <CaretUpDown :size="24" weight="bold" class="text-white" />
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import LLMItem from '@/components/LLMSelection/LLMItem/index.vue'
import { PhCaretUpDown, PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'
import CTAButton from '@/components/lib/CTAButton/index.vue'
import AnythingLLMIcon from '@/media/logo/anything-llm-icon.png'
import BrowserNative from '@/components/SpeechToText/BrowserNative/index.vue'

const PROVIDERS = [
  {
    name: 'System native',
    value: 'native',
    logo: AnythingLLMIcon,
    options: BrowserNative,
    description: "Uses your browser's built in STT service if supported.",
  },
]

const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
})

const saving = ref(false)
const hasChanges = ref(false)
const searchQuery = ref('')
const selectedProvider = ref(props.settings?.SpeechToTextProvider || 'native')
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
  const form = e?.target || document.querySelector('form')
  const data = { SpeechToTextProvider: selectedProvider.value }
  const formData = new FormData(form)

  for (const [key, value] of formData.entries()) data[key] = value
  const { error } = await System.updateSystem(data)
  saving.value = true

  if (error) {
    showToast(`Failed to save preferences: ${error}`, 'error')
  } else {
    showToast('Speech-to-text preferences saved successfully.', 'success')
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
</script>

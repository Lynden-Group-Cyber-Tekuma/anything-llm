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
      <form
        id="embedding-form"
        @submit.prevent="handleSubmit"
        class="flex w-full"
      >
        <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] py-16 md:py-6">
          <div class="w-full flex flex-col gap-y-1 pb-6 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10">
            <div class="flex gap-x-4 items-center">
              <p class="text-lg leading-6 font-bold text-white">
                {{ t('embedding.title') }}
              </p>
            </div>
            <p class="text-xs leading-[18px] font-base text-white text-opacity-60">
              {{ t('embedding.desc-start') }}
              <br />
              {{ t('embedding.desc-end') }}
            </p>
          </div>
          <div class="w-full justify-end flex">
            <CTAButton
              v-if="hasChanges"
              @click="handleSubmit"
              class="mt-3 mr-0 -mb-14 z-10"
            >
              {{ saving ? t('common.saving') : t('common.save') }}
            </CTAButton>
          </div>
          <div class="text-base font-bold text-white mt-6 mb-4">
            {{ t('embedding.provider.title') }}
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
                    name="embedder-search"
                    autocomplete="off"
                    placeholder="Search all embedding providers"
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
                  <EmbedderItem
                    v-for="embedder in filteredEmbedders"
                    :key="embedder.name"
                    :name="embedder.name"
                    :value="embedder.value"
                    :image="embedder.logo"
                    :description="embedder.description"
                    :checked="selectedEmbedder === embedder.value"
                    @click="updateChoice(embedder.value)"
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
                  :src="selectedEmbedderObject.logo"
                  :alt="`${selectedEmbedderObject.name} logo`"
                  class="w-10 h-10 rounded-md"
                />
                <div class="flex flex-col text-left">
                  <div class="text-sm font-semibold text-white">
                    {{ selectedEmbedderObject.name }}
                  </div>
                  <div class="mt-1 text-xs text-description">
                    {{ selectedEmbedderObject.description }}
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
              v-if="selectedEmbedder && selectedEmbedderObject"
              :is="selectedEmbedderObject.options"
              :settings="settings"
            />
          </div>
        </div>
      </form>
    </div>
    <ModalWrapper :isOpen="isOpen">
      <ChangeWarningModal
        warningText="Switching the embedding model will reset all previously embedded documents in all workspaces.

Confirming will clear all embeddings from your vector database and remove all documents from your workspaces. Your uploaded documents will not be deleted, they will be available for re-embedding."
        @close="closeModal"
        @confirm="handleSaveSettings"
      />
    </ModalWrapper>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobile } from 'react-device-detect'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { useModal } from '@/hooks/useModal'
import CTAButton from '@/components/lib/CTAButton/index.vue'
import { PhCaretUpDown, PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'
import PreLoader from '@/components/Preloader/index.vue'
import ChangeWarningModal from '@/components/ChangeWarning/index.vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import EmbedderItem from '@/components/EmbeddingSelection/EmbedderItem/index.vue'

import AnythingLLMIcon from '@/media/logo/anything-llm-icon.png'
import OpenAiLogo from '@/media/llmprovider/openai.png'
import AzureOpenAiLogo from '@/media/llmprovider/azure.png'
import GeminiAiLogo from '@/media/llmprovider/gemini.png'
import LocalAiLogo from '@/media/llmprovider/localai.png'
import OllamaLogo from '@/media/llmprovider/ollama.png'
import LMStudioLogo from '@/media/llmprovider/lmstudio.png'
import CohereLogo from '@/media/llmprovider/cohere.png'
import VoyageAiLogo from '@/media/embeddingprovider/voyageai.png'
import LiteLLMLogo from '@/media/llmprovider/litellm.png'
import GenericOpenAiLogo from '@/media/llmprovider/generic-openai.png'
import MistralAiLogo from '@/media/llmprovider/mistral.jpeg'
import OpenRouterLogo from '@/media/llmprovider/openrouter.jpeg'

import NativeEmbeddingOptions from '@/components/EmbeddingSelection/NativeEmbeddingOptions/index.vue'
import OpenAiOptions from '@/components/EmbeddingSelection/OpenAiOptions/index.vue'
import AzureAiOptions from '@/components/EmbeddingSelection/AzureAiOptions/index.vue'
import GeminiOptions from '@/components/EmbeddingSelection/GeminiOptions/index.vue'
import LocalAiOptions from '@/components/EmbeddingSelection/LocalAiOptions/index.vue'
import OllamaEmbeddingOptions from '@/components/EmbeddingSelection/OllamaOptions/index.vue'
import LMStudioEmbeddingOptions from '@/components/EmbeddingSelection/LMStudioOptions/index.vue'
import OpenRouterOptions from '@/components/EmbeddingSelection/OpenRouterOptions/index.vue'
import LiteLLMOptions from '@/components/EmbeddingSelection/LiteLLMOptions/index.vue'
import CohereEmbeddingOptions from '@/components/EmbeddingSelection/CohereOptions/index.vue'
import VoyageAiOptions from '@/components/EmbeddingSelection/VoyageAiOptions/index.vue'
import MistralAiOptions from '@/components/EmbeddingSelection/MistralAiOptions/index.vue'
import GenericOpenAiEmbeddingOptions from '@/components/EmbeddingSelection/GenericOpenAiOptions/index.vue'

const EMBEDDERS = [
  {
    name: 'AnythingLLM Embedder',
    value: 'native',
    logo: AnythingLLMIcon,
    options: NativeEmbeddingOptions,
    description: 'Use the built-in embedding provider for AnythingLLM. Zero setup!',
  },
  {
    name: 'OpenAI',
    value: 'openai',
    logo: OpenAiLogo,
    options: OpenAiOptions,
    description: 'The standard option for most non-commercial use.',
  },
  {
    name: 'Azure OpenAI',
    value: 'azure',
    logo: AzureOpenAiLogo,
    options: AzureAiOptions,
    description: 'The enterprise option of OpenAI hosted on Azure services.',
  },
  {
    name: 'Gemini',
    value: 'gemini',
    logo: GeminiAiLogo,
    options: GeminiOptions,
    description: 'Run powerful embedding models from Google AI.',
  },
  {
    name: 'Local AI',
    value: 'localai',
    logo: LocalAiLogo,
    options: LocalAiOptions,
    description: 'Run embedding models locally on your own machine.',
  },
  {
    name: 'Ollama',
    value: 'ollama',
    logo: OllamaLogo,
    options: OllamaEmbeddingOptions,
    description: 'Run embedding models locally on your own machine.',
  },
  {
    name: 'LM Studio',
    value: 'lmstudio',
    logo: LMStudioLogo,
    options: LMStudioEmbeddingOptions,
    description: 'Discover, download, and run thousands of cutting edge LLMs in a few clicks.',
  },
  {
    name: 'OpenRouter',
    value: 'openrouter',
    logo: OpenRouterLogo,
    options: OpenRouterOptions,
    description: 'Run embedding models from OpenRouter.',
  },
  {
    name: 'LiteLLM',
    value: 'litellm',
    logo: LiteLLMLogo,
    options: LiteLLMOptions,
    description: 'Run powerful embedding models from LiteLLM.',
  },
  {
    name: 'Cohere',
    value: 'cohere',
    logo: CohereLogo,
    options: CohereEmbeddingOptions,
    description: 'Run powerful embedding models from Cohere.',
  },
  {
    name: 'Voyage AI',
    value: 'voyageai',
    logo: VoyageAiLogo,
    options: VoyageAiOptions,
    description: 'Run powerful embedding models from Voyage AI.',
  },
  {
    name: 'Mistral AI',
    value: 'mistral',
    logo: MistralAiLogo,
    options: MistralAiOptions,
    description: 'Run powerful embedding models from Mistral AI.',
  },
  {
    name: 'Generic OpenAI',
    value: 'generic-openai',
    logo: GenericOpenAiLogo,
    options: GenericOpenAiEmbeddingOptions,
    description: 'Run embedding models from any OpenAI compatible API service.',
  },
]

const { t } = useI18n()
const saving = ref(false)
const hasChanges = ref(false)
const hasEmbeddings = ref(false)
const hasCachedEmbeddings = ref(false)
const settings = ref({})
const loading = ref(true)
const searchQuery = ref('')
const filteredEmbedders = ref([])
const selectedEmbedder = ref(null)
const searchMenuOpen = ref(false)
const searchInputRef = ref(null)
const { isOpen, openModal, closeModal } = useModal()

const selectedEmbedderObject = computed(() => {
  return EMBEDDERS.find((embedder) => embedder.value === selectedEmbedder.value) ?? EMBEDDERS[0]
})

function embedderModelChanged(formEl) {
  try {
    const newModel = new FormData(formEl).get('EmbeddingModelPref') ?? null
    if (newModel === null) return false
    return settings.value?.EmbeddingModelPref !== newModel
  } catch (error) {
    console.error(error)
  }
  return false
}

const handleSubmit = async (e) => {
  if (e) e.preventDefault()
  if (
    (selectedEmbedder.value !== settings.value?.EmbeddingEngine ||
      embedderModelChanged(e?.target || document.getElementById('embedding-form'))) &&
    hasChanges.value &&
    (hasEmbeddings.value || hasCachedEmbeddings.value)
  ) {
    openModal()
  } else {
    await handleSaveSettings()
  }
}

const handleSaveSettings = async () => {
  saving.value = true
  const form = document.getElementById('embedding-form')
  const settingsData = {}
  const formData = new FormData(form)
  settingsData.EmbeddingEngine = selectedEmbedder.value
  for (const [key, value] of formData.entries()) settingsData[key] = value

  const { error } = await System.updateSystem(settingsData)
  if (error) {
    showToast(`Failed to save embedding settings: ${error}`, 'error')
    hasChanges.value = true
  } else {
    showToast('Embedding preferences saved successfully.', 'success')
    hasChanges.value = false
  }
  saving.value = false
  closeModal()
}

const updateChoice = (selection) => {
  searchQuery.value = ''
  selectedEmbedder.value = selection
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
  selectedEmbedder.value = _settings?.EmbeddingEngine || 'native'
  hasEmbeddings.value = _settings?.HasExistingEmbeddings || false
  hasCachedEmbeddings.value = _settings?.HasCachedEmbeddings || false
  loading.value = false
})

computed(() => {
  filteredEmbedders.value = EMBEDDERS.filter((embedder) =>
    embedder.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

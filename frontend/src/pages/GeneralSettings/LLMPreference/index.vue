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
                {{ t('llm.title') }}
              </p>
            </div>
            <p class="text-xs leading-[18px] font-base text-white text-opacity-60">
              {{ t('llm.description') }}
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
            {{ t('llm.provider') }}
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
                    name="llm-search"
                    autocomplete="off"
                    placeholder="Search all LLM providers"
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
                    v-for="llm in filteredLLMs"
                    :key="llm.name"
                    :name="llm.name"
                    :value="llm.value"
                    :image="llm.logo"
                    :description="llm.description"
                    :checked="selectedLLM === llm.value"
                    @click="updateLLMChoice(llm.value)"
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
                  :src="selectedLLMObject.logo"
                  :alt="`${selectedLLMObject.name} logo`"
                  class="w-10 h-10 rounded-md"
                />
                <div class="flex flex-col text-left">
                  <div class="text-sm font-semibold text-white">
                    {{ selectedLLMObject.name }}
                  </div>
                  <div class="mt-1 text-xs text-description">
                    {{ selectedLLMObject.description }}
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
              v-if="selectedLLM && selectedLLMObject"
              :is="selectedLLMObject.options"
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
import LLMItem from '@/components/LLMSelection/LLMItem/index.vue'
import { CaretUpDown, MagnifyingGlass, X } from '@phosphor-icons/vue'
import CTAButton from '@/components/lib/CTAButton/index.vue'

import AnythingLLMIcon from '@/media/logo/anything-llm-icon.png'
import OpenAiLogo from '@/media/llmprovider/openai.png'
import GenericOpenAiLogo from '@/media/llmprovider/generic-openai.png'
import AzureOpenAiLogo from '@/media/llmprovider/azure.png'
import AnthropicLogo from '@/media/llmprovider/anthropic.png'
import GeminiLogo from '@/media/llmprovider/gemini.png'
import OllamaLogo from '@/media/llmprovider/ollama.png'
import NovitaLogo from '@/media/llmprovider/novita.png'
import LMStudioLogo from '@/media/llmprovider/lmstudio.png'
import LocalAiLogo from '@/media/llmprovider/localai.png'
import TogetherAILogo from '@/media/llmprovider/togetherai.png'
import FireworksAILogo from '@/media/llmprovider/fireworksai.jpeg'
import MistralLogo from '@/media/llmprovider/mistral.jpeg'
import HuggingFaceLogo from '@/media/llmprovider/huggingface.png'
import PerplexityLogo from '@/media/llmprovider/perplexity.png'
import OpenRouterLogo from '@/media/llmprovider/openrouter.jpeg'
import GroqLogo from '@/media/llmprovider/groq.png'
import KoboldCPPLogo from '@/media/llmprovider/koboldcpp.png'
import TextGenWebUILogo from '@/media/llmprovider/text-generation-webui.png'
import CohereLogo from '@/media/llmprovider/cohere.png'
import LiteLLMLogo from '@/media/llmprovider/litellm.png'
import AWSBedrockLogo from '@/media/llmprovider/bedrock.png'
import DeepSeekLogo from '@/media/llmprovider/deepseek.png'
import APIPieLogo from '@/media/llmprovider/apipie.png'
import XAILogo from '@/media/llmprovider/xai.png'
import ZAiLogo from '@/media/llmprovider/zai.png'
import NvidiaNimLogo from '@/media/llmprovider/nvidia-nim.png'
import PPIOLogo from '@/media/llmprovider/ppio.png'
import DellProAiStudioLogo from '@/media/llmprovider/dpais.png'
import MoonshotAiLogo from '@/media/llmprovider/moonshotai.png'
import CometApiLogo from '@/media/llmprovider/cometapi.png'
import FoundryLogo from '@/media/llmprovider/foundry-local.png'
import GiteeAILogo from '@/media/llmprovider/giteeai.png'

import OpenAiOptions from '@/components/LLMSelection/OpenAiOptions/index.vue'
import GenericOpenAiOptions from '@/components/LLMSelection/GenericOpenAiOptions/index.vue'
import AzureAiOptions from '@/components/LLMSelection/AzureAiOptions/index.vue'
import AnthropicAiOptions from '@/components/LLMSelection/AnthropicAiOptions/index.vue'
import LMStudioOptions from '@/components/LLMSelection/LMStudioOptions/index.vue'
import LocalAiOptions from '@/components/LLMSelection/LocalAiOptions/index.vue'
import GeminiLLMOptions from '@/components/LLMSelection/GeminiLLMOptions/index.vue'
import OllamaLLMOptions from '@/components/LLMSelection/OllamaLLMOptions/index.vue'
import NovitaLLMOptions from '@/components/LLMSelection/NovitaLLMOptions/index.vue'
import CometApiLLMOptions from '@/components/LLMSelection/CometApiLLMOptions/index.vue'
import TogetherAiOptions from '@/components/LLMSelection/TogetherAiOptions/index.vue'
import FireworksAiOptions from '@/components/LLMSelection/FireworksAiOptions/index.vue'
import MistralOptions from '@/components/LLMSelection/MistralOptions/index.vue'
import HuggingFaceOptions from '@/components/LLMSelection/HuggingFaceOptions/index.vue'
import PerplexityOptions from '@/components/LLMSelection/PerplexityOptions/index.vue'
import OpenRouterOptions from '@/components/LLMSelection/OpenRouterOptions/index.vue'
import GroqAiOptions from '@/components/LLMSelection/GroqAiOptions/index.vue'
import CohereAiOptions from '@/components/LLMSelection/CohereAiOptions/index.vue'
import KoboldCPPOptions from '@/components/LLMSelection/KoboldCPPOptions/index.vue'
import TextGenWebUIOptions from '@/components/LLMSelection/TextGenWebUIOptions/index.vue'
import LiteLLMOptions from '@/components/LLMSelection/LiteLLMOptions/index.vue'
import AWSBedrockLLMOptions from '@/components/LLMSelection/AwsBedrockLLMOptions/index.vue'
import DeepSeekOptions from '@/components/LLMSelection/DeepSeekOptions/index.vue'
import ApiPieLLMOptions from '@/components/LLMSelection/ApiPieOptions/index.vue'
import XAILLMOptions from '@/components/LLMSelection/XAiLLMOptions/index.vue'
import ZAiLLMOptions from '@/components/LLMSelection/ZAiLLMOptions/index.vue'
import NvidiaNimOptions from '@/components/LLMSelection/NvidiaNimOptions/index.vue'
import PPIOLLMOptions from '@/components/LLMSelection/PPIOLLMOptions/index.vue'
import DellProAiStudioOptions from '@/components/LLMSelection/DPAISOptions/index.vue'
import MoonshotAiOptions from '@/components/LLMSelection/MoonshotAiOptions/index.vue'
import FoundryOptions from '@/components/LLMSelection/FoundryOptions/index.vue'
import GiteeAIOptions from '@/components/LLMSelection/GiteeAIOptions/index.vue'

const AVAILABLE_LLM_PROVIDERS = [
  {
    name: 'OpenAI',
    value: 'openai',
    logo: OpenAiLogo,
    options: OpenAiOptions,
    description: 'The standard option for most non-commercial use.',
    requiredConfig: ['OpenAiKey'],
  },
  {
    name: 'Azure OpenAI',
    value: 'azure',
    logo: AzureOpenAiLogo,
    options: AzureAiOptions,
    description: 'The enterprise option of OpenAI hosted on Azure services.',
    requiredConfig: ['AzureOpenAiEndpoint'],
  },
  {
    name: 'Anthropic',
    value: 'anthropic',
    logo: AnthropicLogo,
    options: AnthropicAiOptions,
    description: 'A friendly AI Assistant hosted by Anthropic.',
    requiredConfig: ['AnthropicApiKey'],
  },
  {
    name: 'Gemini',
    value: 'gemini',
    logo: GeminiLogo,
    options: GeminiLLMOptions,
    description: 'Google\'s largest and most capable AI model',
    requiredConfig: ['GeminiLLMApiKey'],
  },
  {
    name: 'NVIDIA NIM',
    value: 'nvidia-nim',
    logo: NvidiaNimLogo,
    options: NvidiaNimOptions,
    description: 'Run full parameter LLMs directly on your NVIDIA RTX GPU using NVIDIA NIM.',
    requiredConfig: ['NvidiaNimLLMBasePath'],
  },
  {
    name: 'HuggingFace',
    value: 'huggingface',
    logo: HuggingFaceLogo,
    options: HuggingFaceOptions,
    description: 'Access 150,000+ open-source LLMs and the world\'s AI community',
    requiredConfig: [
      'HuggingFaceLLMEndpoint',
      'HuggingFaceLLMAccessToken',
      'HuggingFaceLLMTokenLimit',
    ],
  },
  {
    name: 'Ollama',
    value: 'ollama',
    logo: OllamaLogo,
    options: OllamaLLMOptions,
    description: 'Run LLMs locally on your own machine.',
    requiredConfig: ['OllamaLLMBasePath'],
  },
  {
    name: 'Dell Pro AI Studio',
    value: 'dpais',
    logo: DellProAiStudioLogo,
    options: DellProAiStudioOptions,
    description: 'Run powerful LLMs quickly on NPU powered by Dell Pro AI Studio.',
    requiredConfig: [
      'DellProAiStudioBasePath',
      'DellProAiStudioModelPref',
      'DellProAiStudioTokenLimit',
    ],
  },
  {
    name: 'LM Studio',
    value: 'lmstudio',
    logo: LMStudioLogo,
    options: LMStudioOptions,
    description: 'Discover, download, and run thousands of cutting edge LLMs in a few clicks.',
    requiredConfig: ['LMStudioBasePath'],
  },
  {
    name: 'Local AI',
    value: 'localai',
    logo: LocalAiLogo,
    options: LocalAiOptions,
    description: 'Run LLMs locally on your own machine.',
    requiredConfig: ['LocalAiApiKey', 'LocalAiBasePath', 'LocalAiTokenLimit'],
  },
  {
    name: 'Together AI',
    value: 'togetherai',
    logo: TogetherAILogo,
    options: TogetherAiOptions,
    description: 'Run open source models from Together AI.',
    requiredConfig: ['TogetherAiApiKey'],
  },
  {
    name: 'Fireworks AI',
    value: 'fireworksai',
    logo: FireworksAILogo,
    options: FireworksAiOptions,
    description: 'The fastest and most efficient inference engine to build production-ready, compound AI systems.',
    requiredConfig: ['FireworksAiLLMApiKey'],
  },
  {
    name: 'Mistral',
    value: 'mistral',
    logo: MistralLogo,
    options: MistralOptions,
    description: 'Run open source models from Mistral AI.',
    requiredConfig: ['MistralApiKey'],
  },
  {
    name: 'Perplexity AI',
    value: 'perplexity',
    logo: PerplexityLogo,
    options: PerplexityOptions,
    description: 'Run powerful and internet-connected models hosted by Perplexity AI.',
    requiredConfig: ['PerplexityApiKey'],
  },
  {
    name: 'OpenRouter',
    value: 'openrouter',
    logo: OpenRouterLogo,
    options: OpenRouterOptions,
    description: 'A unified interface for LLMs.',
    requiredConfig: ['OpenRouterApiKey'],
  },
  {
    name: 'Groq',
    value: 'groq',
    logo: GroqLogo,
    options: GroqAiOptions,
    description: 'The fastest LLM inferencing available for real-time AI applications.',
    requiredConfig: ['GroqApiKey'],
  },
  {
    name: 'KoboldCPP',
    value: 'koboldcpp',
    logo: KoboldCPPLogo,
    options: KoboldCPPOptions,
    description: 'Run local LLMs using koboldcpp.',
    requiredConfig: [
      'KoboldCPPModelPref',
      'KoboldCPPBasePath',
      'KoboldCPPTokenLimit',
    ],
  },
  {
    name: 'Oobabooga Web UI',
    value: 'textgenwebui',
    logo: TextGenWebUILogo,
    options: TextGenWebUIOptions,
    description: 'Run local LLMs using Oobabooga\'s Text Generation Web UI.',
    requiredConfig: ['TextGenWebUIBasePath', 'TextGenWebUITokenLimit'],
  },
  {
    name: 'Cohere',
    value: 'cohere',
    logo: CohereLogo,
    options: CohereAiOptions,
    description: 'Run Cohere\'s powerful Command models.',
    requiredConfig: ['CohereApiKey'],
  },
  {
    name: 'LiteLLM',
    value: 'litellm',
    logo: LiteLLMLogo,
    options: LiteLLMOptions,
    description: 'Run LiteLLM\'s OpenAI compatible proxy for various LLMs.',
    requiredConfig: ['LiteLLMBasePath'],
  },
  {
    name: 'DeepSeek',
    value: 'deepseek',
    logo: DeepSeekLogo,
    options: DeepSeekOptions,
    description: 'Run DeepSeek\'s powerful LLMs.',
    requiredConfig: ['DeepSeekApiKey'],
  },
  {
    name: 'PPIO',
    value: 'ppio',
    logo: PPIOLogo,
    options: PPIOLLMOptions,
    description: 'Run stable and cost-efficient open-source LLM APIs, such as DeepSeek, Llama, Qwen etc.',
    requiredConfig: ['PPIOApiKey'],
  },
  {
    name: 'AWS Bedrock',
    value: 'bedrock',
    logo: AWSBedrockLogo,
    options: AWSBedrockLLMOptions,
    description: 'Run powerful foundation models privately with AWS Bedrock.',
    requiredConfig: [
      'AwsBedrockLLMAccessKeyId',
      'AwsBedrockLLMAccessKey',
      'AwsBedrockLLMRegion',
      'AwsBedrockLLMModel',
    ],
  },
  {
    name: 'APIpie',
    value: 'apipie',
    logo: APIPieLogo,
    options: ApiPieLLMOptions,
    description: 'A unified API of AI services from leading providers',
    requiredConfig: ['ApipieLLMApiKey', 'ApipieLLMModelPref'],
  },
  {
    name: 'Moonshot AI',
    value: 'moonshotai',
    logo: MoonshotAiLogo,
    options: MoonshotAiOptions,
    description: 'Run Moonshot AI\'s powerful LLMs.',
    requiredConfig: ['MoonshotAiApiKey'],
  },
  {
    name: 'Novita AI',
    value: 'novita',
    logo: NovitaLogo,
    options: NovitaLLMOptions,
    description: 'Reliable, Scalable, and Cost-Effective for LLMs from Novita AI',
    requiredConfig: ['NovitaLLMApiKey'],
  },
  {
    name: 'CometAPI',
    value: 'cometapi',
    logo: CometApiLogo,
    options: CometApiLLMOptions,
    description: '500+ AI Models all in one API.',
    requiredConfig: ['CometApiLLMApiKey'],
  },
  {
    name: 'Microsoft Foundry Local',
    value: 'foundry',
    logo: FoundryLogo,
    options: FoundryOptions,
    description: 'Run Microsoft\'s Foundry models locally.',
    requiredConfig: [
      'FoundryBasePath',
      'FoundryModelPref',
      'FoundryModelTokenLimit',
    ],
  },
  {
    name: 'xAI',
    value: 'xai',
    logo: XAILogo,
    options: XAILLMOptions,
    description: 'Run xAI\'s powerful LLMs like Grok-2 and more.',
    requiredConfig: ['XAIApiKey', 'XAIModelPref'],
  },
  {
    name: 'Z.AI',
    value: 'zai',
    logo: ZAiLogo,
    options: ZAiLLMOptions,
    description: 'Run Z.AI\'s powerful GLM models.',
    requiredConfig: ['ZAIApiKey'],
  },
  {
    name: 'GiteeAI',
    value: 'giteeai',
    logo: GiteeAILogo,
    options: GiteeAIOptions,
    description: 'Run GiteeAI\'s powerful LLMs.',
    requiredConfig: ['GiteeAIApiKey'],
  },
  {
    name: 'Generic OpenAI',
    value: 'generic-openai',
    logo: GenericOpenAiLogo,
    options: GenericOpenAiOptions,
    description: 'Connect to any OpenAi-compatible service via a custom configuration',
    requiredConfig: [
      'GenericOpenAiBasePath',
      'GenericOpenAiModelPref',
      'GenericOpenAiTokenLimit',
      'GenericOpenAiKey',
    ],
  },
]

const { t } = useI18n()
const saving = ref(false)
const hasChanges = ref(false)
const settings = ref(null)
const loading = ref(true)
const searchQuery = ref('')
const selectedLLM = ref(null)
const searchMenuOpen = ref(false)
const searchInputRef = ref(null)

const filteredLLMs = computed(() => {
  return AVAILABLE_LLM_PROVIDERS.filter((llm) =>
    llm.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectedLLMObject = computed(() => {
  return AVAILABLE_LLM_PROVIDERS.find((llm) => llm.value === selectedLLM.value)
})

const handleSubmit = async (e) => {
  if (e) e.preventDefault()
  const form = e?.target || document.querySelector('form')
  const data = { LLMProvider: selectedLLM.value }
  const formData = new FormData(form)

  for (const [key, value] of formData.entries()) data[key] = value
  const { error } = await System.updateSystem(data)
  saving.value = true

  if (error) {
    showToast(`Failed to save LLM settings: ${error}`, 'error')
  } else {
    showToast('LLM preferences saved successfully.', 'success')
  }
  saving.value = false
  hasChanges.value = !!error
}

const updateLLMChoice = (selection) => {
  searchQuery.value = ''
  selectedLLM.value = selection
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
  selectedLLM.value = _settings?.LLMProvider
  loading.value = false
})
</script>

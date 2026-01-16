# Final Two Files Conversion Guide

## Status: 19/21 Complete (90%)

The last 2 files to convert are the largest and most complex preference pages:

### 1. EmbeddingPreference/index.vue (~400 lines)
### 2. LLMPreference/index.vue (~580 lines)

Both files follow the **exact same pattern** as TranscriptionPreference and VectorDatabase, just with more providers.

---

## EmbeddingPreference/index.vue

**Template Structure** (identical to VectorDatabase):
```vue
<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar />
    <!-- Loading state -->
    <div v-if="loading">
      <PreLoader />
    </div>

    <!-- Main form -->
    <div v-else>
      <form id="embedding-form" @submit.prevent="handleSubmit">
        <!-- Header with title/description -->
        <div class="w-full flex flex-col gap-y-1 pb-6 border-b-2">
          <p>{{ t('embedding.title') }}</p>
          <p>{{ t('embedding.desc-start') }}<br />{{ t('embedding.desc-end') }}</p>
        </div>

        <!-- Save button (only when hasChanges) -->
        <CTAButton v-if="hasChanges" @click="handleSubmit">
          {{ saving ? t('common.saving') : t('common.save') }}
        </CTAButton>

        <!-- Provider selector (search dropdown) -->
        <div class="relative">
          <!-- Search menu overlay -->
          <div v-if="searchMenuOpen">
            <input v-model="searchQuery" />
            <EmbedderItem
              v-for="embedder in filteredEmbedders"
              @click="updateChoice(embedder.value)"
            />
          </div>

          <!-- Selected provider display -->
          <button v-else @click="searchMenuOpen = true">
            <img :src="selectedEmbedderObject.logo" />
            <div>{{ selectedEmbedderObject.name }}</div>
          </button>
        </div>

        <!-- Dynamic provider options -->
        <component
          v-if="selectedEmbedder && selectedEmbedderObject"
          :is="selectedEmbedderObject.options"
          :settings="settings"
          @change="hasChanges = true"
        />
      </form>
    </div>

    <!-- Warning modal for provider change -->
    <ModalWrapper :isOpen="isOpen">
      <ChangeWarningModal
        warningText="Switching the embedding model will reset all previously embedded documents..."
        @close="closeModal"
        @confirm="handleSaveSettings"
      />
    </ModalWrapper>
  </div>
</template>
```

**Script Setup** (13 providers):
```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModal } from '@/hooks/useModal'
import System from '@/models/system'
import showToast from '@/utils/toast'

// All provider logos
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

// All provider option components
import NativeEmbeddingOptions from '@/components/EmbeddingSelection/NativeEmbeddingOptions/index.vue'
import OpenAiOptions from '@/components/EmbeddingSelection/OpenAiOptions/index.vue'
import AzureAiOptions from '@/components/EmbeddingSelection/AzureAiOptions/index.vue'
import GeminiOptions from '@/components/EmbeddingSelection/GeminiOptions/index.vue'
import LocalAiOptions from '@/components/EmbeddingSelection/LocalAiOptions/index.vue'
import OllamaEmbeddingOptions from '@/components/EmbeddingSelection/OllamaOptions/index.vue'
import LMStudioEmbeddingOptions from '@/components/EmbeddingSelection/LMStudioOptions/index.vue'
import CohereEmbeddingOptions from '@/components/EmbeddingSelection/CohereOptions/index.vue'
import VoyageAiOptions from '@/components/EmbeddingSelection/VoyageAiOptions/index.vue'
import LiteLLMOptions from '@/components/EmbeddingSelection/LiteLLMOptions/index.vue'
import GenericOpenAiEmbeddingOptions from '@/components/EmbeddingSelection/GenericOpenAiOptions/index.vue'
import OpenRouterOptions from '@/components/EmbeddingSelection/OpenRouterOptions/index.vue'
import MistralAiOptions from '@/components/EmbeddingSelection/MistralAiOptions/index.vue'

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
  // ... 11 more providers
]

const { t } = useI18n()
const { isOpen, openModal, closeModal } = useModal()
const saving = ref(false)
const hasChanges = ref(false)
const hasEmbeddings = ref(false)
const hasCachedEmbeddings = ref(false)
const settings = ref(null)
const loading = ref(true)
const searchQuery = ref('')
const selectedEmbedder = ref(null)
const searchMenuOpen = ref(false)
const searchInputRef = ref(null)

const filteredEmbedders = computed(() => {
  return EMBEDDERS.filter((embedder) =>
    embedder.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectedEmbedderObject = computed(() => {
  return EMBEDDERS.find((embedder) => embedder.value === selectedEmbedder.value)
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
  e.preventDefault()
  if (
    (selectedEmbedder.value !== settings.value?.EmbeddingEngine ||
      embedderModelChanged(e.target)) &&
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
</script>
```

**Key Differences from VectorDatabase**:
- Uses `EmbedderItem` instead of `VectorDBItem`
- Uses `EmbeddingEngine` instead of `VectorDB` as key
- Has additional `embedderModelChanged()` function
- Checks both `HasExistingEmbeddings` and `HasCachedEmbeddings`
- Uses `hasCachedEmbeddings` state

---

## LLMPreference/index.vue (~580 lines)

**Identical pattern** to EmbeddingPreference, but with 40+ providers!

**Script Setup** (40+ providers):
```vue
<script setup>
// Same imports as Embedding, plus 30+ more provider logos and components

export const AVAILABLE_LLM_PROVIDERS = [
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
  // ... 38 more providers including:
  // Anthropic, Gemini, NVIDIA NIM, HuggingFace, Ollama, Dell Pro AI Studio,
  // LM Studio, Local AI, Together AI, Fireworks AI, Mistral, Perplexity,
  // OpenRouter, Groq, KoboldCPP, Oobabooga, Cohere, LiteLLM, DeepSeek,
  // PPIO, AWS Bedrock, APIpie, Moonshot AI, Novita AI, CometAPI, Foundry,
  // xAI, Z.AI, GiteeAI, Generic OpenAI
]

const { t } = useI18n()
const saving = ref(false)
const hasChanges = ref(false)
const settings = ref(null)
const loading = ref(true)
const searchQuery = ref('')
const filteredLLMs = ref([])
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
  e.preventDefault()
  const form = e.target
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

// Same handleXButton as others

onMounted(async () => {
  const _settings = await System.keys()
  settings.value = _settings
  selectedLLM.value = _settings?.LLMProvider
  loading.value = false
})
</script>
```

**Template** (identical structure to EmbeddingPreference):
- Same header/description pattern
- Same CTAButton with save logic
- Same provider selector dropdown
- Same dynamic component rendering
- **NO warning modal** (unlike Embedding/Vector)

**Key Differences from EmbeddingPreference**:
- Uses `LLMItem` component
- Uses `LLMProvider` as key (not `EmbeddingEngine`)
- **Does NOT have warning modal** (no data destruction)
- **Does NOT check for existing embeddings**
- Has `requiredConfig` array in provider definition (optional)
- Simpler submission logic (no modal check)

---

## Complete Import Lists

### EmbeddingPreference Imports:
```javascript
// Core Vue & utilities
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobile } from 'react-device-detect'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import PreLoader from '@/components/Preloader/index.vue'
import ChangeWarningModal from '@/components/ChangeWarning/index.vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import CTAButton from '@/components/lib/CTAButton/index.vue'
import { CaretUpDown, MagnifyingGlass, X } from '@phosphor-icons/vue'
import { useModal } from '@/hooks/useModal'

// Logos (13)
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

// Components
import EmbedderItem from '@/components/EmbeddingSelection/EmbedderItem/index.vue'
import NativeEmbeddingOptions from '@/components/EmbeddingSelection/NativeEmbeddingOptions/index.vue'
import OpenAiOptions from '@/components/EmbeddingSelection/OpenAiOptions/index.vue'
import AzureAiOptions from '@/components/EmbeddingSelection/AzureAiOptions/index.vue'
import GeminiOptions from '@/components/EmbeddingSelection/GeminiOptions/index.vue'
import LocalAiOptions from '@/components/EmbeddingSelection/LocalAiOptions/index.vue'
import OllamaEmbeddingOptions from '@/components/EmbeddingSelection/OllamaOptions/index.vue'
import LMStudioEmbeddingOptions from '@/components/EmbeddingSelection/LMStudioOptions/index.vue'
import CohereEmbeddingOptions from '@/components/EmbeddingSelection/CohereOptions/index.vue'
import VoyageAiOptions from '@/components/EmbeddingSelection/VoyageAiOptions/index.vue'
import LiteLLMOptions from '@/components/EmbeddingSelection/LiteLLMOptions/index.vue'
import GenericOpenAiEmbeddingOptions from '@/components/EmbeddingSelection/GenericOpenAiOptions/index.vue'
import OpenRouterOptions from '@/components/EmbeddingSelection/OpenRouterOptions/index.vue'
import MistralAiOptions from '@/components/EmbeddingSelection/MistralAiOptions/index.vue'
```

### LLMPreference Imports (40+ logos + 40+ components):
```javascript
// Same core imports as Embedding, PLUS:

// Additional 30+ logos:
import AnthropicLogo from '@/media/llmprovider/anthropic.png'
import NovitaLogo from '@/media/llmprovider/novita.png'
import TogetherAILogo from '@/media/llmprovider/togetherai.png'
import FireworksAILogo from '@/media/llmprovider/fireworksai.jpeg'
import HuggingFaceLogo from '@/media/llmprovider/huggingface.png'
import PerplexityLogo from '@/media/llmprovider/perplexity.png'
import GroqLogo from '@/media/llmprovider/groq.png'
import KoboldCPPLogo from '@/media/llmprovider/koboldcpp.png'
import TextGenWebUILogo from '@/media/llmprovider/text-generation-webui.png'
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
// ... and corresponding 30+ option components

import LLMItem from '@/components/LLMSelection/LLMItem/index.vue'
```

---

## Quick Conversion Checklist

Both files need:

1. ✅ Replace `<script setup>` with Vue imports
2. ✅ Convert all useState to ref()
3. ✅ Convert useEffect to onMounted()
4. ✅ Add computed() for filtered lists
5. ✅ Use @click instead of onClick
6. ✅ Use v-if/v-for instead of && and .map()
7. ✅ Import from '@phosphor-icons/vue'
8. ✅ Use useI18n() instead of useTranslation()
9. ✅ Dynamic component with :is attribute
10. ✅ Form handling with @submit.prevent
11. ✅ CTAButton shows when hasChanges
12. ✅ Search/filter with computed property

**EmbeddingPreference ONLY**:
13. ✅ Add ChangeWarningModal
14. ✅ Check hasEmbeddings and hasCachedEmbeddings
15. ✅ Add embedderModelChanged() function

---

## Estimated Time to Complete

- **EmbeddingPreference**: 30-45 minutes (copy VectorDatabase, update providers/logic)
- **LLMPreference**: 45-60 minutes (same pattern, more providers, no modal)
- **Total**: ~1.5-2 hours for both files

These are the last 2 files to complete the entire 21-file conversion!

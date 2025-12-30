<script setup>
import { ref, onMounted } from 'vue'
import { titleCase, sentenceCase } from 'text-case'
import System from '@/models/system'
import { PROVIDER_PRIVACY_MAP } from './constants'
import AnythingLLMIcon from '@/media/logo/anything-llm-icon.png'
import ProviderPrivacyItem from './ProviderPrivacyItem.vue'

function defaultProvider(providerString) {
  return {
    name: providerString
      ? titleCase(sentenceCase(String(providerString)))
      : 'Unknown',
    description: [
      `"${providerString}" has no known data handling policy defined in AnythingLLM.`
    ],
    logo: AnythingLLMIcon
  }
}

const loading = ref(true)
const providers = ref({
  llmProvider: null,
  embeddingEngine: null,
  vectorDb: null
})

onMounted(async () => {
  const _settings = await System.keys()
  const providerDefinition =
    PROVIDER_PRIVACY_MAP.llm[_settings?.LLMProvider] ||
    defaultProvider(_settings?.LLMProvider)
  const embeddingEngineDefinition =
    PROVIDER_PRIVACY_MAP.embeddingEngine[_settings?.EmbeddingEngine] ||
    defaultProvider(_settings?.EmbeddingEngine)
  const vectorDbDefinition =
    PROVIDER_PRIVACY_MAP.vectorDb[_settings?.VectorDB] ||
    defaultProvider(_settings?.VectorDB)

  providers.value = {
    llmProvider: providerDefinition,
    embeddingEngine: embeddingEngineDefinition,
    vectorDb: vectorDbDefinition
  }
  loading.value = false
})
</script>

<template>
  <div v-if="!loading" class="flex flex-col gap-8 w-full max-w-2xl">
    <ProviderPrivacyItem
      title="LLM Provider"
      :provider="providers.llmProvider"
      altText="LLM Logo"
    />
    <ProviderPrivacyItem
      title="Embedding Preference"
      :provider="providers.embeddingEngine"
      altText="Embedding Logo"
    />
    <ProviderPrivacyItem
      title="Vector Database"
      :provider="providers.vectorDb"
      altText="Vector DB Logo"
    />
  </div>
</template>


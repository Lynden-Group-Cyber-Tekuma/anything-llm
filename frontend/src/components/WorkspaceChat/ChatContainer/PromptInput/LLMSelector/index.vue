<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import PreLoader from '@/components/Preloader'
import ChatModelSelection from './ChatModelSelection/index.vue'
import { useI18n } from 'vue-i18n'
import { PROVIDER_SETUP_EVENT, SAVE_LLM_SELECTOR_EVENT } from './action.vue'
import {
  WORKSPACE_LLM_PROVIDERS,
  autoScrollToSelectedLLMProvider,
  hasMissingCredentials,
  validatedModelSelection,
} from './utils'
import LLMSelectorSidePanel from './LLMSelector/index.vue'
import { NoSetupWarning } from './SetupProvider/index.vue'
import showToast from '@/utils/toast'
import Workspace from '@/models/workspace'
import System from '@/models/system'

const route = useRoute()
const { t } = useI18n()
const slug = computed(() => route.params.slug)

const loading = ref(false)
const settings = ref(null)
const selectedLLMProvider = ref(null)
const selectedLLMModel = ref('')
const availableProviders = ref(WORKSPACE_LLM_PROVIDERS)
const hasChanges = ref(false)
const saving = ref(false)
const missingCredentials = ref(false)

onMounted(() => {
  if (!slug.value) return
  loading.value = true
  Promise.all([Workspace.bySlug(slug.value), System.keys()])
    .then(([workspace, systemSettings]) => {
      const provider = workspace.chatProvider ?? systemSettings.LLMProvider
      const model = workspace.chatModel ?? systemSettings.LLMModel

      settings.value = systemSettings
      selectedLLMProvider.value = provider
      autoScrollToSelectedLLMProvider(provider)
      selectedLLMModel.value = model
    })
    .finally(() => { loading.value = false })
})

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase()
  const filteredProviders = WORKSPACE_LLM_PROVIDERS.filter((provider) =>
    provider.name.toLowerCase().includes(searchTerm)
  )
  availableProviders.value = filteredProviders
}

function handleProviderSelection(provider) {
  selectedLLMProvider.value = provider
  availableProviders.value = WORKSPACE_LLM_PROVIDERS
  autoScrollToSelectedLLMProvider(provider, 50)
  document.getElementById('llm-search-input').value = ''
  hasChanges.value = true
  missingCredentials.value = hasMissingCredentials(settings.value, provider)
}

async function handleSave() {
  saving.value = true
  try {
    hasChanges.value = false
    const validatedModel = validatedModelSelection(selectedLLMModel.value)
    if (!validatedModel) throw new Error('Invalid model selection')

    const { message } = await Workspace.update(slug.value, {
      chatProvider: selectedLLMProvider.value,
      chatModel: validatedModel,
    })

    if (!!message) throw new Error(message)
    window.dispatchEvent(new Event(SAVE_LLM_SELECTOR_EVENT))
  } catch (error) {
    console.error(error)
    showToast(error.message, 'error', { clear: true })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="loading"
    id="llm-selector-modal"
    class="w-full h-[500px] p-0 overflow-y-scroll flex flex-col items-center justify-center"
  >
    <PreLoader :size="12" />
    <p class="text-theme-text-secondary text-sm mt-2">
      {{ t('chat_window.workspace_llm_manager.loading_workspace_settings') }}
    </p>
  </div>

  <!-- Main content -->
  <div
    v-else
    id="llm-selector-modal"
    class="w-full h-[500px] p-0 overflow-y-scroll flex"
  >
    <LLMSelectorSidePanel
      :available-providers="availableProviders"
      :selected-l-l-m-provider="selectedLLMProvider"
      :on-search-change="handleSearch"
      :on-provider-click="handleProviderSelection"
    />
    <div class="w-[60%] h-full px-2 flex flex-col gap-y-2">
      <NoSetupWarning
        :showing="missingCredentials"
        :on-setup-click="() => {
          window.dispatchEvent(
            new CustomEvent(PROVIDER_SETUP_EVENT, {
              detail: {
                provider: WORKSPACE_LLM_PROVIDERS.find(
                  (p) => p.value === selectedLLMProvider
                ),
                settings,
              },
            })
          )
        }"
      />
      <ChatModelSelection
        :provider="selectedLLMProvider"
        :set-has-changes="(val) => { hasChanges = val }"
        :selected-l-l-m-model="selectedLLMModel"
        :set-selected-l-l-m-model="(val) => { selectedLLMModel = val }"
      />
      <button
        v-if="hasChanges"
        type="button"
        :disabled="saving"
        @click="handleSave"
        class="border-none text-xs px-4 py-1 font-semibold light:text-[#ffffff] rounded-lg bg-primary-button hover:bg-secondary hover:text-white h-[34px] whitespace-nowrap w-full"
      >
        {{ saving
          ? t('chat_window.workspace_llm_manager.saving')
          : t('chat_window.workspace_llm_manager.save') }}
      </button>
    </div>
  </div>
</template>

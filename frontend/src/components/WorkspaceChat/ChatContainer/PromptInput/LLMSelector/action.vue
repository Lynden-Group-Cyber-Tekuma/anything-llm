<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { PhBrain, PhCheckCircle } from '@phosphor-icons/vue'
import LLMSelectorModal from './index.vue'
import { useTheme } from '@/hooks/useTheme'
import useUser from '@/hooks/useUser'
import { useModal } from '@/hooks/useModal'
import SetupProvider from './SetupProvider/index.vue'

export const TOGGLE_LLM_SELECTOR_EVENT = 'toggle_llm_selector'
export const SAVE_LLM_SELECTOR_EVENT = 'save_llm_selector'
export const PROVIDER_SETUP_EVENT = 'provider_setup_requested'

const tooltipRef = ref(null)
const { theme } = useTheme()
const { user } = useUser()
const saved = ref(false)
const {
  isOpen: isSetupProviderOpen,
  openModal: openSetupProviderModal,
  closeModal: closeSetupProviderModal,
} = useModal()
const config = ref({
  settings: {},
  provider: null,
})

function toggleLLMSelectorTooltip() {
  if (!tooltipRef.value) return
  tooltipRef.value.isOpen
    ? tooltipRef.value.close()
    : tooltipRef.value.open()
}

function handleSaveLLMSelector() {
  if (!tooltipRef.value) return
  tooltipRef.value.close()
  saved.value = true
}

onMounted(() => {
  window.addEventListener(TOGGLE_LLM_SELECTOR_EVENT, toggleLLMSelectorTooltip)
  window.addEventListener(SAVE_LLM_SELECTOR_EVENT, handleSaveLLMSelector)
})

onUnmounted(() => {
  window.removeEventListener(TOGGLE_LLM_SELECTOR_EVENT, toggleLLMSelectorTooltip)
  window.removeEventListener(SAVE_LLM_SELECTOR_EVENT, handleSaveLLMSelector)
})

watch(saved, (newVal) => {
  if (!newVal) return
  setTimeout(() => {
    saved.value = false
  }, 1500)
})

onMounted(() => {
  function handleProviderSetupEvent(e) {
    const { provider, settings } = e.detail
    config.value = {
      settings,
      provider,
    }
    setTimeout(() => {
      openSetupProviderModal()
    }, 300)
  }

  window.addEventListener(PROVIDER_SETUP_EVENT, handleProviderSetupEvent)
  onUnmounted(() => {
    window.removeEventListener(PROVIDER_SETUP_EVENT, handleProviderSetupEvent)
  })
})

// This feature is disabled for multi-user instances where the user is not an admin
const shouldShow = computed(() => !user.value || user.value.role === 'admin')
</script>

<template>
  <div v-if="shouldShow">
    <div
      id="llm-selector-btn"
      data-tooltip-id="tooltip-llm-selector-btn"
      aria-label="LLM Selector"
      class="border-none relative flex justify-center items-center opacity-60 hover:opacity-100 light:opacity-100 light:hover:opacity-60 cursor-pointer"
    >
      <CheckCircle v-if="saved" class="w-[22px] h-[22px] pointer-events-none text-green-400" />
      <Brain v-else class="w-[22px] h-[22px] pointer-events-none text-[var(--theme-sidebar-footer-icon-fill)]" />
    </div>
    <!-- TODO: Implement with a Vue-compatible tooltip library (e.g., floating-vue, v-tooltip) -->
    <div ref="tooltipRef" class="hidden">
      <LLMSelectorModal :tooltip-ref="tooltipRef" />
    </div>
    <SetupProvider
      :is-open="isSetupProviderOpen"
      :close-modal="closeSetupProviderModal"
      :post-submit="() => closeSetupProviderModal()"
      :settings="config.settings"
      :llm-provider="config.provider"
    />
  </div>
</template>

# Remaining Vue.js Conversions Guide

## Status: 15/21 Files Completed (71%)

### ✅ Completed Conversions (15 files):
1. **ApiKeys** (3 files) - API key management with copy/delete functionality
2. **AudioPreference** (3 files) - STT/TTS provider selection with dynamic components
3. **BrowserExtensionApiKey** (3 files) - Extension API keys with QR code connection
4. **Chats** (3 files) - Chat history with markdown rendering and export (CSV/JSON/JSONL/Alpaca)
5. **MobileConnections** (3 files) - Mobile device management with QR code sync

### 🔄 Remaining Files (6 files):

#### 1. PrivacyAndData (`/src/pages/GeneralSettings/PrivacyAndData/index.vue`)
**Complexity**: Medium
**Key Features**:
- Provider privacy display component
- Telemetry toggle with checkbox
- System settings update

**Conversion Pattern**:
```vue
<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar />
    <div :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }" class="...">
      <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
        <!-- Header -->
        <div class="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
          <p class="text-lg leading-6 font-bold text-theme-text-primary">
            {{ t('privacy.title') }}
          </p>
          <p class="text-xs leading-[18px] font-base text-theme-text-secondary">
            {{ t('privacy.description') }}
          </p>
        </div>

        <!-- Content -->
        <PreLoader v-if="loading" />
        <div v-else class="overflow-x-auto flex flex-col gap-y-6 pt-6">
          <ProviderPrivacy />
          <TelemetryLogs :settings="settings" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import System from '@/models/system'
import showToast from '@/utils/toast'
import PreLoader from '@/components/Preloader/index.vue'
import ProviderPrivacy from '@/components/ProviderPrivacy/index.vue'

const { t } = useI18n()
const settings = ref({})
const loading = ref(true)

onMounted(async () => {
  settings.value = await System.keys()
  loading.value = false
})
</script>

<!-- TelemetryLogs Component (can be in same file or separate) -->
<script>
export const TelemetryLogs = {
  name: 'TelemetryLogs',
  props: { settings: Object },
  setup(props) {
    const { t } = useI18n()
    const telemetry = ref(props.settings?.DisableTelemetry !== 'true')

    const toggleTelemetry = async () => {
      await System.updateSystem({
        DisableTelemetry: !telemetry.value ? 'false' : 'true',
      })
      telemetry.value = !telemetry.value
      showToast(
        `Anonymous Telemetry has been ${!telemetry.value ? 'enabled' : 'disabled'}.`,
        'info',
        { clear: true }
      )
    }

    return { t, telemetry, toggleTelemetry }
  },
  template: `...` // Toggle switch template
}
</script>
```

#### 2. Security (`/src/pages/GeneralSettings/Security/index.vue`)
**Complexity**: High
**Key Features**:
- Multi-user mode setup with form validation
- Password protection toggle
- Password regex validation
- Auth token management on success

**Key State Management**:
```javascript
const saving = ref(false)
const hasChanges = ref(false)
const useMultiUserMode = ref(false)
const multiUserModeEnabled = ref(false)
const usePassword = ref(false)

// Form submission with redirect
const handleSubmit = async (e) => {
  e.preventDefault()
  // ... validation
  const { success, error } = await System.setupMultiUser(data)
  if (success) {
    showToast('Multi-User mode enabled successfully.', 'success')
    setTimeout(() => {
      window.localStorage.removeItem(AUTH_USER)
      window.localStorage.removeItem(AUTH_TOKEN)
      window.localStorage.removeItem(AUTH_TIMESTAMP)
      window.location = paths.settings.users()
    }, 2_000)
  }
}
```

#### 3. LLMPreference (`/src/pages/GeneralSettings/LLMPreference/index.vue`)
**Complexity**: Very High (580 lines)
**Key Features**:
- 40+ LLM provider selection with search
- Dynamic provider options rendering
- Provider-specific configuration forms
- Form data aggregation from multiple inputs

**Architecture**:
```javascript
const AVAILABLE_LLM_PROVIDERS = [
  {
    name: 'OpenAI',
    value: 'openai',
    logo: OpenAiLogo,
    options: OpenAiOptions, // Vue component
    description: '...',
    requiredConfig: ['OpenAiKey']
  },
  // ... 40+ more providers
]

// Search and filter
const filteredLLMs = computed(() => {
  return AVAILABLE_LLM_PROVIDERS.filter((llm) =>
    llm.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Dynamic component rendering
<component
  v-if="selectedLLM && selectedLLMObject"
  :is="selectedLLMObject.options"
  :settings="settings"
/>
```

#### 4. EmbeddingPreference (`/src/pages/GeneralSettings/EmbeddingPreference/index.vue`)
**Complexity**: Very High (390 lines)
**Key Features**:
- 13 embedding provider selection
- Change warning modal (clears all embeddings)
- Model preference change detection
- Form state management

**Critical Logic**:
```javascript
function embedderModelChanged(formEl) {
  const newModel = new FormData(formEl).get('EmbeddingModelPref') ?? null
  return settings.value?.EmbeddingModelPref !== newModel
}

const handleSubmit = async (e) => {
  e.preventDefault()
  if (
    (selectedEmbedder.value !== settings.value?.EmbeddingEngine ||
      embedderModelChanged(e.target)) &&
    hasChanges.value &&
    (hasEmbeddings.value || hasCachedEmbeddings.value)
  ) {
    openModal() // Show warning
  } else {
    await handleSaveSettings()
  }
}
```

#### 5. TranscriptionPreference (`/src/pages/GeneralSettings/TranscriptionPreference/index.vue`)
**Complexity**: Medium (238 lines)
**Key Features**:
- 2 transcription providers (OpenAI, Local)
- Provider selection with search
- Simple form structure

**Similar to AudioPreference** but for transcription:
```vue
<template>
  <form @submit.prevent="handleSubmit" class="flex w-full">
    <!-- Provider selector -->
    <div class="relative">
      <button @click="searchMenuOpen = true" type="button">
        <!-- Selected provider display -->
      </button>
      <div v-if="searchMenuOpen">
        <!-- Search and provider list -->
        <LLMItem
          v-for="provider in filteredProviders"
          :key="provider.name"
          :checked="selectedProvider === provider.value"
          @click="updateProviderChoice(provider.value)"
        />
      </div>
    </div>

    <!-- Dynamic provider options -->
    <component
      :is="selectedProviderObject.options"
      :settings="settings"
    />
  </form>
</template>
```

#### 6. VectorDatabase (`/src/pages/GeneralSettings/VectorDatabase/index.vue`)
**Complexity**: High (342 lines)
**Key Features**:
- 10 vector database providers
- Change warning modal (clears all embeddings)
- Provider-specific configuration
- Similar structure to EmbeddingPreference

**Same pattern as EmbeddingPreference** with ChangeWarningModal.

## Common Conversion Patterns for Large Preference Files

### 1. Provider Selection Pattern
```vue
<!-- Search Menu Toggle -->
<button
  v-if="!searchMenuOpen"
  @click="searchMenuOpen = true"
  type="button"
  class="w-full max-w-[640px] h-[64px] bg-theme-settings-input-bg..."
>
  <div class="flex gap-x-4 items-center">
    <img :src="selectedProviderObject.logo" />
    <div class="flex flex-col text-left">
      <div class="text-sm font-semibold">{{ selectedProviderObject.name }}</div>
      <div class="text-xs">{{ selectedProviderObject.description }}</div>
    </div>
  </div>
  <CaretUpDown />
</button>

<!-- Search Menu -->
<div v-if="searchMenuOpen" class="absolute...">
  <input
    ref="searchInputRef"
    v-model="searchQuery"
    placeholder="Search providers"
    @keydown.enter.prevent
  />
  <LLMItem
    v-for="provider in filteredProviders"
    :key="provider.name"
    @click="updateProviderChoice(provider.value)"
  />
</div>
```

### 2. Form Handling Pattern
```javascript
const hasChanges = ref(false)
const saving = ref(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  const form = e.target
  const data = { ProviderKey: selectedProvider.value }
  const formData = new FormData(form)

  for (const [key, value] of formData.entries()) {
    data[key] = value
  }

  const { error } = await System.updateSystem(data)
  saving.value = true

  if (error) {
    showToast(`Failed to save: ${error}`, 'error')
  } else {
    showToast('Settings saved successfully.', 'success')
  }

  saving.value = false
  hasChanges.value = !!error
}

// Trigger changes on any form input
<div @change="hasChanges = true">
  <!-- Form fields -->
</div>
```

### 3. Save Button Pattern
```vue
<CTAButton
  v-if="hasChanges"
  @click="handleSubmit"
  class="mt-3 mr-0 -mb-14 z-10"
>
  {{ saving ? t('common.saving') : t('common.save') }}
</CTAButton>
```

### 4. Dynamic Component Rendering
```vue
<!-- Provider-specific options -->
<component
  v-if="selectedProvider && selectedProviderObject"
  :is="selectedProviderObject.options"
  :settings="settings"
/>
```

### 5. Search and Filter Pattern
```javascript
const searchQuery = ref('')
const filteredProviders = computed(() => {
  return PROVIDERS.filter((provider) =>
    provider.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
```

## Key Imports for Preference Files

```javascript
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobile } from 'react-device-detect'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import PreLoader from '@/components/Preloader/index.vue'
import { CaretUpDown, MagnifyingGlass, X } from '@phosphor-icons/vue'
import CTAButton from '@/components/lib/CTAButton/index.vue'
import { useModal } from '@/hooks/useModal'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import ChangeWarningModal from '@/components/ChangeWarning/index.vue'

// Provider-specific components
import LLMItem from '@/components/LLMSelection/LLMItem/index.vue'
import EmbedderItem from '@/components/EmbeddingSelection/EmbedderItem/index.vue'
import VectorDBItem from '@/components/VectorDBSelection/VectorDBItem/index.vue'
```

## Testing Checklist

For each converted file, verify:
- [ ] Component renders without errors
- [ ] Data fetches correctly on mount
- [ ] Forms submit and save properly
- [ ] Modals open/close correctly
- [ ] Search/filter functionality works
- [ ] Dynamic components render based on selection
- [ ] Validation works (if applicable)
- [ ] Toast notifications appear
- [ ] Navigation/routing works
- [ ] I18n translations display
- [ ] Icons render from @phosphor-icons/vue
- [ ] Loading states display correctly

## Next Steps

1. Convert PrivacyAndData/index.vue (Simple - toggle + component)
2. Convert Security/index.vue (Complex - 2 forms with validation)
3. Convert TranscriptionPreference/index.vue (Medium - simple provider selection)
4. Convert LLMPreference/index.vue (Very Complex - 40+ providers)
5. Convert EmbeddingPreference/index.vue (Very Complex - warning modal)
6. Convert VectorDatabase/index.vue (Complex - warning modal)

All 6 files follow similar patterns to the already-converted files, just with more providers and options.

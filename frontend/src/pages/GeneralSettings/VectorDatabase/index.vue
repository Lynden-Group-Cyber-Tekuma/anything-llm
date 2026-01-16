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
        id="vectordb-form"
        @submit.prevent="handleSubmit"
        class="flex w-full"
      >
        <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] py-16 md:py-6">
          <div class="w-full flex flex-col gap-y-1 pb-6 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10">
            <div class="flex gap-x-4 items-center">
              <p class="text-lg leading-6 font-bold text-white">
                {{ t('vector.title') }}
              </p>
            </div>
            <p class="text-xs leading-[18px] font-base text-white text-opacity-60">
              {{ t('vector.description') }}
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
            {{ t('vector.provider.title') }}
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
                    name="vdb-search"
                    autocomplete="off"
                    placeholder="Search all vector database providers"
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
                  <VectorDBItem
                    v-for="vdb in filteredVDBs"
                    :key="vdb.name"
                    :name="vdb.name"
                    :value="vdb.value"
                    :image="vdb.logo"
                    :description="vdb.description"
                    :checked="selectedVDB === vdb.value"
                    @click="updateVectorChoice(vdb.value)"
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
                  :src="selectedVDBObject.logo"
                  :alt="`${selectedVDBObject.name} logo`"
                  class="w-10 h-10 rounded-md"
                />
                <div class="flex flex-col text-left">
                  <div class="text-sm font-semibold text-white">
                    {{ selectedVDBObject.name }}
                  </div>
                  <div class="mt-1 text-xs text-description">
                    {{ selectedVDBObject.description }}
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
              v-if="selectedVDB && selectedVDBObject"
              :is="selectedVDBObject.options"
              :settings="settings"
            />
          </div>
        </div>
      </form>
    </div>
    <ModalWrapper :isOpen="isOpen">
      <ChangeWarningModal
        warningText="Switching the vector database will reset all previously embedded documents in all workspaces.\n\nConfirming will clear all embeddings from your vector database and remove all documents from your workspaces. Your uploaded documents will not be deleted, they will be available for re-embedding."
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
import VectorDBItem from '@/components/VectorDBSelection/VectorDBItem/index.vue'

import LanceDbLogo from '@/media/vectordbs/lancedb.png'
import ChromaLogo from '@/media/vectordbs/chroma.png'
import PineconeLogo from '@/media/vectordbs/pinecone.png'
import WeaviateLogo from '@/media/vectordbs/weaviate.png'
import QDrantLogo from '@/media/vectordbs/qdrant.png'
import MilvusLogo from '@/media/vectordbs/milvus.png'
import ZillizLogo from '@/media/vectordbs/zilliz.png'
import AstraDBLogo from '@/media/vectordbs/astraDB.png'
import PGVectorLogo from '@/media/vectordbs/pgvector.png'

import LanceDBOptions from '@/components/VectorDBSelection/LanceDBOptions/index.vue'
import ChromaDBOptions from '@/components/VectorDBSelection/ChromaDBOptions/index.vue'
import ChromaCloudOptions from '@/components/VectorDBSelection/ChromaCloudOptions/index.vue'
import PineconeDBOptions from '@/components/VectorDBSelection/PineconeDBOptions/index.vue'
import WeaviateDBOptions from '@/components/VectorDBSelection/WeaviateDBOptions/index.vue'
import QDrantDBOptions from '@/components/VectorDBSelection/QDrantDBOptions/index.vue'
import MilvusDBOptions from '@/components/VectorDBSelection/MilvusDBOptions/index.vue'
import ZillizCloudOptions from '@/components/VectorDBSelection/ZillizCloudOptions/index.vue'
import AstraDBOptions from '@/components/VectorDBSelection/AstraDBOptions/index.vue'
import PGVectorOptions from '@/components/VectorDBSelection/PGVectorOptions/index.vue'

const VECTOR_DBS = [
  {
    name: 'LanceDB',
    value: 'lancedb',
    logo: LanceDbLogo,
    options: LanceDBOptions,
    description:
      '100% local vector DB that runs on the same instance as AnythingLLM.',
  },
  {
    name: 'PGVector',
    value: 'pgvector',
    logo: PGVectorLogo,
    options: PGVectorOptions,
    description: 'Vector search powered by PostgreSQL.',
  },
  {
    name: 'Chroma',
    value: 'chroma',
    logo: ChromaLogo,
    options: ChromaDBOptions,
    description:
      'Open source vector database you can host yourself or on the cloud.',
  },
  {
    name: 'Chroma Cloud',
    value: 'chromacloud',
    logo: ChromaLogo,
    options: ChromaCloudOptions,
    description:
      'Fully managed Chroma cloud service with enterprise features and support.',
  },
  {
    name: 'Pinecone',
    value: 'pinecone',
    logo: PineconeLogo,
    options: PineconeDBOptions,
    description: '100% cloud-based vector database for enterprise use cases.',
  },
  {
    name: 'Zilliz Cloud',
    value: 'zilliz',
    logo: ZillizLogo,
    options: ZillizCloudOptions,
    description:
      'Cloud hosted vector database built for enterprise with SOC 2 compliance.',
  },
  {
    name: 'QDrant',
    value: 'qdrant',
    logo: QDrantLogo,
    options: QDrantDBOptions,
    description: 'Open source local and distributed cloud vector database.',
  },
  {
    name: 'Weaviate',
    value: 'weaviate',
    logo: WeaviateLogo,
    options: WeaviateDBOptions,
    description:
      'Open source local and cloud hosted multi-modal vector database.',
  },
  {
    name: 'Milvus',
    value: 'milvus',
    logo: MilvusLogo,
    options: MilvusDBOptions,
    description: 'Open-source, highly scalable, and blazing fast.',
  },
  {
    name: 'AstraDB',
    value: 'astra',
    logo: AstraDBLogo,
    options: AstraDBOptions,
    description: 'Vector Search for Real-world GenAI.',
  },
]

const { t } = useI18n()
const saving = ref(false)
const hasChanges = ref(false)
const hasEmbeddings = ref(false)
const settings = ref({})
const loading = ref(true)
const searchQuery = ref('')
const filteredVDBs = ref([])
const selectedVDB = ref(null)
const searchMenuOpen = ref(false)
const searchInputRef = ref(null)
const { isOpen, openModal, closeModal } = useModal()

const selectedVDBObject = computed(() => {
  return VECTOR_DBS.find((vdb) => vdb.value === selectedVDB.value) ?? VECTOR_DBS[0]
})

const handleSubmit = async (e) => {
  if (e) e.preventDefault()
  if (selectedVDB.value !== settings.value?.VectorDB && hasChanges.value && hasEmbeddings.value) {
    openModal()
  } else {
    await handleSaveSettings()
  }
}

const handleSaveSettings = async () => {
  saving.value = true
  const form = document.getElementById('vectordb-form')
  const settingsData = {}
  const formData = new FormData(form)
  settingsData.VectorDB = selectedVDB.value
  for (const [key, value] of formData.entries()) settingsData[key] = value

  const { error } = await System.updateSystem(settingsData)
  if (error) {
    showToast(`Failed to save vector database settings: ${error}`, 'error')
    hasChanges.value = true
  } else {
    showToast('Vector database preferences saved successfully.', 'success')
    hasChanges.value = false
  }
  saving.value = false
  closeModal()
}

const updateVectorChoice = (selection) => {
  searchQuery.value = ''
  selectedVDB.value = selection
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
  selectedVDB.value = _settings?.VectorDB || 'lancedb'
  hasEmbeddings.value = _settings?.HasExistingEmbeddings || false
  loading.value = false
})

computed(() => {
  filteredVDBs.value = VECTOR_DBS.filter((vdb) =>
    vdb.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

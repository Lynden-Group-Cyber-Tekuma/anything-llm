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
        @submit="handleSubmit"
        @change="hasChanges = true"
        class="flex w-full"
        id="text-splitter-chunking-form"
      >
        <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
          <div class="w-full flex flex-col gap-y-1 pb-4 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10">
            <div class="flex gap-x-4 items-center">
              <p class="text-lg leading-6 font-bold text-white">
                {{ t('text.title') }}
              </p>
            </div>
            <p class="text-xs leading-[18px] font-base text-white text-opacity-60">
              {{ t('text.desc-start') }} <br />
              {{ t('text.desc-end') }}
            </p>
          </div>
          <div class="w-full justify-end flex">
            <CTAButton v-if="hasChanges" class="mt-3 mr-0 -mb-14 z-10">
              {{ saving ? t('common.saving') : t('common.save') }}
            </CTAButton>
          </div>

          <div class="flex flex-col gap-y-4 mt-8">
            <div class="flex flex-col max-w-[300px]">
              <div class="flex flex-col gap-y-2 mb-4">
                <label class="text-white text-sm font-semibold block">
                  {{ t('text.size.title') }}
                </label>
                <p class="text-xs text-white/60">
                  {{ t('text.size.description') }}
                </p>
              </div>
              <input
                type="number"
                name="text_splitter_chunk_size"
                :min="1"
                :max="settings?.max_embed_chunk_size || 1000"
                @wheel="(e) => e?.currentTarget?.blur()"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="maximum length of vectorized text"
                :value="isNullOrNaN(settings?.text_splitter_chunk_size) ? 1000 : Number(settings?.text_splitter_chunk_size)"
                required
                autocomplete="off"
              />
              <p class="text-xs text-white/40 mt-2">
                {{ t('text.size.recommend') }}
                {{ numberWithCommas(settings?.max_embed_chunk_size || 1000) }}.
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-y-4 mt-8">
            <div class="flex flex-col max-w-[300px]">
              <div class="flex flex-col gap-y-2 mb-4">
                <label class="text-white text-sm font-semibold block">
                  {{ t('text.overlap.title') }}
                </label>
                <p class="text-xs text-white/60">
                  {{ t('text.overlap.description') }}
                </p>
              </div>
              <input
                type="number"
                name="text_splitter_chunk_overlap"
                :min="0"
                @wheel="(e) => e?.currentTarget?.blur()"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="maximum length of vectorized text"
                :value="isNullOrNaN(settings?.text_splitter_chunk_overlap) ? 20 : Number(settings?.text_splitter_chunk_overlap)"
                required
                autocomplete="off"
              />
            </div>
          </div>
        </div>
      </form>
    </div>

    <ModalWrapper :isOpen="isOpen">
      <ChangeWarningModal
        warningText="Changing text splitter settings will clear any previously cached documents.\n\nThese new settings will be applied to all documents when embedding them into a workspace."
        :onClose="closeModal"
        :onConfirm="handleSaveSettings"
      />
    </ModalWrapper>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import { isMobile } from 'react-device-detect'
import PreLoader from '@/components/Preloader/index.vue'
import CTAButton from '@/components/lib/CTAButton/index.vue'
import Admin from '@/models/admin'
import showToast from '@/utils/toast'
import { numberWithCommas } from '@/utils/numbers'
import { useI18n } from 'vue-i18n'
import { useModal } from '@/hooks/useModal'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import ChangeWarningModal from '@/components/ChangeWarning/index.vue'

function isNullOrNaN(value) {
  if (value === null) return true
  return isNaN(value)
}

const { t } = useI18n()
const settings = ref({})
const loading = ref(true)
const saving = ref(false)
const hasChanges = ref(false)
const { isOpen, openModal, closeModal } = useModal()

const handleSubmit = async (e) => {
  e.preventDefault()
  const form = new FormData(e.target)

  if (
    Number(form.get('text_splitter_chunk_overlap')) >=
    Number(form.get('text_splitter_chunk_size'))
  ) {
    showToast(
      'Chunk overlap cannot be larger or equal to chunk size.',
      'error'
    )
    return
  }

  openModal()
}

const handleSaveSettings = async () => {
  saving.value = true
  try {
    const form = new FormData(
      document.getElementById('text-splitter-chunking-form')
    )
    await Admin.updateSystemPreferences({
      text_splitter_chunk_size: isNullOrNaN(
        form.get('text_splitter_chunk_size')
      )
        ? 1000
        : Number(form.get('text_splitter_chunk_size')),
      text_splitter_chunk_overlap: isNullOrNaN(
        form.get('text_splitter_chunk_overlap')
      )
        ? 1000
        : Number(form.get('text_splitter_chunk_overlap')),
    })
    hasChanges.value = false
    closeModal()
    showToast('Text chunking strategy settings saved.', 'success')
  } catch (error) {
    showToast('Failed to save text chunking strategy settings.', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const _settings = (await Admin.systemPreferences())?.settings
  settings.value = _settings ?? {}
  loading.value = false
})
</script>

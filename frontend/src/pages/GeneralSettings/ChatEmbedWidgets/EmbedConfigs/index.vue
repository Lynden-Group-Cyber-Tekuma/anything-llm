<template>
  <div v-if="loading">
    <Skeleton
      height="80vh"
      width="100%"
      highlightColor="var(--theme-bg-primary)"
      baseColor="var(--theme-bg-secondary)"
      :count="1"
      class="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm"
      containerClass="flex w-full"
    />
  </div>
  <div v-else class="flex flex-col w-full p-4">
    <div class="w-full flex flex-col gap-y-1 pb-6">
      <div class="items-center flex gap-x-4">
        <p class="text-lg leading-6 font-bold text-theme-text-primary">
          {{ t('embeddable.title') }}
        </p>
      </div>

      <div class="flex gap-x-10 mr-8">
        <p class="text-xs leading-[18px] font-base text-theme-text-secondary mt-2">
          {{ t('embeddable.description') }}
        </p>

        <div>
          <CTAButton @click="openModal" class="text-theme-bg-chat">
            <CodeBlock class="h-4 w-4" weight="bold" />
            {{ t('embeddable.create') }}
          </CTAButton>
        </div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-xs text-left rounded-lg min-w-[640px] border-spacing-0">
        <thead class="text-theme-text-secondary text-xs leading-[18px] uppercase border-white/10 border-b">
          <tr>
            <th scope="col" class="px-6 py-3">
              {{ t('embeddable.table.workspace') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('embeddable.table.chats') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('embeddable.table.active') }}
            </th>
            <th scope="col" class="px-6 py-3">
              {{ t('embeddable.table.created') }}
            </th>
            <th scope="col" class="px-6 py-3">
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody>
          <EmbedRow
            v-for="embed in embeds"
            :key="embed.id"
            :embed="embed"
          />
        </tbody>
      </table>
    </div>
    <ModalWrapper :isOpen="isOpen">
      <NewEmbedModal :closeModal="closeModal" />
    </ModalWrapper>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Skeleton from 'vue-loading-skeleton'
import 'vue-loading-skeleton/dist/style.css'
import { CodeBlock } from '@phosphor-icons/vue'
import EmbedRow from './EmbedRow/index.vue'
import NewEmbedModal from './NewEmbedModal/index.vue'
import { useModal } from '@/hooks/useModal'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import Embed from '@/models/embed'
import CTAButton from '@/components/lib/CTAButton/index.vue'

const { isOpen, openModal, closeModal } = useModal()
const { t } = useI18n()
const loading = ref(true)
const embeds = ref([])

onMounted(async () => {
  const _embeds = await Embed.embeds()
  embeds.value = _embeds
  loading.value = false
})
</script>

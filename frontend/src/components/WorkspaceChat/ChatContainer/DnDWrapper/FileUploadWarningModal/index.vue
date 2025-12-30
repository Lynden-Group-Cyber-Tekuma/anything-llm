<script setup>
import { CircleNotch } from '@phosphor-icons/vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import pluralize from 'pluralize'
import { numberWithCommas } from '@/utils/numbers'
import useUser from '@/hooks/useUser'
import { RouterLink } from 'vue-router'
import Paths from '@/utils/paths'
import Workspace from '@/models/workspace'

const props = defineProps({
  show: Boolean,
  onClose: Function,
  onContinue: Function,
  onEmbed: Function,
  tokenCount: Number,
  maxTokens: Number,
  fileCount: {
    type: Number,
    default: 1
  },
  isEmbedding: {
    type: Boolean,
    default: false
  },
  embedProgress: {
    type: Number,
    default: 0
  }
})

const { user } = useUser()
const canEmbed = !user.value || user.value.role !== 'default'
</script>

<template>
  <template v-if="show">
    <ModalWrapper v-if="isEmbedding" :is-open="show">
      <div class="relative max-w-[600px] bg-theme-bg-primary rounded-lg shadow border border-theme-modal-border">
        <div class="p-6 flex flex-col items-center justify-center">
          <p class="text-white text-lg font-semibold mb-4">
            Embedding {{ embedProgress + 1 }} of {{ fileCount }}
            {{ pluralize('file', fileCount) }}
          </p>
          <CircleNotch :size="32" class="animate-spin text-white" />
          <p class="text-white/60 text-sm mt-2">
            Please wait while we embed your files...
          </p>
        </div>
      </div>
    </ModalWrapper>

    <ModalWrapper v-else :is-open="show">
      <div class="relative max-w-[600px] bg-theme-bg-primary rounded-lg shadow border border-theme-modal-border">
        <div class="relative p-6 border-b border-theme-modal-border">
          <div class="w-full flex gap-x-2 items-center">
            <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
              Context Window Warning
            </h3>
          </div>
        </div>

        <div class="py-7 px-9 space-y-4">
          <p class="text-theme-text-primary text-sm">
            Your workspace is using {{ numberWithCommas(tokenCount) }} of
            {{ numberWithCommas(maxTokens) }} available tokens. We recommend keeping
            usage below {{ (Workspace.maxContextWindowLimit * 100).toFixed(0) }}% to
            ensure the best chat experience. Adding {{ fileCount }} more
            {{ pluralize('file', fileCount) }} would exceed this limit.
            <RouterLink
              target="_blank"
              :to="Paths.documentation.contextWindows()"
              class="text-theme-text-secondary text-sm underline"
            >
              Learn more about context windows &rarr;
            </RouterLink>
          </p>
          <p class="text-theme-text-primary text-sm">
            Choose how you would like to proceed with these uploads.
          </p>
        </div>

        <div class="flex w-full justify-between items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
          <button
            @click="onClose"
            type="button"
            class="border-none transition-all duration-300 bg-theme-modal-border text-white hover:opacity-60 px-4 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>
          <div class="flex w-full justify-end items-center space-x-2">
            <button
              @click="onContinue"
              type="button"
              class="border-none transition-all duration-300 bg-theme-modal-border text-white hover:opacity-60 px-4 py-2 rounded-lg text-sm"
            >
              Continue Anyway
            </button>
            <button
              v-if="canEmbed"
              @click="onEmbed"
              :disabled="isEmbedding || !canEmbed"
              type="button"
              class="border-none transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
            >
              Embed {{ pluralize('File', fileCount) }}
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  </template>
</template>

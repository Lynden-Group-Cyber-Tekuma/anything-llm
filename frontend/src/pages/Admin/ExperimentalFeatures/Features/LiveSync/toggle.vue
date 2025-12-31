<script setup>
import { ref } from 'vue'
import System from '@/models/system'
import paths from '@/utils/paths'
import showToast from '@/utils/toast'
import { PhArrowSquareOut } from '@phosphor-icons/vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  enabled: {
    type: Boolean,
    default: false
  },
  onToggle: {
    type: Function,
    required: true
  }
})

const status = ref(props.enabled)

const toggleFeatureFlag = async () => {
  const updated =
    await System.experimentalFeatures.liveSync.toggleFeature(!status.value)
  if (!updated) {
    showToast('Failed to update status of feature.', 'error', {
      clear: true
    })
    return false
  }

  status.value = !status.value
  showToast(
    `Live document content sync has been ${
      !status.value ? 'disabled' : 'enabled'
    }.`,
    'success',
    { clear: true }
  )
  props.onToggle()
}
</script>

<template>
  <div class="p-4">
    <div class="flex flex-col gap-y-6 max-w-[500px]">
      <div class="flex items-center justify-between">
        <h2 class="text-theme-text-primary text-md font-bold">
          Automatic Document Content Sync
        </h2>
        <label class="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            @click="toggleFeatureFlag"
            :checked="status"
            class="peer sr-only pointer-events-none"
          />
          <div class="peer-disabled:opacity-50 pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
        </label>
      </div>
      <div class="flex flex-col space-y-4">
        <p class="text-theme-text-secondary text-sm">
          Enable the ability to specify a document to be "watched". Watched
          document's content will be regularly fetched and updated in
          AnythingLLM.
        </p>
        <p class="text-theme-text-secondary text-sm">
          Watched documents will automatically update in all workspaces they
          are referenced in at the same time of update.
        </p>
        <p class="text-theme-text-secondary text-xs italic">
          This feature only applies to web-based content, such as websites,
          Confluence, YouTube, and GitHub files.
        </p>
      </div>
    </div>
    <div class="mt-8">
      <ul class="space-y-2">
        <li>
          <a
            href="https://docs.anythingllm.com/beta-preview/active-features/live-document-sync"
            target="_blank"
            class="text-sm text-blue-400 light:text-blue-500 hover:underline flex items-center gap-x-1"
          >
            <ArrowSquareOut :size="14" />
            <span>Feature Documentation and Warnings</span>
          </a>
        </li>
        <li>
          <RouterLink
            :to="paths.experimental.liveDocumentSync.manage()"
            class="text-sm text-blue-400 light:text-blue-500 hover:underline"
          >
            Manage Watched Documents &rarr;
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

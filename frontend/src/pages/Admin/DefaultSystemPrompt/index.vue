<script setup>
import { ref, onMounted } from 'vue'
import { isMobile } from 'react-device-detect'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import Highlighter from 'react-highlight-words'
import SettingsSidebar from '@/components/SettingsSidebar'
import System from '@/models/system'
import showToast from '@/utils/toast'
import SystemPromptVariable from '@/models/systemPromptVariable'
import { RouterLink } from 'vue-router'
import paths from '@/utils/paths'

const systemPromptForm = ref({
  value: '',
  default: '',
  isDirty: false,
  isSubmitting: false,
  isLoading: true,
  isEditing: false
})
const saneDefaultSystemPrompt = ref('')
const availableVariables = ref([])

const handleChange = (e) => {
  const value = e.target.value
  const isDirty = value !== systemPromptForm.value.default

  systemPromptForm.value = {
    ...systemPromptForm.value,
    value,
    isDirty,
    isSubmitting: false
  }
}

const handleSubmit = async (e) => {
  e.preventDefault()
  systemPromptForm.value.isSubmitting = true

  const newSystemPrompt = systemPromptForm.value.value.trim()
  try {
    const { success, message } = await System.updateDefaultSystemPrompt(newSystemPrompt)
    if (!success) throw new Error(message)

    // If the user has set the default system prompt to the sane default, reset the value to the sane default.
    if (
      !newSystemPrompt ||
      newSystemPrompt.trim() === saneDefaultSystemPrompt.value
    ) {
      systemPromptForm.value.value = saneDefaultSystemPrompt.value
      return
    }

    showToast('Default system prompt updated successfully.', 'success')
    systemPromptForm.value.default = newSystemPrompt
    systemPromptForm.value.isDirty = false
    systemPromptForm.value.isSubmitting = false
  } catch (error) {
    showToast(
      `Failed to update default system prompt: ${error.message}`,
      'error'
    )
    systemPromptForm.value.isSubmitting = false
  }
}

onMounted(async () => {
  // Setup variable highlighting
  const { variables } = await SystemPromptVariable.getAll()
  availableVariables.value = variables

  // Fetch default system prompt
  systemPromptForm.value.isLoading = true
  const { defaultSystemPrompt, saneDefaultSystemPrompt: saneDefault } =
    await System.fetchDefaultSystemPrompt()
  saneDefaultSystemPrompt.value = saneDefault

  if (!defaultSystemPrompt) {
    systemPromptForm.value.isLoading = false
    return
  }

  systemPromptForm.value = {
    ...systemPromptForm.value,
    default: defaultSystemPrompt,
    value: defaultSystemPrompt,
    isLoading: false
  }
})
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <SettingsSidebar />
    <div
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
    >
      <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
        <div class="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
          <div class="items-center flex gap-x-4">
            <p class="text-lg leading-6 font-bold text-theme-text-primary">
              Default System Prompt
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-theme-text-secondary">
            This is the default system prompt that will be used for new
            workspaces.
          </p>
        </div>
        <div>
          <div v-if="systemPromptForm.isLoading" class="mt-8 flex flex-col gap-y-4">
            <Skeleton
              :height="20"
              :width="160"
              highlightColor="var(--theme-bg-primary)"
              baseColor="var(--theme-bg-secondary)"
            />
            <Skeleton
              :height="120"
              width="100%"
              highlightColor="var(--theme-bg-primary)"
              baseColor="var(--theme-bg-secondary)"
              class="rounded-lg"
            />
            <Skeleton
              :height="36"
              :width="140"
              highlightColor="var(--theme-bg-primary)"
              baseColor="var(--theme-bg-secondary)"
            />
          </div>
          <div v-else class="mt-6">
            <form @submit="handleSubmit" class="space-y-3">
              <label
                for="default-system-prompt"
                class="text-base font-bold text-white"
              >
                System Prompt
              </label>
              <div class="space-y-1">
                <p class="text-white text-opacity-60 text-xs font-medium">
                  A system prompt provides instructions that shape the AI's
                  responses and behavior. This prompt will be automatically
                  applied to all newly created workspaces. To change the
                  system prompt of a{" "}
                  <span class="font-bold">specific workspace</span>,
                  edit the prompt in the{" "}
                  <span class="font-bold">workspace settings</span>. To
                  restore the system prompt to our sane default, leave this
                  field empty and save changes.
                </p>
                <p class="text-white text-opacity-60 text-xs font-medium mb-2">
                  You can insert{" "}
                  <RouterLink
                    :to="paths.settings.systemPromptVariables()"
                    class="text-primary-button"
                  >
                    system prompt variables
                  </RouterLink>{" "}
                  like:{" "}
                  <template v-for="(v, i) in availableVariables.slice(0, 3)" :key="v.key">
                    <span class="bg-theme-settings-input-bg px-1 py-0.5 rounded">
                      {{ `{${v.key}}` }}
                    </span>
                    <template v-if="i < availableVariables.length - 1">, </template>
                  </template>
                  <RouterLink
                    v-if="availableVariables.length > 3"
                    :to="paths.settings.systemPromptVariables()"
                    class="text-primary-button"
                  >
                    +{{ availableVariables.length - 3 }} more...
                  </RouterLink>
                </p>
              </div>

              <textarea
                v-if="systemPromptForm.isEditing"
                :value="systemPromptForm.value"
                @input="handleChange"
                @blur="systemPromptForm.isEditing = false"
                :placeholder="
                  systemPromptForm.isLoading
                    ? 'Loading...'
                    : 'You are an AI assistant that can answer questions and help with tasks.'
                "
                :rows="5"
                :style="{
                  resize: 'vertical',
                  overflowY: 'scroll',
                  minHeight: '150px'
                }"
                class="w-full border-none bg-theme-settings-input-bg placeholder:text-theme-settings-input-placeholder text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block p-2.5"
                autofocus
              />
              <div
                v-else
                @click="systemPromptForm.isEditing = true"
                :style="{
                  resize: 'vertical',
                  overflowY: 'scroll',
                  minHeight: '150px'
                }"
                class="w-full border-none bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block p-2.5 cursor-text"
              >
                <Highlighter
                  class="whitespace-pre-wrap"
                  highlightClassName="bg-cta-button p-0.5 rounded-md"
                  :searchWords="availableVariables.map((v) => `{${v.key}}`)"
                  :autoEscape="true"
                  :caseSensitive="true"
                  :textToHighlight="systemPromptForm.value || ''"
                />
              </div>
              <button
                :disabled="
                  !systemPromptForm.isDirty || systemPromptForm.isSubmitting
                "
                class="enabled:hover:bg-secondary enabled:hover:text-white rounded-lg bg-primary-button w-fit py-2 px-4 font-semibold text-xs disabled:opacity-20 disabled:cursor-not-allowed"
                type="submit"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

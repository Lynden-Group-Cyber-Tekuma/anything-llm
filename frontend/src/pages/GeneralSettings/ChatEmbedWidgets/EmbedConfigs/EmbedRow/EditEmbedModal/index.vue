<template>
  <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
    <div class="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            Update embed #{{ embed.id }}
          </h3>
        </div>
        <button
          @click="closeModal"
          type="button"
          class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
        >
          <X :size="24" weight="bold" class="text-white" />
        </button>
      </div>
      <div class="px-7 py-6">
        <form @submit="handleUpdate">
          <div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <WorkspaceSelection :defaultValue="embed.workspace.id" />
            <ChatModeSelection :defaultValue="embed.chat_mode" />
            <PermittedDomains
              :defaultValue="safeJsonParse(embed.allowlist_domains, null) || []"
            />
            <NumberInput
              name="max_chats_per_day"
              title="Max chats per day"
              hint="Limit the amount of chats this embedded chat can process in a 24 hour period. Zero is unlimited."
              :defaultValue="embed.max_chats_per_day"
            />
            <NumberInput
              name="max_chats_per_session"
              title="Max chats per session"
              hint="Limit the amount of chats a session user can send with this embed in a 24 hour period. Zero is unlimited."
              :defaultValue="embed.max_chats_per_session"
            />
            <NumberInput
              name="message_limit"
              title="Message History Limit"
              hint="The number of previous messages to include in the chat context. Default is 20."
              :defaultValue="embed.message_limit"
            />
            <BooleanInput
              name="allow_model_override"
              title="Enable dynamic model use"
              hint="Allow setting of the preferred LLM model to override the workspace default."
              :defaultValue="embed.allow_model_override"
            />
            <BooleanInput
              name="allow_temperature_override"
              title="Enable dynamic LLM temperature"
              hint="Allow setting of the LLM temperature to override the workspace default."
              :defaultValue="embed.allow_temperature_override"
            />
            <BooleanInput
              name="allow_prompt_override"
              title="Enable Prompt Override"
              hint="Allow setting of the system prompt to override the workspace default."
              :defaultValue="embed.allow_prompt_override"
            />

            <p v-if="error" class="text-red-400 text-sm">Error: {{ error }}</p>
            <p class="text-white text-opacity-60 text-xs md:text-sm">
              After creating an embed you will be provided a link that you can
              publish on your website with a simple
              <code class="border-none bg-theme-settings-input-bg text-white mx-1 px-1 rounded-sm">
                &lt;script&gt;
              </code>
              tag.
            </p>
          </div>
          <div class="flex justify-between items-center mt-6 pt-6 border-t border-theme-modal-border">
            <button
              @click="closeModal"
              type="button"
              class="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
            >
              Update embed
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PhX } from '@phosphor-icons/vue'
import {
  BooleanInput,
  ChatModeSelection,
  NumberInput,
  PermittedDomains,
  WorkspaceSelection,
  enforceSubmissionSchema,
} from '../../NewEmbedModal/index.vue'
import Embed from '@/models/embed'
import showToast from '@/utils/toast'
import { safeJsonParse } from '@/utils/request'

const props = defineProps({
  embed: {
    type: Object,
    required: true
  },
  closeModal: {
    type: Function,
    required: true
  }
})

const error = ref(null)

const handleUpdate = async (e) => {
  error.value = null
  e.preventDefault()
  const form = new FormData(e.target)
  const data = enforceSubmissionSchema(form)
  const { success, error: updateError } = await Embed.updateEmbed(props.embed.id, data)
  if (success) {
    showToast('Embed updated successfully.', 'success', { clear: true })
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }
  error.value = updateError
}
</script>

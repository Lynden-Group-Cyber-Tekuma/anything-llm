<script setup>
import { ref, onMounted } from 'vue'
import EditingChatBubble from '@/components/EditingChatBubble/index.vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { PhPlus } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const hasChanges = ref(false)
const messages = ref([])

onMounted(async () => {
  const fetchedMessages = await System.getWelcomeMessages()
  messages.value = fetchedMessages
})

const addMessage = (type) => {
  if (type === 'user') {
    messages.value = [
      ...messages.value,
      {
        user: t('customization.items.welcome-messages.double-click'),
        response: '',
      },
    ]
  } else {
    messages.value = [
      ...messages.value,
      {
        user: '',
        response: t('customization.items.welcome-messages.double-click'),
      },
    ]
  }
}

const removeMessage = (index) => {
  hasChanges.value = true
  messages.value = messages.value.filter((_, i) => i !== index)
}

const handleMessageChange = (index, type, value) => {
  hasChanges.value = true
  const newMessages = [...messages.value]
  newMessages[index][type] = value
  messages.value = newMessages
}

const handleMessageSave = async () => {
  const { success, error } = await System.setWelcomeMessages(messages.value)
  if (!success) {
    showToast(`Failed to update welcome messages: ${error}`, 'error')
    return
  }
  showToast('Successfully updated welcome messages.', 'success')
  hasChanges.value = false
}
</script>

<template>
  <div class="flex flex-col gap-y-0.5 my-4">
    <p class="text-sm leading-6 font-semibold text-white">
      {{ t('customization.items.welcome-messages.title') }}
    </p>
    <p class="text-xs text-white/60">
      {{ t('customization.items.welcome-messages.description') }}
    </p>
    <div class="mt-2 flex flex-col gap-y-6 bg-theme-settings-input-bg rounded-lg pr-[31px] pl-[12px] pt-4 max-w-[700px]">
      <div v-for="(message, index) in messages" :key="index" class="flex flex-col gap-y-2">
        <EditingChatBubble
          v-if="message.user"
          :message="message"
          :index="index"
          type="user"
          :handleMessageChange="handleMessageChange"
          :removeMessage="removeMessage"
        />
        <EditingChatBubble
          v-if="message.response"
          :message="message"
          :index="index"
          type="response"
          :handleMessageChange="handleMessageChange"
          :removeMessage="removeMessage"
        />
      </div>
      <div class="flex gap-4 mt-12 justify-between pb-[15px]">
        <button
          class="border-none self-end text-white hover:text-white/60 light:hover:text-black/60 transition"
          @click="addMessage('response')"
        >
          <div class="flex items-center justify-start text-sm font-normal -ml-2">
            <Plus class="m-2" :size="16" weight="bold" />
            <span class="leading-5">
              {{ t('customization.items.welcome-messages.new') }}
              <span class="font-bold italic mr-1">
                {{ t('customization.items.welcome-messages.system') }}
              </span>
              {{ t('customization.items.welcome-messages.message') }}
            </span>
          </div>
        </button>
        <button
          class="border-none self-end text-white hover:text-white/60 light:hover:text-black/60 transition"
          @click="addMessage('user')"
        >
          <div class="flex items-center justify-start text-sm font-normal">
            <Plus class="m-2" :size="16" weight="bold" />
            <span class="leading-5">
              {{ t('customization.items.welcome-messages.new') }}
              <span class="font-bold italic mr-1">
                {{ t('customization.items.welcome-messages.user') }}
              </span>
              {{ t('customization.items.welcome-messages.message') }}
            </span>
          </div>
        </button>
      </div>
    </div>
    <div v-if="hasChanges" class="flex justify-start pt-2">
      <button
        class="transition-all duration-300 border border-slate-200 px-4 py-2 rounded-lg text-white text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 focus:ring-gray-800"
        @click="handleMessageSave"
      >
        {{ t('customization.items.welcome-messages.save') }}
      </button>
    </div>
  </div>
</template>

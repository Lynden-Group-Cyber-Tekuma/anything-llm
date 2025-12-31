<script setup>
import { ref, computed } from 'vue'
import { PhX } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'
import renderMarkdown from '@/utils/chat/markdown'
import DOMPurify from '@/utils/chat/purify'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  handleMessageChange: {
    type: Function,
    required: true
  },
  removeMessage: {
    type: Function,
    required: true
  }
})

const { t } = useI18n()

const isEditing = ref(false)
const tempMessage = ref(props.message[props.type])
const isUser = computed(() => props.type === 'user')

const sanitizedHtml = computed(() => {
  return tempMessage.value ? DOMPurify.sanitize(renderMarkdown(tempMessage.value)) : ''
})

const handleBlur = () => {
  props.handleMessageChange(props.index, props.type, tempMessage.value)
  isEditing.value = false
}

const buttonStyle = computed(() => {
  const style = { top: '6px' }
  if (isUser.value) {
    style.right = '290px'
  } else {
    style.left = '290px'
  }
  return style
})
</script>

<template>
  <div>
    <p
      :class="[
        'text-xs text-white light:text-black/80',
        isUser ? 'text-right' : ''
      ]"
    >
      {{ isUser ? t('common.user') : t('customization.items.welcome-messages.assistant') }}
    </p>
    <div
      :class="[
        'relative flex w-full mt-2 items-start',
        isUser ? 'justify-end' : 'justify-start'
      ]"
    >
      <button
        :class="[
          'transition-all duration-300 absolute z-10 text-white rounded-full hover:bg-neutral-700 light:hover:invert hover:border-white border-transparent border shadow-lg',
          isUser ? 'right-0 mr-2' : 'ml-2'
        ]"
        :style="buttonStyle"
        @click="removeMessage(index)"
      >
        <X class="m-0.5" :size="20" />
      </button>
      <div
        :class="[
          'p-2 max-w-full md:w-[290px] text-black rounded-[8px]',
          isUser ? 'bg-[#41444C] text-white' : 'bg-[#2E3036] text-white'
        ]"
        @dblclick="isEditing = true"
      >
        <input
          v-if="isEditing"
          v-model="tempMessage"
          :class="[
            'w-full light:text-white',
            isUser ? 'bg-[#41444C] text-white' : 'bg-[#2E3036] text-white'
          ]"
          @blur="handleBlur"
          autofocus
        />
        <div
          v-else-if="tempMessage"
          class="markdown font-[500] md:font-semibold text-sm md:text-base break-words light:invert"
          v-html="sanitizedHtml"
        />
      </div>
    </div>
  </div>
</template>

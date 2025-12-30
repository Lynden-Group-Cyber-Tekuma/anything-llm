<script setup>
import { computed } from 'vue'
import UserIcon from '../UserIcon/index.vue'
import { userFromStorage } from '@/utils/request'
import renderMarkdown from '@/utils/chat/markdown'
import DOMPurify from '@/utils/chat/purify'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  popMsg: {
    type: Function,
    default: null
  }
})

const isUser = computed(() => props.type === 'user')

const sanitizedHtml = computed(() => {
  return DOMPurify.sanitize(renderMarkdown(props.message))
})
</script>

<template>
  <div class="flex justify-center items-end w-full bg-theme-bg-secondary">
    <div class="py-8 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col">
      <div class="flex gap-x-5">
        <UserIcon
          :role="type"
        />

        <div
          class="markdown whitespace-pre-line text-white font-normal text-sm md:text-sm flex flex-col gap-y-1 mt-2"
          v-html="sanitizedHtml"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useChatMessageAlignment } from '@/hooks/useChatMessageAlignment'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { msgDirection, setMsgDirection } = useChatMessageAlignment()
</script>

<template>
  <div class="flex flex-col gap-y-0.5 my-4">
    <p class="text-sm leading-6 font-semibold text-white">
      {{ t('customization.items.chat-message-alignment.title') }}
    </p>
    <p class="text-xs text-white/60">
      {{ t('customization.items.chat-message-alignment.description') }}
    </p>
    <div class="flex flex-row flex-wrap gap-x-4 pt-1 gap-y-4 md:gap-y-0">
      <ItemDirection
        :active="msgDirection === 'left'"
        :reverse="false"
        msg="User and AI messages are aligned to the left (default)"
        @select="setMsgDirection('left')"
      />
      <ItemDirection
        :active="msgDirection === 'left_right'"
        :reverse="true"
        msg="User and AI messages are distributed left and right alternating each message"
        @select="setMsgDirection('left_right')"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

const ItemDirection = defineComponent({
  name: 'ItemDirection',
  props: {
    active: {
      type: Boolean,
      required: true
    },
    reverse: {
      type: Boolean,
      required: true
    },
    msg: {
      type: String,
      required: true
    }
  },
  emits: ['select'],
  template: `
    <button
      type="button"
      :title="msg"
      :class="[
        'flex:1 p-4 bg-transparent hover:light:bg-gray-100 hover:bg-gray-700/20 rounded-xl border w-[250px]',
        active ? 'border-primary-button' : 'border-theme-sidebar-border'
      ]"
      @click="$emit('select')"
    >
      <div class="space-y-4">
        <div
          v-for="index in 3"
          :key="index"
          :class="[
            'flex items-center justify-end gap-2',
            reverse && (index - 1) % 2 === 0 ? 'flex-row-reverse' : ''
          ]"
        >
          <div
            :class="[
              'w-4 h-4 rounded-full flex-shrink-0',
              (index - 1) % 2 === 0 ? 'bg-primary-button' : 'bg-white light:bg-black'
            ]"
          />
          <div class="bg-gray-600 light:bg-gray-200 rounded-2xl px-4 py-2 h-[20px] w-full" />
        </div>
      </div>
    </button>
  `
})

export { ItemDirection }
</script>

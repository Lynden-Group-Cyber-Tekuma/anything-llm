<script setup>
import { ref, onMounted, computed } from 'vue'
import { PhCaretDown, PhCaretUp } from '@phosphor-icons/vue'
import { safeJsonParse } from '@/utils/request'

const props = defineProps({
  log: {
    type: Object,
    required: true
  }
})

const expanded = ref(false)
const metadata = ref(null)
const hasMetadata = ref(false)

const parseAndSetMetadata = () => {
  const data = safeJsonParse(props.log.metadata, {})
  hasMetadata.value = Object.keys(data)?.length > 0
  metadata.value = data
}

const handleRowClick = () => {
  if (props.log.metadata !== '{}') {
    expanded.value = !expanded.value
  }
}

const colorTheme = computed(() => {
  const event = props.log.event
  let theme = {
    bg: 'bg-sky-600/20',
    text: 'text-sky-400 light:text-sky-800'
  }

  if (event.includes('update')) {
    theme = {
      bg: 'bg-yellow-600/20',
      text: 'text-yellow-400 light:text-yellow-800'
    }
  }
  if (event.includes('failed_') || event.includes('deleted')) {
    theme = {
      bg: 'bg-red-600/20',
      text: 'text-red-400 light:text-red-800'
    }
  }
  if (event === 'login_event') {
    theme = {
      bg: 'bg-green-600/20',
      text: 'text-green-400 light:text-green-800'
    }
  }

  return theme
})

onMounted(() => {
  parseAndSetMetadata()
})
</script>

<template>
  <template>
    <tr
      @click="handleRowClick"
      :class="[
        'bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10',
        hasMetadata ? 'cursor-pointer hover:bg-white/5' : ''
      ]"
    >
      <td class="px-6 py-2 font-medium whitespace-nowrap text-white flex items-center">
        <span
          :class="[
            'rounded-full px-2 py-0.5 text-xs font-medium shadow-sm',
            colorTheme.bg,
            colorTheme.text
          ]"
        >
          {{ log.event }}
        </span>
      </td>
      <td class="px-6 border-transparent transform transition-transform duration-200">
        {{ log.user.username }}
      </td>
      <td class="px-6 border-transparent transform transition-transform duration-200">
        {{ log.occurredAt }}
      </td>
      <td v-if="hasMetadata" class="px-6">
        <div class="mt-1">
          <div
            v-if="expanded"
            class="px-2 gap-x-1 flex items-center justify-center transform transition-transform duration-200"
          >
            <CaretUp weight="bold" :size="20" />
            <p class="text-xs text-white/50 w-[20px]">hide</p>
          </div>
          <div
            v-else
            class="px-2 gap-x-1 flex items-center justify-center transform transition-transform duration-200"
          >
            <CaretDown weight="bold" :size="20" />
            <p class="text-xs text-white/50 w-[20px]">show</p>
          </div>
        </div>
      </td>
    </tr>
    <tr v-if="metadata && expanded" class="bg-theme-bg-primary">
      <td
        colspan="2"
        class="px-6 py-4 font-medium text-theme-text-primary rounded-l-2xl"
      >
        Event Metadata
      </td>
      <td colspan="4" class="px-6 py-4 rounded-r-2xl">
        <div class="w-full rounded-lg bg-theme-bg-secondary p-2 text-white shadow-sm border-white/10 border bg-opacity-10">
          <pre class="overflow-scroll">{{ JSON.stringify(metadata, null, 2) }}</pre>
        </div>
      </td>
    </tr>
  </template>
</template>

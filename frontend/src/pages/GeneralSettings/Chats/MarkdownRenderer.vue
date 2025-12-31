<template>
  <div class="whitespace-normal">
    <template v-for="(part, index) in parts" :key="index">
      <ThoughtBubble v-if="part.type === 'think'" :thought="part.text" />
      <div
        v-else
        v-html="sanitize(md.render(part.text))"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import DOMPurify from '@/utils/chat/purify'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const md = new MarkdownIt({
  html: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return '' // use external default escaping
  },
})

function parseContent(content) {
  const parts = []
  let lastIndex = 0
  content.replace(/<think>([^]*?)<\/think>/g, (match, thinkContent, offset) => {
    if (offset > lastIndex) {
      parts.push({ type: 'normal', text: content.slice(lastIndex, offset) })
    }
    parts.push({ type: 'think', text: thinkContent })
    lastIndex = offset + match.length
  })
  if (lastIndex < content.length) {
    parts.push({ type: 'normal', text: content.slice(lastIndex) })
  }
  return parts
}

const parts = computed(() => {
  if (!props.content) return []
  return parseContent(props.content)
})

const sanitize = (html) => DOMPurify.sanitize(html)
</script>

<script>
import { ref } from 'vue'
import { CaretDown } from '@phosphor-icons/vue'

export const ThoughtBubble = {
  name: 'ThoughtBubble',
  props: {
    thought: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const isExpanded = ref(false)

    const cleanThought = computed(() => {
      if (!props.thought) return null
      const cleaned = props.thought.replace(/<\/?think>/g, '').trim()
      return cleaned || null
    })

    return {
      isExpanded,
      cleanThought
    }
  },
  template: `
    <div v-if="cleanThought" class="mb-3">
      <div
        @click="isExpanded = !isExpanded"
        class="cursor-pointer flex items-center gap-x-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors mb-2"
      >
        <CaretDown
          :size="14"
          weight="bold"
          :class="['transition-transform', isExpanded ? 'rotate-180' : '']"
        />
        <span class="text-xs font-medium">View thoughts</span>
      </div>
      <div
        v-if="isExpanded"
        class="bg-theme-bg-chat-input rounded-md p-3 border-l-2 border-theme-text-secondary/30"
      >
        <div class="text-xs text-theme-text-secondary font-mono whitespace-pre-wrap">
          {{ cleanThought }}
        </div>
      </div>
    </div>
  `,
  components: { CaretDown }
}
</script>

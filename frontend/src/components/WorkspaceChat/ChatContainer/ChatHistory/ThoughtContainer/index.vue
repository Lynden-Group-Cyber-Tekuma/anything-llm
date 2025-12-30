<script setup>
import { ref, computed, watch } from 'vue'
import renderMarkdown from '@/utils/chat/markdown'
import { CaretDown } from '@phosphor-icons/vue'
import DOMPurify from 'dompurify'
import { isMobile } from 'react-device-detect'
import ThinkingAnimation from '@/media/animations/thinking-animation.webm'
import ThinkingStatic from '@/media/animations/thinking-static.png'

const THOUGHT_KEYWORDS = ['thought', 'thinking', 'think', 'thought_chain']
const CLOSING_TAGS = [...THOUGHT_KEYWORDS, 'response', 'answer']

export const THOUGHT_REGEX_OPEN = new RegExp(
  THOUGHT_KEYWORDS.map((keyword) => `<${keyword}\\s*(?:[^>]*?)?\\s*>`).join('|')
)
export const THOUGHT_REGEX_CLOSE = new RegExp(
  CLOSING_TAGS.map((keyword) => `</${keyword}\\s*(?:[^>]*?)?>`).join('|')
)
export const THOUGHT_REGEX_COMPLETE = new RegExp(
  THOUGHT_KEYWORDS.map(
    (keyword) =>
      `<${keyword}\\s*(?:[^>]*?)?\\s*>[\\s\\S]*?<\\/${keyword}\\s*(?:[^>]*?)?>`
  ).join('|')
)

const THOUGHT_PREVIEW_LENGTH = isMobile ? 25 : 50

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  expanded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update-content'])

const localContent = ref(props.content)
const hasReadableContent = ref(contentIsNotEmpty(props.content))
const isExpanded = ref(props.expanded)

watch(() => props.content, (newContent) => {
  localContent.value = newContent
  hasReadableContent.value = contentIsNotEmpty(newContent)
})

/**
 * Checks if the content has readable content.
 * @param {string} content - The content to check.
 * @returns {boolean} - Whether the content has readable content.
 */
function contentIsNotEmpty(content = '') {
  return (
    content
      ?.trim()
      ?.replace(THOUGHT_REGEX_OPEN, '')
      ?.replace(THOUGHT_REGEX_CLOSE, '')
      ?.replace(/[\n\s]/g, '')?.length > 0
  )
}

// Expose updateContent method for parent components
const updateContent = (newContent) => {
  localContent.value = newContent
  hasReadableContent.value = contentIsNotEmpty(newContent)
  emit('update-content', newContent)
}

defineExpose({
  updateContent
})

const isThinking = computed(() => {
  return localContent.value.match(THOUGHT_REGEX_OPEN) && !localContent.value.match(THOUGHT_REGEX_CLOSE)
})

const isComplete = computed(() => {
  return (
    localContent.value.match(THOUGHT_REGEX_COMPLETE) ||
    localContent.value.match(THOUGHT_REGEX_CLOSE)
  )
})

const tagStrippedContent = computed(() => {
  return localContent.value
    .replace(THOUGHT_REGEX_OPEN, '')
    .replace(THOUGHT_REGEX_CLOSE, '')
})

const autoExpand = computed(() => {
  return isThinking.value && tagStrippedContent.value.length > THOUGHT_PREVIEW_LENGTH
})

const canExpand = computed(() => {
  return tagStrippedContent.value.length > THOUGHT_PREVIEW_LENGTH
})

function handleExpandClick() {
  if (!canExpand.value) return
  isExpanded.value = !isExpanded.value
}

const sanitizedContent = computed(() => {
  return DOMPurify.sanitize(
    isExpanded.value || autoExpand.value
      ? renderMarkdown(tagStrippedContent.value)
      : tagStrippedContent.value
  )
})
</script>

<template>
  <div v-if="localContent && localContent.length && hasReadableContent" class="flex justify-start items-end transition-all duration-200 w-full md:max-w-[800px]">
    <div class="pb-2 w-full flex gap-x-5 flex-col relative">
      <div
        style="transition: all 0.1s ease-in-out; border-radius: 6px"
        :class="`${isExpanded || autoExpand ? '' : `${canExpand ? 'hover:bg-theme-sidebar-item-hover' : ''}`} items-start bg-theme-bg-chat-input py-2 px-4 flex gap-x-2`"
      >
        <div
          :class="`w-7 h-7 flex justify-center flex-shrink-0 ${!isExpanded && !autoExpand ? 'items-center' : 'items-start pt-[2px]'}`"
        >
          <template v-if="isThinking || isComplete">
            <video
              autoplay
              loop
              muted
              playsinline
              :class="`w-7 h-7 transition-opacity duration-200 light:invert light:opacity-50 ${isThinking ? 'opacity-100' : 'opacity-0 hidden'}`"
              data-tooltip-id="cot-thinking"
              data-tooltip-content="Model is thinking..."
              aria-label="Model is thinking..."
            >
              <source :src="ThinkingAnimation" type="video/webm" />
            </video>
            <img
              :src="ThinkingStatic"
              alt="Thinking complete"
              :class="`w-6 h-6 transition-opacity duration-200 light:invert light:opacity-50 ${!isThinking && isComplete ? 'opacity-100' : 'opacity-0 hidden'}`"
              data-tooltip-id="cot-thinking"
              data-tooltip-content="Model has finished thinking"
              aria-label="Model has finished thinking"
            />
          </template>
        </div>
        <div class="flex-1 min-w-0">
          <div
            :class="`overflow-hidden transition-all transform duration-300 ease-in-out origin-top ${isExpanded || autoExpand ? '' : 'max-h-6'}`"
          >
            <div
              :class="`text-theme-text-secondary font-mono leading-6 ${isExpanded || autoExpand ? '-ml-[5.5px] -mt-[4px]' : 'mt-[2px]'}`"
            >
              <span
                :class="`block w-full ${!isExpanded && !autoExpand ? 'truncate' : ''}`"
                v-html="sanitizedContent"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-x-2">
          <button
            v-if="!autoExpand && canExpand"
            @click="handleExpandClick"
            data-tooltip-id="expand-cot"
            :data-tooltip-content="isExpanded ? 'Hide thought chain' : 'Show thought chain'"
            class="border-none text-theme-text-secondary hover:text-theme-text-primary transition-colors p-1 rounded-full hover:bg-theme-sidebar-item-hover"
            :aria-label="isExpanded ? 'Hide thought chain' : 'Show thought chain'"
          >
            <CaretDown
              :class="`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

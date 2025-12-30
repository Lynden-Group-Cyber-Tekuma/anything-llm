<script setup>
import { ref } from 'vue'
import { CaretDown } from '@phosphor-icons/vue'
import AgentAnimation from '@/media/animations/agent-animation.webm'
import AgentStatic from '@/media/animations/agent-static.png'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isThinking: {
    type: Boolean,
    default: false
  }
})

const isExpanded = ref(false)

const currentThought = props.messages[props.messages.length - 1]
const previousThoughts = props.messages.slice(0, -1)

function handleExpandClick() {
  if (!previousThoughts.length > 0) return
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="flex justify-center w-full">
    <div class="w-full max-w-[80%] flex flex-col">
      <div class="w-full max-w-[800px]">
        <div
          @click="handleExpandClick"
          style="border-radius: 6px"
          :class="`${!previousThoughts?.length ? '' : `${previousThoughts?.length ? 'hover:bg-theme-sidebar-item-hover' : ''}`} items-start bg-theme-bg-chat-input py-2 px-4 flex gap-x-2`"
        >
          <div class="w-7 h-7 flex justify-center flex-shrink-0 items-center">
            <video
              v-if="isThinking"
              autoplay
              loop
              muted
              playsinline
              class="w-8 h-8 scale-150 transition-opacity duration-200 light:invert light:opacity-50"
              data-tooltip-id="agent-thinking"
              data-tooltip-content="Agent is thinking..."
              aria-label="Agent is thinking..."
            >
              <source :src="AgentAnimation" type="video/webm" />
            </video>
            <img
              v-else
              :src="AgentStatic"
              alt="Agent complete"
              class="w-6 h-6 transition-opacity duration-200 light:invert light:opacity-50"
              data-tooltip-id="agent-thinking"
              data-tooltip-content="Agent has finished thinking"
              aria-label="Agent has finished thinking"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div
              :class="`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? '' : 'max-h-6'}`"
            >
              <div class="text-theme-text-secondary font-mono leading-6">
                <span v-if="!isExpanded" class="block w-full truncate mt-[2px]">
                  {{ currentThought?.content }}
                </span>
                <template v-else>
                  <div
                    v-for="(thought, index) in previousThoughts"
                    :key="`cot-${thought.uuid || index}`"
                    class="mb-2"
                  >
                    {{ thought.content }}
                  </div>
                  <div>{{ currentThought?.content }}</div>
                </template>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-x-2">
            <button
              v-if="previousThoughts?.length > 0"
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
  </div>
</template>

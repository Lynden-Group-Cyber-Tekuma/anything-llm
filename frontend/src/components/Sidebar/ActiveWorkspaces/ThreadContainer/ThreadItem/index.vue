<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Workspace from '@/models/workspace'
import paths from '@/utils/paths'
import showToast from '@/utils/toast'
import {
  ArrowCounterClockwise,
  DotsThree,
  PencilSimple,
  Trash,
  X
} from '@phosphor-icons/vue'
import OptionsMenu from './OptionsMenu.vue'

const THREAD_CALLOUT_DETAIL_WIDTH = 26

const props = defineProps({
  idx: {
    type: Number,
    required: true
  },
  activeIdx: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true
  },
  workspace: {
    type: Object,
    required: true
  },
  thread: {
    type: Object,
    required: true
  },
  onRemove: {
    type: Function,
    required: true
  },
  toggleMarkForDeletion: {
    type: Function,
    required: true
  },
  hasNext: {
    type: Boolean,
    default: false
  },
  ctrlPressed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const optionsContainer = ref(null)
const showOptions = ref(false)

const slug = computed(() => route.params.slug)
const threadSlug = computed(() => route.params.threadSlug || null)

const linkTo = computed(() => {
  if (!props.thread.slug) {
    return paths.workspace.chat(slug.value)
  }
  return paths.workspace.thread(slug.value, props.thread.slug)
})

const linkHref = computed(() => {
  if (window.location.pathname === linkTo.value || props.ctrlPressed) {
    return '#'
  }
  return linkTo.value
})

const curvedLineClasses = computed(() => {
  return props.isActive
    ? 'border-l-2 border-b-2 border-white light:border-theme-sidebar-border z-[2]'
    : 'border-l border-b border-[#6F6F71] light:border-theme-sidebar-border z-[1]'
})

const downstrokeClasses = computed(() => {
  return props.idx <= props.activeIdx && !props.isActive
    ? 'border-l-2 border-white light:border-theme-sidebar-border z-[2]'
    : 'border-l border-[#6F6F71] light:border-theme-sidebar-border z-[1]'
})

const containerClasses = computed(() => {
  const base = 'flex w-full items-center justify-between pr-2 group relative rounded-[4px]'
  if (props.isActive) {
    return `${base} bg-[var(--theme-sidebar-thread-selected)] border border-solid border-transparent light:border-blue-400`
  }
  return `${base} hover:bg-theme-sidebar-subitem-hover`
})

const threadNameClasses = computed(() => {
  const base = 'text-left text-sm truncate max-w-[150px]'
  if (props.isActive) {
    return `${base} font-medium text-white`
  }
  return `${base} text-theme-text-primary`
})

function toggleOptions() {
  showOptions.value = !showOptions.value
}

function closeOptions() {
  showOptions.value = false
}
</script>

<template>
  <div
    class="w-full relative flex h-[38px] items-center border-none rounded-lg"
    role="listitem"
  >
    <!-- Curved line Element and leader if required -->
    <div
      :style="{ width: `${THREAD_CALLOUT_DETAIL_WIDTH / 2}px` }"
      :class="curvedLineClasses"
      class="h-[50%] absolute top-0 left-3 rounded-bl-lg"
    />

    <!-- Downstroke border for next item -->
    <div
      v-if="hasNext"
      :style="{ width: `${THREAD_CALLOUT_DETAIL_WIDTH / 2}px` }"
      :class="downstrokeClasses"
      class="h-[100%] absolute top-0 left-3"
    />

    <!-- Curved line inline placeholder for spacing - not visible -->
    <div
      :style="{ width: `${THREAD_CALLOUT_DETAIL_WIDTH + 8}px` }"
      class="h-full"
    />

    <div :class="containerClasses">
      <!-- Deleted Thread -->
      <div v-if="thread.deleted" class="w-full flex justify-between">
        <div class="w-full pl-2 py-1">
          <p class="text-left text-sm text-slate-400/50 light:text-slate-500 italic">
            deleted thread
          </p>
        </div>
        <button
          v-if="ctrlPressed"
          type="button"
          class="border-none"
          @click="toggleMarkForDeletion(thread.id)"
        >
          <ArrowCounterClockwise
            :size="18"
            class="text-zinc-300 hover:text-white light:text-theme-text-secondary hover:light:text-theme-text-primary"
          />
        </button>
      </div>

      <!-- Active Thread -->
      <a
        v-else
        :href="linkHref"
        :title="thread.name"
        class="w-full pl-2 py-1 overflow-hidden"
        :aria-current="isActive ? 'page' : undefined"
      >
        <p :class="threadNameClasses">
          {{ thread.name }}
        </p>
      </a>

      <!-- Options Menu -->
      <div
        v-if="thread.slug && !thread.deleted"
        ref="optionsContainer"
        class="flex items-center"
      >
        <button
          v-if="ctrlPressed"
          type="button"
          class="border-none"
          @click="toggleMarkForDeletion(thread.id)"
        >
          <X
            :size="18"
            weight="bold"
            class="text-zinc-300 light:text-theme-text-secondary hover:text-white hover:light:text-theme-text-primary"
          />
        </button>
        <div v-else class="flex items-center w-fit group-hover:visible md:invisible gap-x-1">
          <button
            type="button"
            class="border-none"
            @click="toggleOptions"
            aria-label="Thread options"
          >
            <DotsThree
              :size="25"
              class="text-slate-300 light:text-theme-text-secondary hover:text-white hover:light:text-theme-text-primary"
            />
          </button>
        </div>

        <OptionsMenu
          v-if="showOptions"
          :containerRef="optionsContainer"
          :workspace="workspace"
          :thread="thread"
          :onRemove="onRemove"
          :close="closeOptions"
          :currentThreadSlug="threadSlug"
        />
      </div>
    </div>
  </div>
</template>

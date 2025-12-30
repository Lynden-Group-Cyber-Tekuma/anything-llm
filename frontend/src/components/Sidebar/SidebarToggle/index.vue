<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { SidebarSimple } from '@phosphor-icons/vue'
import paths from '@/utils/paths'

const SIDEBAR_TOGGLE_STORAGE_KEY = 'anythingllm_sidebar_toggle'

/**
 * Returns the previous state of the sidebar from localStorage.
 * If the sidebar was closed, returns false.
 * If the sidebar was open, returns true.
 * If the sidebar state is not set, returns true.
 * @returns {boolean}
 */
function previousSidebarState() {
  const previousState = window.localStorage.getItem(SIDEBAR_TOGGLE_STORAGE_KEY)
  if (previousState === 'closed') return false
  return true
}

export function useSidebarToggle() {
  const route = useRoute()
  const showSidebar = ref(previousSidebarState())
  const canToggleSidebar = ref(true)

  const checkPath = () => {
    const currentPath = route.path
    const isVisible =
      currentPath === paths.home() ||
      /^\/workspace\/[^\/]+$/.test(currentPath) ||
      /^\/workspace\/[^\/]+\/t\/[^\/]+$/.test(currentPath)
    canToggleSidebar.value = isVisible
  }

  const toggleSidebar = (e) => {
    if (!canToggleSidebar.value) return
    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      e.key.toLowerCase() === 's'
    ) {
      showSidebar.value = !showSidebar.value
      window.localStorage.setItem(
        SIDEBAR_TOGGLE_STORAGE_KEY,
        showSidebar.value ? 'open' : 'closed'
      )
    }
  }

  watch(() => route.path, () => {
    checkPath()
  })

  watch(showSidebar, (newVal) => {
    window.localStorage.setItem(
      SIDEBAR_TOGGLE_STORAGE_KEY,
      newVal ? 'open' : 'closed'
    )
  })

  onMounted(() => {
    checkPath()
    window.addEventListener('keydown', toggleSidebar)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', toggleSidebar)
  })

  const setShowSidebar = (value) => {
    if (typeof value === 'function') {
      showSidebar.value = value(showSidebar.value)
    } else {
      showSidebar.value = value
    }
  }

  return { showSidebar, setShowSidebar, canToggleSidebar }
}
</script>

<script setup>
const props = defineProps({
  showSidebar: {
    type: Boolean,
    required: true
  },
  setShowSidebar: {
    type: Function,
    required: true
  }
})

const isMac = navigator.userAgent.includes('Mac')
const shortcut = computed(() => isMac ? '⌘ + Shift + S' : 'Ctrl + Shift + S')

const handleClick = () => {
  props.setShowSidebar((prev) => !prev)
}
</script>

<template>
  <button
    type="button"
    :class="[
      'hidden md:block border-none bg-transparent outline-none ring-0 transition-left duration-500',
      showSidebar ? 'left-[247px]' : 'absolute top-[20px] left-[30px] z-10'
    ]"
    @click="handleClick"
    :title="showSidebar ? `Hide Sidebar (${shortcut})` : `Show Sidebar (${shortcut})`"
    :aria-label="showSidebar ? `Hide Sidebar (${shortcut})` : `Show Sidebar (${shortcut})`"
  >
    <SidebarSimple
      class="text-theme-text-secondary hover:text-theme-text-primary"
      :size="24"
    />
  </button>
</template>

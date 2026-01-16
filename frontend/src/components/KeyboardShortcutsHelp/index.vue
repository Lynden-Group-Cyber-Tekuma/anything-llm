<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Open command palette' },
  { keys: ['Ctrl', '/'], description: 'Toggle shortcuts help' },
  { keys: ['Ctrl', 'N'], description: 'New workspace' },
  { keys: ['Esc'], description: 'Close modals' }
]

function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault()
    isOpen.value = !isOpen.value
  }
  if (e.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="isOpen = false"
    >
      <div class="bg-theme-bg-secondary rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-theme-text-primary">Keyboard Shortcuts</h2>
          <button
            @click="isOpen = false"
            class="text-theme-text-secondary hover:text-theme-text-primary"
          >
            &times;
          </button>
        </div>
        <div class="space-y-3">
          <div
            v-for="shortcut in shortcuts"
            :key="shortcut.description"
            class="flex items-center justify-between"
          >
            <span class="text-theme-text-secondary">{{ shortcut.description }}</span>
            <div class="flex gap-1">
              <kbd
                v-for="key in shortcut.keys"
                :key="key"
                class="px-2 py-1 text-xs font-semibold text-theme-text-primary bg-theme-bg-primary rounded"
              >
                {{ key }}
              </kbd>
            </div>
          </div>
        </div>
        <p class="mt-4 text-sm text-theme-text-secondary">
          Press <kbd class="px-1 py-0.5 text-xs bg-theme-bg-primary rounded">Ctrl</kbd> + <kbd class="px-1 py-0.5 text-xs bg-theme-bg-primary rounded">/</kbd> to toggle this help
        </p>
      </div>
    </div>
  </Teleport>
</template>

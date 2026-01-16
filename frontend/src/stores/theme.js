import { defineStore } from 'pinia'
import { ref } from 'vue'
import { REFETCH_LOGO_EVENT } from '@/stores/logo'

export const availableThemes = {
  default: 'Default',
  light: 'Light',
}

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref(localStorage.getItem('theme') || 'default')

  // Actions
  function init() {
    // Check system preference if no theme is set
    if (localStorage.getItem('theme') === null) {
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        theme.value = 'light'
      }
    }
    applyTheme()
    setupDevKeybind()
  }

  function setTheme(newTheme) {
    theme.value = newTheme
    applyTheme()
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
    document.body.classList.toggle('light', theme.value === 'light')
    localStorage.setItem('theme', theme.value)
    window.dispatchEvent(new Event(REFETCH_LOGO_EVENT))
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'default' : 'light')
  }

  function setupDevKeybind() {
    if (!import.meta.env.DEV) return

    function toggleOnKeybind(e) {
      if (e.metaKey && e.key === '.') {
        e.preventDefault()
        toggleTheme()
      }
    }
    document.addEventListener('keydown', toggleOnKeybind)
  }

  return {
    theme,
    availableThemes,
    init,
    setTheme,
    toggleTheme
  }
})

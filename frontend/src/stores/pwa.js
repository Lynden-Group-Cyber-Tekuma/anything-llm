import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'

/**
 * Detects if the application is running as a standalone PWA
 * @returns {boolean} True if running as standalone PWA
 */
function isStandalonePWA() {
  if (typeof window === 'undefined') return false

  const matchesStandaloneDisplayMode =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(display-mode: standalone)')?.matches
      : false

  const isIOSStandalone = window.navigator?.standalone === true
  const androidReferrer =
    typeof document !== 'undefined' && document?.referrer
      ? document.referrer.includes('android-app://')
      : false

  return Boolean(
    matchesStandaloneDisplayMode || isIOSStandalone || androidReferrer
  )
}

export const usePWAStore = defineStore('pwa', () => {
  // State
  const isPWA = ref(isStandalonePWA())

  let mediaQuery = null
  const cleanup = []

  // Actions
  function init() {
    if (typeof window === 'undefined') return

    mediaQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(display-mode: standalone)')
        : null

    const updateStatus = () => {
      isPWA.value = isStandalonePWA()
      applyPWAClass()
    }

    updateStatus()

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', updateStatus)
      cleanup.push(() => mediaQuery.removeEventListener('change', updateStatus))
    } else if (mediaQuery?.addListener) {
      mediaQuery.addListener(updateStatus)
      cleanup.push(() => mediaQuery.removeListener(updateStatus))
    }

    window.addEventListener('appinstalled', updateStatus)
    window.addEventListener('visibilitychange', updateStatus)

    cleanup.push(() => {
      window.removeEventListener('appinstalled', updateStatus)
      window.removeEventListener('visibilitychange', updateStatus)
    })
  }

  function applyPWAClass() {
    if (typeof document === 'undefined') return

    document.body.classList.toggle('pwa', isPWA.value)
    document.documentElement?.setAttribute(
      'data-pwa',
      isPWA.value ? 'true' : 'false'
    )
  }

  function destroy() {
    cleanup.forEach(fn => fn())
    cleanup.length = 0
    document.body.classList.remove('pwa')
    document.documentElement?.removeAttribute('data-pwa')
  }

  return {
    isPWA,
    init,
    destroy
  }
})

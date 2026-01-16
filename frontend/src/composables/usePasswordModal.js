import { ref, onMounted } from 'vue'
import System from '@/models/system'
import {
  AUTH_TOKEN,
  AUTH_USER,
  AUTH_TIMESTAMP,
} from '@/utils/constants'

export function usePasswordModal(notry = false) {
  const loading = ref(true)
  const requiresAuth = ref(false)
  const mode = ref('single')

  onMounted(async () => {
    await checkAuthReq()
  })

  async function checkAuthReq() {
    if (!window) return

    // If the last validity check is still valid
    // we can skip the loading.
    if (!System.needsAuthCheck() && notry === false) {
      loading.value = false
      requiresAuth.value = false
      mode.value = 'multi'
      return
    }

    const settings = await System.keys()
    if (settings?.MultiUserMode) {
      const currentToken = window.localStorage.getItem(AUTH_TOKEN)
      if (currentToken) {
        const valid = notry ? false : await System.checkAuth(currentToken)
        if (!valid) {
          loading.value = false
          requiresAuth.value = true
          mode.value = 'multi'
          window.localStorage.removeItem(AUTH_USER)
          window.localStorage.removeItem(AUTH_TOKEN)
          window.localStorage.removeItem(AUTH_TIMESTAMP)
          return
        } else {
          loading.value = false
          requiresAuth.value = false
          mode.value = 'multi'
          return
        }
      } else {
        loading.value = false
        requiresAuth.value = true
        mode.value = 'multi'
        return
      }
    } else {
      // Running token check in single user Auth mode.
      // If Single user Auth is disabled - skip check
      const authRequired = settings?.RequiresAuth || false
      if (!authRequired) {
        loading.value = false
        requiresAuth.value = false
        mode.value = 'single'
        return
      }

      const currentToken = window.localStorage.getItem(AUTH_TOKEN)
      if (currentToken) {
        const valid = notry ? false : await System.checkAuth(currentToken)
        if (!valid) {
          loading.value = false
          requiresAuth.value = true
          mode.value = 'single'
          window.localStorage.removeItem(AUTH_TOKEN)
          window.localStorage.removeItem(AUTH_USER)
          window.localStorage.removeItem(AUTH_TIMESTAMP)
          return
        } else {
          loading.value = false
          requiresAuth.value = false
          mode.value = 'single'
          return
        }
      } else {
        loading.value = false
        requiresAuth.value = true
        mode.value = 'single'
        return
      }
    }
  }

  return {
    loading,
    requiresAuth,
    mode
  }
}

export default usePasswordModal

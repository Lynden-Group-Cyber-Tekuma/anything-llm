import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  AUTH_TIMESTAMP,
  AUTH_TOKEN,
  AUTH_USER,
  USER_PROMPT_INPUT_MAP,
} from '@/utils/constants'
import System from '@/models/system'
import { safeJsonParse } from '@/utils/request'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(safeJsonParse(localStorage.getItem(AUTH_USER), null))
  const authToken = ref(localStorage.getItem(AUTH_TOKEN) || null)

  // Getters
  const isAuthenticated = computed(() => !!authToken.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager')
  const isManagerOrAbove = computed(() =>
    user.value?.role === 'admin' || user.value?.role === 'manager'
  )

  // Actions
  function updateUser(newUser, newAuthToken = '') {
    localStorage.setItem(AUTH_USER, JSON.stringify(newUser))
    localStorage.setItem(AUTH_TOKEN, newAuthToken)
    user.value = newUser
    authToken.value = newAuthToken
  }

  function unsetUser() {
    localStorage.removeItem(AUTH_USER)
    localStorage.removeItem(AUTH_TOKEN)
    localStorage.removeItem(AUTH_TIMESTAMP)
    localStorage.removeItem(USER_PROMPT_INPUT_MAP)
    user.value = null
    authToken.value = null
  }

  async function refreshUser() {
    if (!authToken.value) return

    const { success, user: refreshedUser } = await System.refreshUser()

    if (success && refreshedUser === null) return

    if (!success) {
      unsetUser()
      return false
    }

    localStorage.setItem(AUTH_USER, JSON.stringify(refreshedUser))
    user.value = refreshedUser
    return true
  }

  return {
    // State
    user,
    authToken,
    // Getters
    isAuthenticated,
    isAdmin,
    isManager,
    isManagerOrAbove,
    // Actions
    updateUser,
    unsetUser,
    refreshUser
  }
})

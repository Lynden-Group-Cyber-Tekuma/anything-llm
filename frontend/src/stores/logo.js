import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
import AnythingLLM from '@/media/logo/anything-llm.png'
import AnythingLLMDark from '@/media/logo/anything-llm-dark.png'
import DefaultLoginLogoLight from '@/media/illustrations/login-logo.svg'
import DefaultLoginLogoDark from '@/media/illustrations/login-logo-light.svg'
import System from '@/models/system'

export const REFETCH_LOGO_EVENT = 'refetch-logo'

export const useLogoStore = defineStore('logo', () => {
  // State
  const logo = ref('')
  const loginLogo = ref('')
  const isCustomLogo = ref(false)

  function getDefaultLoginLogo() {
    return localStorage.getItem('theme') !== 'default'
      ? DefaultLoginLogoDark
      : DefaultLoginLogoLight
  }

  function getDefaultLogo() {
    return localStorage.getItem('theme') !== 'default'
      ? AnythingLLMDark
      : AnythingLLM
  }

  // Actions
  async function fetchLogo() {
    try {
      const { isCustomLogo: customLogo, logoURL } = await System.fetchLogo()
      if (logoURL) {
        logo.value = logoURL
        loginLogo.value = customLogo ? logoURL : getDefaultLoginLogo()
        isCustomLogo.value = customLogo
      } else {
        logo.value = getDefaultLogo()
        loginLogo.value = getDefaultLoginLogo()
        isCustomLogo.value = false
      }
    } catch (err) {
      logo.value = getDefaultLogo()
      loginLogo.value = getDefaultLoginLogo()
      isCustomLogo.value = false
      console.error('Failed to fetch logo:', err)
    }
  }

  function setLogo(newLogo) {
    logo.value = newLogo
  }

  // Setup event listener for logo refetch
  function init() {
    window.addEventListener(REFETCH_LOGO_EVENT, fetchLogo)
  }

  function destroy() {
    window.removeEventListener(REFETCH_LOGO_EVENT, fetchLogo)
  }

  return {
    logo,
    loginLogo,
    isCustomLogo,
    fetchLogo,
    setLogo,
    init,
    destroy
  }
})

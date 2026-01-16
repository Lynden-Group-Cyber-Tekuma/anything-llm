import { useLogoStore } from '@/stores/logo'
import { storeToRefs } from 'pinia'

export function useLogo() {
  const logoStore = useLogoStore()
  const { logo, loginLogo, isCustomLogo } = storeToRefs(logoStore)

  return {
    logo,
    setLogo: logoStore.setLogo,
    loginLogo,
    isCustomLogo
  }
}

export default useLogo

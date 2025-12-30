import { useThemeStore, availableThemes } from '@/stores/theme'
import { storeToRefs } from 'pinia'

export function useTheme() {
  const themeStore = useThemeStore()
  const { theme } = storeToRefs(themeStore)

  return {
    theme,
    setTheme: themeStore.setTheme,
    availableThemes
  }
}

export default useTheme

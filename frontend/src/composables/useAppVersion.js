import { ref, onMounted } from 'vue'
import System from '@/models/system'

/**
 * Composable to fetch the app version.
 * @returns {Object} The app version.
 * @returns {string | null} version - The app version.
 * @returns {boolean} isLoading - Whether the app version is loading.
 */
export function useAppVersion() {
  const version = ref(null)
  const isLoading = ref(true)

  onMounted(async () => {
    try {
      version.value = await System.fetchAppVersion()
    } finally {
      isLoading.value = false
    }
  })

  return {
    version,
    isLoading
  }
}

export default useAppVersion

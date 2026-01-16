import { ref, onMounted } from 'vue'
import { AUTH_TOKEN, AUTH_USER } from '@/utils/constants'

export function useLoginMode() {
  const mode = ref(null)

  onMounted(() => {
    if (!window) return

    const user = !!window.localStorage.getItem(AUTH_USER)
    const token = !!window.localStorage.getItem(AUTH_TOKEN)

    if (user && token) {
      mode.value = 'multi'
    } else if (!user && token) {
      mode.value = 'single'
    }
  })

  return mode
}

export default useLoginMode

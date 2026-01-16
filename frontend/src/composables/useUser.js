import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

export function useUser() {
  const authStore = useAuthStore()
  const { user, authToken } = storeToRefs(authStore)

  return {
    user,
    authToken
  }
}

export default useUser

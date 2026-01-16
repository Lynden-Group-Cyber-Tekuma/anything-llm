import { ref, onMounted } from 'vue'
import System from '@/models/system'

/**
 * Hook that fetches the can view chat history state from local storage or the system settings.
 * @returns {{viewable: import('vue').Ref<boolean>, loading: import('vue').Ref<boolean>}}
 */
export function useCanViewChatHistory() {
  const loading = ref(true)
  const viewable = ref(false)

  onMounted(async () => {
    const { viewable: canView } = await System.fetchCanViewChatHistory()
    viewable.value = canView
    loading.value = false
  })

  return { loading, viewable }
}

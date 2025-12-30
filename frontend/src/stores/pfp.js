import { defineStore } from 'pinia'
import { ref } from 'vue'
import System from '@/models/system'

export const usePfpStore = defineStore('pfp', () => {
  // State
  const pfp = ref(null)

  // Actions
  async function fetchPfp(userId) {
    if (!userId) return

    try {
      const pfpUrl = await System.fetchPfp(userId)
      pfp.value = pfpUrl
    } catch (err) {
      pfp.value = null
      console.error('Failed to fetch pfp:', err)
    }
  }

  function setPfp(newPfp) {
    pfp.value = newPfp
  }

  return {
    pfp,
    fetchPfp,
    setPfp
  }
})

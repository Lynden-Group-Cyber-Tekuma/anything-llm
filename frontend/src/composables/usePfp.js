import { usePfpStore } from '@/stores/pfp'
import { storeToRefs } from 'pinia'

export function usePfp() {
  const pfpStore = usePfpStore()
  const { pfp } = storeToRefs(pfpStore)

  return {
    pfp,
    setPfp: pfpStore.setPfp
  }
}

export default usePfp

import { ref } from 'vue'

export function useCopyText(delay = 2500) {
  const copied = ref(false)

  async function copyText(content) {
    if (!content) return

    await navigator?.clipboard?.writeText(content)
    copied.value = content

    setTimeout(() => {
      copied.value = false
    }, delay)
  }

  return {
    copyText,
    copied
  }
}

export default useCopyText

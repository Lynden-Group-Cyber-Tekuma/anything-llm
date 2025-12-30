import { ref, onMounted, onUnmounted, computed } from 'vue'

export function useTextSize() {
  const textSize = ref('normal')

  const textSizeClass = computed(() => {
    switch (textSize.value) {
      case 'small':
        return 'text-[12px]'
      case 'large':
        return 'text-[18px]'
      default:
        return 'text-[14px]'
    }
  })

  function handleTextSizeChange(event) {
    textSize.value = event.detail
  }

  onMounted(() => {
    const storedTextSize = window.localStorage.getItem('anythingllm_text_size')
    if (storedTextSize) {
      textSize.value = storedTextSize
    }

    window.addEventListener('textSizeChange', handleTextSizeChange)
  })

  onUnmounted(() => {
    window.removeEventListener('textSizeChange', handleTextSizeChange)
  })

  return {
    textSize,
    textSizeClass
  }
}

export default useTextSize

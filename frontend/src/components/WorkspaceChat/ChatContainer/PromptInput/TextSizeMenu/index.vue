<script setup>
import { ref, defineComponent, h } from 'vue'
import { TextT } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/hooks/useTheme'

const tooltipRef = ref(null)
const { t } = useI18n()
const { theme } = useTheme()

const toggleTooltip = () => {
  if (!tooltipRef.value) return
  tooltipRef.value.isOpen
    ? tooltipRef.value.close()
    : tooltipRef.value.open()
}

// TextSizeMenu component
const TextSizeMenu = defineComponent({
  props: {
    tooltipRef: Object
  },
  setup(props) {
    const { t } = useI18n()
    const selectedSize = ref(
      window.localStorage.getItem('anythingllm_text_size') || 'normal'
    )

    const handleTextSizeChange = (size) => {
      selectedSize.value = size
      window.localStorage.setItem('anythingllm_text_size', size)
      window.dispatchEvent(new CustomEvent('textSizeChange', { detail: size }))
      props.tooltipRef?.current?.close()
    }

    return () => h('div', { class: 'flex flex-col justify-start items-stretch gap-1 p-2' }, [
      h('button', {
        onClick: (e) => {
          e.preventDefault()
          handleTextSizeChange('small')
        },
        class: `border-none w-full hover:cursor-pointer px-2 py-2 rounded-md flex items-center group ${
          selectedSize.value === 'small'
            ? 'bg-theme-action-menu-item-hover'
            : 'hover:bg-theme-action-menu-item-hover'
        }`
      }, [
        h('div', { class: 'text-theme-text-primary text-xs' }, t('chat_window.small'))
      ]),
      h('button', {
        onClick: (e) => {
          e.preventDefault()
          handleTextSizeChange('normal')
        },
        class: `border-none w-full hover:cursor-pointer px-2 py-2 rounded-md flex items-center group ${
          selectedSize.value === 'normal'
            ? 'bg-theme-action-menu-item-hover'
            : 'hover:bg-theme-action-menu-item-hover'
        }`
      }, [
        h('div', { class: 'text-theme-text-primary text-sm' }, t('chat_window.normal'))
      ]),
      h('button', {
        onClick: (e) => {
          e.preventDefault()
          handleTextSizeChange('large')
        },
        class: `border-none w-full hover:cursor-pointer px-2 py-2 rounded-md flex items-center group ${
          selectedSize.value === 'large'
            ? 'bg-theme-action-menu-item-hover'
            : 'hover:bg-theme-action-menu-item-hover'
        }`
      }, [
        h('div', { class: 'text-theme-text-primary text-[16px]' }, t('chat_window.large'))
      ])
    ])
  }
})
</script>

<template>
  <div>
    <div
      id="text-size-btn"
      data-tooltip-id="tooltip-text-size-btn"
      :aria-label="t('chat_window.text_size')"
      @click="toggleTooltip"
      class="border-none flex justify-center items-center opacity-60 hover:opacity-100 light:opacity-100 light:hover:opacity-60 cursor-pointer"
    >
      <TextT
        color="var(--theme-sidebar-footer-icon-fill)"
        weight="fill"
        class="w-[22px] h-[22px] pointer-events-none text-white"
      />
    </div>
    <!-- TODO: Implement with a Vue-compatible tooltip library (e.g., floating-vue, v-tooltip) -->
    <div ref="tooltipRef" class="hidden">
      <TextSizeMenu :tooltip-ref="tooltipRef" />
    </div>
  </div>
</template>

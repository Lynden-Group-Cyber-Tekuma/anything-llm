<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <button
    :disabled="disabled"
    :class="[
      'border-none text-xs px-4 py-1 font-semibold light:text-[#ffffff] rounded-lg bg-primary-button hover:bg-secondary hover:text-white h-[34px] -mr-8 whitespace-nowrap w-fit',
      className
    ]"
    @click="handleClick"
  >
    <div class="flex items-center justify-center gap-2">
      <slot />
    </div>
  </button>
</template>

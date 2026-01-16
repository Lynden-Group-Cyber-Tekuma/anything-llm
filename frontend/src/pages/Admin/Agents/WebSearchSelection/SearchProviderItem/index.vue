<template>
  <div
    @click="$emit('click')"
    :class="[
      'w-full p-2 rounded-md hover:cursor-pointer hover:bg-theme-bg-secondary',
      checked ? 'bg-theme-bg-secondary' : ''
    ]"
  >
    <input
      type="checkbox"
      :value="value"
      class="peer hidden"
      :checked="checked"
      readonly
      formnovalidate
    />
    <div class="flex gap-x-4 items-center">
      <img :src="logo" :alt="`${name} logo`" class="w-10 h-10 rounded-md" />
      <div class="flex flex-col">
        <div class="text-sm font-semibold text-white">{{ name }}</div>
        <div class="mt-1 text-xs text-description">{{ description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  provider: {
    type: Object,
    required: true
  },
  checked: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const { name, value, logo, description } = defineProps().provider
</script>

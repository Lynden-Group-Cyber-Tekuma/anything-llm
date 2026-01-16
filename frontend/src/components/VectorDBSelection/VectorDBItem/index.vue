<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  checked: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.value)
}
</script>

<template>
  <div
    :class="[
      'w-full p-2 rounded-md hover:cursor-pointer hover:bg-theme-bg-secondary',
      checked ? 'bg-theme-bg-secondary' : ''
    ]"
    @click="handleClick"
  >
    <input
      type="checkbox"
      :value="value"
      class="peer hidden"
      :checked="checked"
      readonly
    />
    <div class="flex gap-x-4 items-center">
      <img
        :src="image"
        :alt="`${name} logo`"
        class="w-10 h-10 rounded-md"
      />
      <div class="flex flex-col">
        <div class="text-sm font-semibold text-white">{{ name }}</div>
        <div class="mt-1 text-xs text-description">{{ description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  slug: {
    type: String,
    required: true
  },
  selectedConnector: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:selectedConnector'])

const handleClick = (slug) => {
  emit('update:selectedConnector', slug)
}
</script>

<template>
  <button
    @click="handleClick(slug)"
    :class="[
      'border-none flex text-left gap-x-3.5 items-center py-2 px-4 hover:bg-theme-file-picker-hover rounded-lg cursor-pointer w-full',
      selectedConnector === slug ? 'bg-theme-file-picker-hover' : ''
    ]"
  >
    <img :src="image" :alt="name" class="w-[40px] h-[40px] rounded-md" />
    <div class="flex flex-col">
      <div class="text-white font-bold text-[14px]">{{ name }}</div>
      <div>
        <p class="text-[12px] text-white/60">{{ description }}</p>
      </div>
    </div>
  </button>
</template>

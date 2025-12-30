<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  description: {
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
  <div @click="handleClick">
    <input
      type="checkbox"
      :value="value"
      class="peer hidden"
      :checked="checked"
      readonly
    />
    <label class="transition-all duration-300 inline-flex flex-col h-full w-60 cursor-pointer items-start justify-between rounded-2xl bg-preference-gradient border-2 border-transparent shadow-md px-5 py-4 text-white hover:bg-selected-preference-gradient hover:border-white/60 peer-checked:border-white peer-checked:border-opacity-90 peer-checked:bg-selected-preference-gradient">
      <div class="flex items-center">
        <img :src="image" :alt="name" class="h-10 w-10 rounded" />
        <div class="ml-4 text-sm font-semibold">{{ name }}</div>
      </div>
      <div class="mt-2 text-xs font-base text-white tracking-wide">
        {{ description }}
      </div>
      <a
        :href="`https://${link}`"
        class="mt-2 text-xs text-white font-medium underline"
      >
        {{ link }}
      </a>
    </label>
  </div>
</template>

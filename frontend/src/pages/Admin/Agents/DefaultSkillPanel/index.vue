<template>
  <div class="p-2">
    <div class="flex flex-col gap-y-[18px] max-w-[500px]">
      <div class="flex w-full justify-between items-center">
        <div class="flex items-center gap-x-2">
          <component
            v-if="icon"
            :is="icon"
            :size="24"
            color="var(--theme-text-primary)"
            weight="bold"
          />
          <label
            for="name"
            class="text-theme-text-primary text-md font-bold"
          >
            {{ title }}
          </label>
          <DefaultBadge :title="title" />
        </div>
        <label class="border-none relative inline-flex items-center ml-auto cursor-pointer">
          <input
            type="checkbox"
            class="peer sr-only"
            :checked="enabled"
            @change="toggleSkill(skill)"
          />
          <div class="peer-disabled:opacity-50 pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
          <span class="ml-3 text-sm font-medium"></span>
        </label>
      </div>
      <img :src="image" :alt="title" class="w-full rounded-md" />
      <p class="text-theme-text-secondary text-opacity-60 text-xs font-medium py-1.5">
        {{ description }}
        <br />
        <br />
        By default, this skill is enabled, but you can disable it if you don't
        want it to be available to the agent.
      </p>
    </div>
  </div>
</template>

<script setup>
import DefaultBadge from '../Badges/default.vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    default: null
  },
  enabled: {
    type: Boolean,
    default: true
  },
  toggleSkill: {
    type: Function,
    required: true
  },
  skill: {
    type: String,
    required: true
  }
})
</script>

<template>
  <router-link
    v-if="visible"
    :to="to"
    v-slot="{ isActive }"
    custom
  >
    <a
      :href="to"
      :class="[
        isActive
          ? 'text-sky-400 pb-4 border-b-[4px] -mb-[19px] border-sky-400'
          : 'text-white/60 hover:text-sky-400',
        'flex gap-x-2 items-center font-medium'
      ]"
      @click.prevent="$router.push(to)"
    >
      <component :is="icon" class="h-6 w-6" />
      <div>{{ title }}</div>
    </a>
  </router-link>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: Object,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: true,
  },
});
</script>

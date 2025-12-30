<script setup>
// DATA_CONNECTORS should be passed from parent or imported
// This component appears to be a placeholder that needs DATA_CONNECTORS context

const props = defineProps({
  slug: {
    type: String,
    required: true
  },
  dataConnectors: {
    type: Object,
    default: () => ({})
  }
})

const connector = props.dataConnectors?.[props.slug]
if (!connector) {
  console.warn(`Data connector "${props.slug}" not found`)
}
</script>

<template>
  <a v-if="connector" :href="connector.path">
    <label class="transition-all duration-300 inline-flex flex-col h-full w-60 cursor-pointer items-start justify-between rounded-2xl bg-preference-gradient border-2 border-transparent shadow-md px-5 py-4 text-white hover:bg-selected-preference-gradient hover:border-white/60 peer-checked:border-white peer-checked:border-opacity-90 peer-checked:bg-selected-preference-gradient">
      <div class="flex items-center">
        <img :src="connector.image" :alt="connector.name" class="h-10 w-10 rounded" />
        <div class="ml-4 text-sm font-semibold">{{ connector.name }}</div>
      </div>
      <div class="mt-2 text-xs font-base text-white tracking-wide">
        {{ connector.description }}
      </div>
      <a
        :href="connector.link"
        target="_blank"
        class="mt-2 text-xs text-white font-medium underline"
      >
        {{ connector.link }}
      </a>
    </label>
  </a>
</template>

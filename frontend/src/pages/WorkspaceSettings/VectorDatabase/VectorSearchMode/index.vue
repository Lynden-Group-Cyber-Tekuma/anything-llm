<template>
  <div v-if="workspace?.vectorDB && supportedVectorDBs.includes(workspace?.vectorDB)">
    <div class="flex flex-col">
      <label for="name" class="block input-label">
        Search Preference
      </label>
    </div>
    <select
      name="vectorSearchMode"
      :value="selection"
      class="border-none bg-theme-settings-input-bg text-white text-sm mt-2 rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
      @change="handleChange"
      required
    >
      <option value="default">Default</option>
      <option value="rerank">Accuracy Optimized</option>
    </select>
    <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
      {{ hint[selection]?.description }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const supportedVectorDBs = ['lancedb'];
const hint = {
  default: {
    title: 'Default',
    description:
      'This is the fastest performance, but may not return the most relevant results leading to model hallucinations.',
  },
  rerank: {
    title: 'Accuracy Optimized',
    description:
      'LLM responses may take longer to generate, but your responses will be more accurate and relevant.',
  },
};

const props = defineProps({
  workspace: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:hasChanges']);

const selection = ref(props.workspace?.vectorSearchMode ?? 'default');

function handleChange(e) {
  selection.value = e.target.value;
  emit('update:hasChanges', true);
}
</script>

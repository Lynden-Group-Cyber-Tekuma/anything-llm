<template>
  <div>
    <div class="flex flex-col">
      <label for="name" class="block input-label">
        {{ t('chat.temperature.title') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('chat.temperature.desc-start') }}
        <br />
        {{ t('chat.temperature.desc-end') }}
        <br />
        <br />
        <i>{{ t('chat.temperature.hint') }}</i>
      </p>
    </div>
    <input
      name="openAiTemp"
      type="number"
      :min="0.0"
      :step="0.1"
      @wheel="$event.target.blur()"
      :defaultValue="workspace?.openAiTemp ?? defaults.temp"
      class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
      placeholder="0.7"
      required
      autocomplete="off"
      @change="$emit('update:hasChanges', true)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  workspace: {
    type: Object,
    required: true,
  },
});

defineEmits(['update:hasChanges']);

const { t } = useI18n();

const defaults = computed(() => {
  switch (props.settings?.LLMProvider) {
    case 'mistral':
      return { temp: 0 };
    default:
      return { temp: 0.7 };
  }
});
</script>

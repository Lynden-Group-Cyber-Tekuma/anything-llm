<template>
  <div>
    <div
      @click="handleProviderSelection"
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
      />
      <div class="flex gap-x-4 items-center justify-between">
        <div class="flex gap-x-4 items-center">
          <img
            :src="logo"
            :alt="`${name} logo`"
            class="w-10 h-10 rounded-md"
          />
          <div class="flex flex-col">
            <div class="text-sm font-semibold text-white">{{ name }}</div>
            <div class="mt-1 text-xs text-white/60">{{ description }}</div>
          </div>
        </div>
        <button
          v-if="checked && value !== 'none' && !NO_SETTINGS_NEEDED.includes(value)"
          @click.prevent="openModal"
          class="border-none p-2 text-white/60 hover:text-white hover:bg-theme-bg-hover rounded-md transition-all duration-300"
          title="Edit Settings"
        >
          <Gear :size="20" weight="bold" />
        </button>
      </div>
    </div>
    <SetupProvider
      :availableLLMs="availableLLMs"
      :isOpen="isOpen"
      :provider="value"
      :settings="currentSettings"
      @close="closeModal"
      @submit="onClick"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { PhGear } from '@phosphor-icons/vue';
import { useModal } from '@/hooks/useModal';
import System from '@/models/system';
import SetupProvider from './SetupProvider.vue';

const NO_SETTINGS_NEEDED = ['default', 'none'];

const props = defineProps({
  llm: {
    type: Object,
    required: true,
  },
  availableLLMs: {
    type: Array,
    required: true,
  },
  settings: {
    type: Object,
    required: true,
  },
  checked: {
    type: Boolean,
    required: true,
  },
  onClick: {
    type: Function,
    required: true,
  },
});

const { name, value, logo, description } = props.llm;
const { isOpen, openModal, closeModal } = useModal();
const currentSettings = ref(props.settings);

watch(isOpen, async (newVal) => {
  if (newVal) {
    const _settings = await System.keys();
    currentSettings.value = _settings ?? {};
  }
});

function handleProviderSelection() {
  if (!props.checked) {
    const requiresAdditionalSetup = (props.llm.requiredConfig || []).some(
      (key) => !currentSettings.value[key]
    );
    if (requiresAdditionalSetup) {
      openModal();
      return;
    }
    props.onClick(value);
  }
}
</script>

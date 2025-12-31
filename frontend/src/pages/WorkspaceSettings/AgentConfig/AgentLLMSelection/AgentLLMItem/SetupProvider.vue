<template>
  <Teleport to="#workspace-agent-settings-container">
    <ModalWrapper :isOpen="isOpen">
      <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div class="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
          <div class="relative p-6 border-b rounded-t border-theme-modal-border">
            <div class="w-full flex gap-x-2 items-center">
              <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
                {{ LLMOption?.name }} Settings
              </h3>
            </div>
            <button
              @click="$emit('close')"
              type="button"
              class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
            >
              <X :size="24" weight="bold" class="text-white" />
            </button>
          </div>
          <form id="provider-form" @submit.prevent="handleUpdate">
            <div class="px-7 py-6">
              <div class="space-y-6 max-h-[60vh] overflow-y-auto p-1">
                <p class="text-sm text-white/60">
                  To use {{ LLMOption?.name }} as this workspace's agent LLM you need
                  to set it up first.
                </p>
                <div>
                  <component
                    v-if="LLMOption?.options"
                    :is="LLMOption.options(settings, { credentialsOnly: true })"
                  />
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center mt-6 pt-6 border-t border-theme-modal-border px-7 pb-6">
              <button
                type="button"
                @click="$emit('close')"
                class="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="provider-form"
                class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
              >
                Save {{ LLMOption?.name }} settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalWrapper>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { X } from '@phosphor-icons/vue';
import ModalWrapper from '@/components/ModalWrapper';
import System from '@/models/system';
import showToast from '@/utils/toast';

const props = defineProps({
  availableLLMs: {
    type: Array,
    required: true,
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  settings: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close', 'submit']);

const LLMOption = computed(() =>
  props.availableLLMs.find((llm) => llm.value === props.provider)
);

async function handleUpdate(e) {
  e.stopPropagation();
  const data = {};
  const form = new FormData(e.target);
  for (const [key, value] of form.entries()) data[key] = value;
  const { error } = await System.updateSystem(data);
  if (error) {
    showToast(`Failed to save ${LLMOption.value?.name} settings: ${error}`, 'error');
    return;
  }

  emit('close');
  emit('submit');
  return false;
}
</script>

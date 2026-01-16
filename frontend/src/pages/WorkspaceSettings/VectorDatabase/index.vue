<template>
  <div v-if="workspace" class="w-full relative">
    <form
      ref="formEl"
      @submit.prevent="handleUpdate"
      class="w-1/2 flex flex-col gap-y-6"
    >
      <div v-if="hasChanges" class="absolute top-0 right-0">
        <CTAButton type="submit">
          {{ saving ? 'Updating...' : 'Update Workspace' }}
        </CTAButton>
      </div>
      <div class="flex items-start gap-x-5">
        <VectorDBIdentifier :workspace="workspace" />
        <VectorCount :reload="true" :workspace="workspace" />
      </div>
      <VectorSearchMode :workspace="workspace" @update:hasChanges="hasChanges = $event" />
      <MaxContextSnippets
        :workspace="workspace"
        @update:hasChanges="hasChanges = $event"
      />
      <DocumentSimilarityThreshold
        :workspace="workspace"
        @update:hasChanges="hasChanges = $event"
      />
      <ResetDatabase :workspace="workspace" />
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Workspace from '@/models/workspace';
import showToast from '@/utils/toast';
import { castToType } from '@/utils/types';
import VectorDBIdentifier from './VectorDBIdentifier/index.vue';
import MaxContextSnippets from './MaxContextSnippets/index.vue';
import DocumentSimilarityThreshold from './DocumentSimilarityThreshold/index.vue';
import ResetDatabase from './ResetDatabase/index.vue';
import VectorCount from './VectorCount/index.vue';
import VectorSearchMode from './VectorSearchMode/index.vue';
import CTAButton from '@/components/lib/CTAButton';

const props = defineProps({
  workspace: {
    type: Object,
    required: true,
  },
});

const hasChanges = ref(false);
const saving = ref(false);
const formEl = ref(null);

const handleUpdate = async (e) => {
  saving.value = true;
  const data = {};
  const form = new FormData(formEl.value);
  for (const [key, value] of form.entries()) data[key] = castToType(key, value);
  const { workspace: updatedWorkspace, message } = await Workspace.update(
    props.workspace.slug,
    data
  );
  if (!!updatedWorkspace) {
    showToast('Workspace updated!', 'success', { clear: true });
  } else {
    showToast(`Error: ${message}`, 'error', { clear: true });
  }
  saving.value = false;
  hasChanges.value = false;
};
</script>

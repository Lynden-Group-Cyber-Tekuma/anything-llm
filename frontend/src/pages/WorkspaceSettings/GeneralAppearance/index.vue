<template>
  <div v-if="!loading && workspace" class="w-full relative">
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
      <WorkspaceName
        :key="workspace.slug"
        :workspace="workspace"
        @update:hasChanges="hasChanges = $event"
      />
    </form>
    <SuggestedChatMessages :slug="workspace.slug" />
    <WorkspacePfp :workspace="workspace" :slug="slug" />
    <DeleteWorkspace :workspace="workspace" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Workspace from '@/models/workspace';
import { castToType } from '@/utils/types';
import showToast from '@/utils/toast';
import WorkspaceName from './WorkspaceName/index.vue';
import SuggestedChatMessages from './SuggestedChatMessages/index.vue';
import DeleteWorkspace from './DeleteWorkspace/index.vue';
import WorkspacePfp from './WorkspacePfp/index.vue';
import CTAButton from '@/components/lib/CTAButton';

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
});

const workspace = ref(null);
const hasChanges = ref(false);
const saving = ref(false);
const loading = ref(true);
const formEl = ref(null);

onMounted(async () => {
  const ws = await Workspace.bySlug(props.slug);
  workspace.value = ws;
  loading.value = false;
});

const handleUpdate = async (e) => {
  saving.value = true;
  const data = {};
  const form = new FormData(formEl.value);
  for (const [key, value] of form.entries()) data[key] = castToType(key, value);
  const { workspace: updatedWorkspace, message } = await Workspace.update(
    workspace.value.slug,
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

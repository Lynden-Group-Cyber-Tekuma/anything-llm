<template>
  <form
    @submit="handleCreate"
    class="w-full flex items-center justify-center flex-col gap-y-2"
  >
    <img :src="illustration" alt="Create workspace" />
    <div class="flex flex-col gap-y-4 w-full max-w-[600px]">
      <div class="w-full mt-4">
        <label
          for="name"
          class="block mb-3 text-sm font-medium text-white"
        >
          {{ t('common.workspaces-name') }}
        </label>
        <input
          name="name"
          type="text"
          class="border-none bg-theme-settings-input-bg text-white focus:outline-primary-button active:outline-primary-button placeholder:text-theme-settings-input-placeholder outline-none text-sm rounded-lg block w-full p-2.5"
          placeholder="My Workspace"
          required
          autocomplete="off"
          @input="(e) => workspaceName = e.target.value"
        />
      </div>
    </div>
    <button
      type="submit"
      ref="createWorkspaceRef"
      hidden
      aria-hidden="true"
    ></button>
  </form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import illustration from '@/media/illustrations/create-workspace.png';
import paths from '@/utils/paths';
import showToast from '@/utils/toast';
import Workspace from '@/models/workspace';

const props = defineProps({
  setHeader: Function,
  setForwardBtn: Function,
  setBackBtn: Function,
});

const { t } = useI18n();
const router = useRouter();

const workspaceName = ref('');
const createWorkspaceRef = ref(null);

const TITLE = t('onboarding.workspace.title');
const DESCRIPTION = t('onboarding.workspace.description');

const handleCreate = async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const { workspace, error } = await Workspace.new({
    name: form.get('name'),
    onboardingComplete: true,
  });
  if (workspace) {
    showToast(
      'Workspace created successfully! Taking you to home...',
      'success'
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push(paths.home());
  } else {
    showToast(`Failed to create workspace: ${error}`, 'error');
  }
};

function handleForward() {
  createWorkspaceRef.value?.click();
}

function handleBack() {
  router.push(paths.onboarding.survey());
}

onMounted(() => {
  props.setHeader({ title: TITLE, description: DESCRIPTION });
  props.setBackBtn({ showing: false, disabled: false, onClick: handleBack });
});

watch(workspaceName, (newValue) => {
  if (newValue.length > 0) {
    props.setForwardBtn({ showing: true, disabled: false, onClick: handleForward });
  } else {
    props.setForwardBtn({ showing: true, disabled: true, onClick: handleForward });
  }
});
</script>

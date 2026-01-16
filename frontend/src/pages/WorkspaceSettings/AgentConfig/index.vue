<template>
  <div id="workspace-agent-settings-container">
    <form
      v-if="!loading && workspace"
      ref="formEl"
      @submit.prevent="handleUpdate"
      @change="hasChanges = true"
      id="agent-settings-form"
      class="w-1/2 flex flex-col gap-y-6"
    >
      <AgentLLMSelection
        :settings="settings"
        :workspace="workspace"
        @update:hasChanges="hasChanges = $event"
      />
      <div v-if="!user || user?.role === 'admin'">
        <div v-if="!hasChanges" class="flex flex-col gap-y-4">
          <a
            class="w-fit transition-all duration-300 border border-slate-200 px-5 py-2.5 rounded-lg text-white text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 focus:ring-gray-800"
            :href="paths.settings.agentSkills()"
          >
            Configure Agent Skills
          </a>
          <p class="text-white text-opacity-60 text-xs font-medium">
            Customize and enhance the default agent's capabilities by
            enabling or disabling specific skills. These settings will be
            applied across all workspaces.
          </p>
        </div>
      </div>

      <button
        v-if="hasChanges"
        type="submit"
        form="agent-settings-form"
        class="w-fit transition-all duration-300 border border-slate-200 px-5 py-2.5 rounded-lg text-white text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 focus:ring-gray-800"
      >
        {{ saving ? 'Updating agent...' : 'Update workspace agent' }}
      </button>
    </form>
    <LoadingSkeleton v-else />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import System from '@/models/system';
import Workspace from '@/models/workspace';
import Admin from '@/models/admin';
import showToast from '@/utils/toast';
import { castToType } from '@/utils/types';
import paths from '@/utils/paths';
import useUser from '@/hooks/useUser';
import AgentLLMSelection from './AgentLLMSelection/index.vue';
import LoadingSkeleton from './LoadingSkeleton.vue';

const props = defineProps({
  workspace: {
    type: Object,
    required: true,
  },
});

const { user } = useUser();
const settings = ref({});
const hasChanges = ref(false);
const saving = ref(false);
const loading = ref(true);
const formEl = ref(null);

onMounted(async () => {
  const _settings = await System.keys();
  const _preferences = await Admin.systemPreferences();
  settings.value = { ..._settings, preferences: _preferences.settings } ?? {};
  loading.value = false;
});

const handleUpdate = async (e) => {
  saving.value = true;
  const data = {
    workspace: {},
    system: {},
    env: {},
  };

  const form = new FormData(formEl.value);
  for (const [key, value] of form.entries()) {
    if (key.startsWith('system::')) {
      const [, label] = key.split('system::');
      data.system[label] = String(value);
      continue;
    }

    if (key.startsWith('env::')) {
      const [, label] = key.split('env::');
      data.env[label] = String(value);
      continue;
    }

    data.workspace[key] = castToType(key, value);
  }

  const { workspace: updatedWorkspace, message } = await Workspace.update(
    props.workspace.slug,
    data.workspace
  );
  await Admin.updateSystemPreferences(data.system);
  await System.updateSystem(data.env);

  if (!!updatedWorkspace) {
    showToast('Workspace updated!', 'success', { clear: true });
  } else {
    showToast(`Error: ${message}`, 'error', { clear: true });
  }

  saving.value = false;
  hasChanges.value = false;
};
</script>

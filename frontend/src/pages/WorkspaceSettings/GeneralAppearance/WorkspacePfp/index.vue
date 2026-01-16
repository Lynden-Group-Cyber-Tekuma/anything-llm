<template>
  <div class="mt-6">
    <div class="flex flex-col">
      <label class="block input-label">{{ t('general.pfp.title') }}</label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('general.pfp.description') }}
      </p>
    </div>
    <div class="flex flex-col md:flex-row items-center gap-8">
      <div class="flex flex-col items-center">
        <label class="w-36 h-36 flex flex-col items-center justify-center bg-theme-settings-input-bg transition-all duration-300 rounded-full mt-8 border-2 border-dashed border-white border-opacity-60 cursor-pointer hover:opacity-60">
          <input
            id="workspace-pfp-upload"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
          />
          <img
            v-if="pfp"
            :src="pfp"
            alt="User profile picture"
            class="w-36 h-36 rounded-full object-cover bg-theme-bg-secondary"
          />
          <div v-else class="flex flex-col items-center justify-center p-3">
            <Plus class="w-8 h-8 text-theme-text-secondary m-2" />
            <span class="text-theme-text-secondary text-opacity-80 text-xs font-semibold">
              {{ t('general.pfp.image') }}
            </span>
            <span class="text-theme-text-secondary text-opacity-60 text-xs">
              800 x 800
            </span>
          </div>
        </label>
        <button
          v-if="pfp"
          type="button"
          @click="handleRemovePfp"
          class="mt-3 text-theme-text-secondary text-opacity-60 text-sm font-medium hover:underline"
        >
          {{ t('general.pfp.remove') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Workspace from '@/models/workspace';
import showToast from '@/utils/toast';
import { PhPlus } from '@phosphor-icons/vue';

const props = defineProps({
  workspace: {
    type: Object,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
const pfp = ref(null);

onMounted(async () => {
  const pfpUrl = await Workspace.fetchPfp(props.slug);
  pfp.value = pfpUrl;
});

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return false;

  const formData = new FormData();
  formData.append('file', file);
  const { success, error } = await Workspace.uploadPfp(
    formData,
    props.workspace.slug
  );
  if (!success) {
    showToast(`Failed to upload profile picture: ${error}`, 'error');
    return;
  }

  const pfpUrl = await Workspace.fetchPfp(props.workspace.slug);
  pfp.value = pfpUrl;
  showToast('Profile picture uploaded.', 'success');
};

const handleRemovePfp = async () => {
  const { success, error } = await Workspace.removePfp(props.workspace.slug);
  if (!success) {
    showToast(`Failed to remove profile picture: ${error}`, 'error');
    return;
  }

  pfp.value = null;
};
</script>

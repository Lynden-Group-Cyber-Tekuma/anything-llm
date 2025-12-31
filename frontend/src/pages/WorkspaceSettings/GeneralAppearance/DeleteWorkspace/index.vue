<template>
  <div class="flex flex-col mt-10">
    <label class="block input-label">{{ t('general.delete.title') }}</label>
    <p class="text-theme-text-secondary text-xs font-medium py-1.5">
      {{ t('general.delete.description') }}
    </p>
    <button
      :disabled="deleting"
      @click="deleteWorkspace"
      type="button"
      class="w-60 mt-4 transition-all duration-300 border border-transparent rounded-lg whitespace-nowrap text-sm px-5 py-2.5 focus:z-10 bg-red-500/25 text-red-200 light:text-red-500 hover:light:text-[#FFFFFF] hover:text-[#FFFFFF] hover:bg-red-600 disabled:bg-red-600 disabled:text-red-200 disabled:animate-pulse"
    >
      {{ deleting ? t('general.delete.deleting') : t('general.delete.delete') }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Workspace from '@/models/workspace';
import paths from '@/utils/paths';
import showToast from '@/utils/toast';

const props = defineProps({
  workspace: {
    type: Object,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const deleting = ref(false);

const deleteWorkspace = async () => {
  if (
    !window.confirm(
      `${t('general.delete.confirm-start')} ${props.workspace.name} ${t(
        'general.delete.confirm-end'
      )}`
    )
  )
    return false;

  deleting.value = true;
  const success = await Workspace.delete(props.workspace.slug);
  if (!success) {
    showToast('Workspace could not be deleted!', 'error', { clear: true });
    deleting.value = false;
    return;
  }

  if (props.workspace.slug === route.params.slug) {
    window.location = paths.home();
  } else {
    window.location.reload();
  }
};
</script>

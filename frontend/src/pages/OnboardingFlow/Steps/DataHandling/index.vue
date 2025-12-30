<template>
  <div class="w-full flex items-center justify-center flex-col gap-y-6">
    <ProviderPrivacy />
    <p class="text-theme-text-secondary text-sm font-medium py-1">
      {{ t('onboarding.data.settingsHint') }}
    </p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import paths from '@/utils/paths';
import ProviderPrivacy from '@/components/ProviderPrivacy/index.vue';

const props = defineProps({
  setHeader: Function,
  setForwardBtn: Function,
  setBackBtn: Function,
});

const { t } = useI18n();
const router = useRouter();

const TITLE = t('onboarding.data.title');
const DESCRIPTION = t('onboarding.data.description');

function handleForward() {
  router.push(paths.onboarding.survey());
}

function handleBack() {
  router.push(paths.onboarding.userSetup());
}

onMounted(() => {
  props.setHeader({ title: TITLE, description: DESCRIPTION });
  props.setForwardBtn({ showing: true, disabled: false, onClick: handleForward });
  props.setBackBtn({ showing: false, disabled: false, onClick: handleBack });
});
</script>

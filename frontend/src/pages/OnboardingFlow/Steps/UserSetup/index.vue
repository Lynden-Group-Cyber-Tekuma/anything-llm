<template>
  <div class="w-full flex items-center justify-center flex-col gap-y-6">
    <div class="flex flex-col border rounded-lg border-white/20 light:border-theme-sidebar-border p-8 items-center gap-y-4 w-full max-w-[600px]">
      <div class="text-white text-sm font-semibold md:-ml-44">
        {{ t('onboarding.userSetup.howManyUsers') }}
      </div>
      <div class="flex flex-col md:flex-row gap-6 w-full justify-center">
        <button
          @click="selectedOption = 'just_me'"
          :class="[
            selectedOption === 'just_me'
              ? 'text-sky-400 border-sky-400/70'
              : 'text-theme-text-primary border-theme-sidebar-border',
            'min-w-[230px] h-11 p-4 rounded-[10px] border-2 justify-center items-center gap-[100px] inline-flex hover:border-sky-400/70 hover:text-sky-400 transition-all duration-300'
          ]"
        >
          <div class="text-center text-sm font-bold">
            {{ t('onboarding.userSetup.justMe') }}
          </div>
        </button>
        <button
          @click="selectedOption = 'my_team'"
          :class="[
            selectedOption === 'my_team'
              ? 'text-sky-400 border-sky-400/70'
              : 'text-theme-text-primary border-theme-sidebar-border',
            'min-w-[230px] h-11 p-4 rounded-[10px] border-2 justify-center items-center gap-[100px] inline-flex hover:border-sky-400/70 hover:text-sky-400 transition-all duration-300'
          ]"
        >
          <div class="text-center text-sm font-bold">
            {{ t('onboarding.userSetup.myTeam') }}
          </div>
        </button>
      </div>
    </div>
    <JustMe
      v-if="selectedOption === 'just_me'"
      :setSingleUserPasswordValid="(val) => singleUserPasswordValid = val"
      v-model:enablePassword="enablePassword"
      :justMeSubmitRef="justMeSubmitRef"
    />
    <MyTeam
      v-if="selectedOption === 'my_team'"
      :setMultiUserLoginValid="(val) => multiUserLoginValid = val"
      :myTeamSubmitRef="myTeamSubmitRef"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import paths from '@/utils/paths';
import JustMe from './JustMe.vue';
import MyTeam from './MyTeam.vue';

const props = defineProps({
  setHeader: Function,
  setForwardBtn: Function,
  setBackBtn: Function,
});

const { t } = useI18n();
const router = useRouter();

const selectedOption = ref('');
const singleUserPasswordValid = ref(false);
const multiUserLoginValid = ref(false);
const enablePassword = ref(false);
const myTeamSubmitRef = ref(null);
const justMeSubmitRef = ref(null);

const TITLE = t('onboarding.userSetup.title');
const DESCRIPTION = t('onboarding.userSetup.description');

function handleForward() {
  if (selectedOption.value === 'just_me' && enablePassword.value) {
    justMeSubmitRef.value?.click();
  } else if (selectedOption.value === 'just_me' && !enablePassword.value) {
    router.push(paths.onboarding.dataHandling());
  } else if (selectedOption.value === 'my_team') {
    myTeamSubmitRef.value?.click();
  }
}

function handleBack() {
  router.push(paths.onboarding.llmPreference());
}

watch([selectedOption, singleUserPasswordValid, multiUserLoginValid], () => {
  let isDisabled = true;
  if (selectedOption.value === 'just_me') {
    isDisabled = !singleUserPasswordValid.value;
  } else if (selectedOption.value === 'my_team') {
    isDisabled = !multiUserLoginValid.value;
  }

  props.setForwardBtn({
    showing: true,
    disabled: isDisabled,
    onClick: handleForward,
  });
});

onMounted(() => {
  props.setHeader({ title: TITLE, description: DESCRIPTION });
  props.setBackBtn({ showing: true, disabled: false, onClick: handleBack });
});
</script>

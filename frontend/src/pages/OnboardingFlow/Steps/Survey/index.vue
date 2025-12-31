<template>
  <div v-if="alreadyCompleted" class="w-full flex justify-center items-center py-40">
    <div class="w-full flex items-center justify-center px-1 md:px-8 py-4">
      <div class="w-auto flex flex-col gap-y-1 items-center">
        <CheckCircle :size="60" class="text-green-500" />
        <p class="text-white text-lg">
          {{ t('onboarding.survey.thankYou') }}
        </p>
        <a
          :href="paths.mailToMintplex()"
          class="text-sky-400 underline text-xs"
        >
          team@mintplexlabs.com
        </a>
      </div>
    </div>
  </div>

  <div v-else class="w-full flex justify-center bo">
    <form @submit="handleSubmit" ref="formRef">
      <div class="md:min-w-[400px]">
        <label
          for="email"
          class="text-theme-text-primary text-base font-medium"
        >
          {{ t('onboarding.survey.email') }}
        </label>
        <input
          name="email"
          type="email"
          placeholder="you@gmail.com"
          required
          class="mt-2 bg-theme-settings-input-bg text-white focus:outline-primary-button active:outline-primary-button placeholder:text-theme-settings-input-placeholder outline-none text-sm font-medium font-['Plus Jakarta Sans'] leading-tight w-full h-11 p-2.5 bg-theme-settings-input-bg rounded-lg"
        />
      </div>

      <div class="mt-8">
        <label
          class="text-theme-text-primary text-base font-medium"
          for="use_case"
        >
          {{ t('onboarding.survey.useCase') }}
        </label>
        <div class="mt-2 gap-y-3 flex flex-col">
          <label
            :class="[
              'border-solid transition-all duration-300 w-full h-11 p-2.5 rounded-lg flex justify-start items-center gap-2.5 cursor-pointer border',
              selectedOption === 'job'
                ? 'border-theme-sidebar-item-workspace-active bg-theme-bg-secondary'
                : 'border-theme-sidebar-border',
              'hover:border-theme-sidebar-border hover:bg-theme-bg-secondary'
            ]"
          >
            <input
              type="radio"
              name="use_case"
              value="job"
              :checked="selectedOption === 'job'"
              @change="(e) => selectedOption = e.target.value"
              class="hidden"
            />
            <div
              :class="[
                'w-4 h-4 rounded-full border-2 border-theme-sidebar-border mr-2',
                selectedOption === 'job' ? 'bg-[var(--theme-sidebar-item-workspace-active)]' : ''
              ]"
            ></div>
            <div class="text-theme-text-primary text-sm font-medium font-['Plus Jakarta Sans'] leading-tight">
              {{ t('onboarding.survey.useCaseWork') }}
            </div>
          </label>
          <label
            :class="[
              'border-solid transition-all duration-300 w-full h-11 p-2.5 rounded-lg flex justify-start items-center gap-2.5 cursor-pointer border-[1px]',
              selectedOption === 'personal'
                ? 'border-theme-sidebar-item-workspace-active bg-theme-bg-secondary'
                : 'border-theme-sidebar-border',
              'hover:border-theme-sidebar-border hover:bg-theme-bg-secondary'
            ]"
          >
            <input
              type="radio"
              name="use_case"
              value="personal"
              :checked="selectedOption === 'personal'"
              @change="(e) => selectedOption = e.target.value"
              class="hidden"
            />
            <div
              :class="[
                'w-4 h-4 rounded-full border-2 border-theme-sidebar-border mr-2',
                selectedOption === 'personal' ? 'bg-[var(--theme-sidebar-item-workspace-active)]' : ''
              ]"
            ></div>
            <div class="text-theme-text-primary text-sm font-medium font-['Plus Jakarta Sans'] leading-tight">
              {{ t('onboarding.survey.useCasePersonal') }}
            </div>
          </label>
          <label
            :class="[
              'border-solid transition-all duration-300 w-full h-11 p-2.5 rounded-lg flex justify-start items-center gap-2.5 cursor-pointer border-[1px]',
              selectedOption === 'other'
                ? 'border-theme-sidebar-item-workspace-active bg-theme-bg-secondary'
                : 'border-theme-sidebar-border',
              'hover:border-theme-sidebar-border hover:bg-theme-bg-secondary'
            ]"
          >
            <input
              type="radio"
              name="use_case"
              value="other"
              :checked="selectedOption === 'other'"
              @change="(e) => selectedOption = e.target.value"
              class="hidden"
            />
            <div
              :class="[
                'w-4 h-4 rounded-full border-2 border-theme-sidebar-border mr-2',
                selectedOption === 'other' ? 'bg-[var(--theme-sidebar-item-workspace-active)]' : ''
              ]"
            ></div>
            <div class="text-theme-text-primary text-sm font-medium font-['Plus Jakarta Sans'] leading-tight">
              {{ t('onboarding.survey.useCaseOther') }}
            </div>
          </label>
        </div>
      </div>

      <div class="mt-8">
        <label for="comment" class="text-white text-base font-medium">
          {{ t('onboarding.survey.comment') }}
          <span class="text-neutral-400 text-base font-light">
            ({{ t('common.optional') }})
          </span>
        </label>
        <textarea
          name="comment"
          :rows="5"
          class="mt-2 bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button placeholder:text-theme-settings-input-placeholder outline-none block w-full p-2.5"
          :placeholder="t('onboarding.survey.commentPlaceholder')"
          wrap="soft"
          autocomplete="off"
        />
      </div>
      <button
        type="submit"
        ref="submitRef"
        hidden
        aria-hidden="true"
      ></button>

      <div class="w-full flex items-center justify-center">
        <button
          type="button"
          @click="skipSurvey"
          class="text-white text-base font-medium text-opacity-30 hover:text-opacity-100 hover:text-teal mt-8"
        >
          {{ t('onboarding.survey.skip') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { PhCheckCircle } from '@phosphor-icons/vue';
import {
  COMPLETE_QUESTIONNAIRE,
  ONBOARDING_SURVEY_URL,
} from '@/utils/constants';
import paths from '@/utils/paths';

const props = defineProps({
  setHeader: Function,
  setForwardBtn: Function,
  setBackBtn: Function,
});

const { t } = useI18n();
const router = useRouter();

const selectedOption = ref('');
const formRef = ref(null);
const submitRef = ref(null);
const alreadyCompleted = ref(false);

const TITLE = t('onboarding.survey.title');
const DESCRIPTION = t('onboarding.survey.description');

async function sendQuestionnaire({ email, useCase, comment }) {
  if (import.meta.env.DEV) {
    console.log('sendQuestionnaire', { email, useCase, comment });
    return;
  }

  const data = JSON.stringify({
    email,
    useCase,
    comment,
    sourceId: '0VRjqHh6Vukqi0x0Vd0n/m8JuT7k8nOz',
  });

  if (!navigator.sendBeacon) {
    console.log('navigator.sendBeacon not supported, falling back to fetch');
    return fetch(ONBOARDING_SURVEY_URL, {
      method: 'POST',
      body: data,
    })
      .then(() => {
        window.localStorage.setItem(COMPLETE_QUESTIONNAIRE, true);
        console.log(`✅ Questionnaire responses sent.`);
      })
      .catch((error) => {
        console.error(`sendQuestionnaire`, error.message);
      });
  }

  navigator.sendBeacon(ONBOARDING_SURVEY_URL, data);
  window.localStorage.setItem(COMPLETE_QUESTIONNAIRE, true);
  console.log(`✅ Questionnaire responses sent.`);
}

function handleForward() {
  if (window?.localStorage?.getItem(COMPLETE_QUESTIONNAIRE)) {
    router.push(paths.onboarding.createWorkspace());
    return;
  }

  if (!formRef.value) {
    skipSurvey();
    return;
  }

  // Check if any inputs are not empty. If that is the case, trigger form validation.
  const formData = new FormData(formRef.value);
  if (
    formData.get('email') ||
    formData.get('use_case') ||
    formData.get('comment')
  ) {
    formRef.value.requestSubmit();
    return;
  }

  skipSurvey();
}

function skipSurvey() {
  router.push(paths.onboarding.createWorkspace());
}

function handleBack() {
  router.push(paths.onboarding.dataHandling());
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  await sendQuestionnaire({
    email: formData.get('email'),
    useCase: formData.get('use_case') || 'other',
    comment: formData.get('comment') || null,
  });

  router.push(paths.onboarding.createWorkspace());
};

onMounted(() => {
  alreadyCompleted.value = !!window?.localStorage?.getItem(COMPLETE_QUESTIONNAIRE);
  props.setHeader({ title: TITLE, description: DESCRIPTION });
  props.setForwardBtn({ showing: true, disabled: false, onClick: handleForward });
  props.setBackBtn({ showing: true, disabled: false, onClick: handleBack });
});
</script>

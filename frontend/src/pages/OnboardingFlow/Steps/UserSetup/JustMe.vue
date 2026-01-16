<template>
  <div class="w-full flex items-center justify-center flex-col gap-y-6">
    <div class="flex flex-col border rounded-lg border-white/20 light:border-theme-sidebar-border p-8 items-center gap-y-4 w-full max-w-[600px]">
      <div class="text-white text-sm font-semibold md:-ml-56">
        {{ t('onboarding.userSetup.setPassword') }}
      </div>
      <div class="flex flex-col md:flex-row gap-6 w-full justify-center">
        <button
          @click="handleYes"
          :class="[
            enablePassword && itemSelected
              ? 'text-sky-400 border-sky-400/70'
              : 'text-theme-text-primary border-theme-sidebar-border',
            'min-w-[230px] h-11 p-4 rounded-[10px] border-2 justify-center items-center gap-[100px] inline-flex hover:border-sky-400/70 hover:text-sky-400 transition-all duration-300'
          ]"
        >
          <div class="text-center text-sm font-bold">
            {{ t('common.yes') }}
          </div>
        </button>
        <button
          @click="handleNo"
          :class="[
            !enablePassword && itemSelected
              ? 'text-sky-400 border-sky-400/70'
              : 'text-theme-text-primary border-theme-sidebar-border',
            'min-w-[230px] h-11 p-4 rounded-[10px] border-2 justify-center items-center gap-[100px] inline-flex hover:border-sky-400/70 hover:text-sky-400 transition-all duration-300'
          ]"
        >
          <div class="text-center text-sm font-bold">
            {{ t('common.no') }}
          </div>
        </button>
      </div>
      <form v-if="enablePassword" class="w-full mt-4" @submit="handleSubmit">
        <label
          for="name"
          class="block mb-3 text-sm font-medium text-white"
        >
          {{ t('onboarding.userSetup.instancePassword') }}
        </label>
        <input
          name="password"
          type="password"
          class="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg block w-full p-2.5 focus:outline-primary-button active:outline-primary-button outline-none placeholder:text-theme-text-secondary"
          placeholder="Your admin password"
          :minlength="6"
          required
          autocomplete="off"
          @input="handlePasswordChange"
        />
        <div class="mt-4 text-white text-opacity-80 text-xs font-base -mb-2">
          {{ t('onboarding.userSetup.passwordReq') }}
          <br />
          <i>{{ t('onboarding.userSetup.passwordWarn') }}</i>
        </div>
        <button
          type="submit"
          ref="justMeSubmitRef"
          hidden
          aria-hidden="true"
        ></button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import debounce from 'lodash.debounce';
import System from '@/models/system';
import showToast from '@/utils/toast';
import paths from '@/utils/paths';
import { AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER } from '@/utils/constants';

const props = defineProps({
  setSingleUserPasswordValid: Function,
  enablePassword: Boolean,
  justMeSubmitRef: Object,
});

const emit = defineEmits(['update:enablePassword']);

const { t } = useI18n();
const router = useRouter();

const itemSelected = ref(false);
const password = ref('');
const justMeSubmitRef = ref(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const { error } = await System.updateSystemPassword({
    usePassword: true,
    newPassword: formData.get('password'),
  });

  if (error) {
    showToast(`Failed to set password: ${error}`, 'error');
    return;
  }

  // Auto-request token with password that was just set so they
  // are not redirected to login after completion.
  const { token } = await System.requestToken({
    password: formData.get('password'),
  });
  window.localStorage.removeItem(AUTH_USER);
  window.localStorage.removeItem(AUTH_TIMESTAMP);
  window.localStorage.setItem(AUTH_TOKEN, token);

  router.push(paths.onboarding.dataHandling());
};

const setNewPassword = (e) => {
  password.value = e.target.value;
};

const handlePasswordChange = debounce(setNewPassword, 500);

function handleYes() {
  itemSelected.value = true;
  emit('update:enablePassword', true);
}

function handleNo() {
  itemSelected.value = true;
  emit('update:enablePassword', false);
}

watch([() => props.enablePassword, itemSelected, password], () => {
  if (props.enablePassword && itemSelected.value && password.value.length >= 8) {
    props.setSingleUserPasswordValid(true);
  } else if (!props.enablePassword && itemSelected.value) {
    props.setSingleUserPasswordValid(true);
  } else {
    props.setSingleUserPasswordValid(false);
  }
});
</script>

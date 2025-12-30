<template>
  <div class="w-full flex items-center justify-center border max-w-[600px] rounded-lg border-white/20 light:border-theme-sidebar-border">
    <form @submit="handleSubmit">
      <div class="flex flex-col w-full md:px-8 px-2 py-4">
        <div class="space-y-6 flex h-full w-full">
          <div class="w-full flex flex-col gap-y-4">
            <div>
              <label
                for="name"
                class="block mb-3 text-sm font-medium text-white"
              >
                {{ t('onboarding.userSetup.adminUsername') }}
              </label>
              <input
                name="username"
                type="text"
                class="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg block w-full p-2.5 focus:outline-primary-button active:outline-primary-button placeholder:text-theme-text-secondary outline-none"
                placeholder="Your admin username"
                :minlength="6"
                required
                autocomplete="off"
                @input="handleUsernameChange"
              />
            </div>
            <p class="text-white text-opacity-80 text-xs font-base">
              {{ t('onboarding.userSetup.adminUsernameReq') }}
            </p>
            <div class="mt-4">
              <label
                for="name"
                class="block mb-3 text-sm font-medium text-white"
              >
                {{ t('onboarding.userSetup.adminPassword') }}
              </label>
              <input
                name="password"
                type="password"
                class="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg block w-full p-2.5 focus:outline-primary-button active:outline-primary-button placeholder:text-theme-text-secondary outline-none"
                placeholder="Your admin password"
                :minlength="8"
                required
                autocomplete="off"
                @input="handlePasswordChange"
              />
            </div>
            <p class="text-white text-opacity-80 text-xs font-base">
              {{ t('onboarding.userSetup.adminPasswordReq') }}
            </p>
          </div>
        </div>
      </div>
      <div class="flex w-full justify-between items-center px-6 py-4 space-x-6 border-t rounded-b border-theme-sidebar-border">
        <div class="text-theme-text-secondary text-opacity-80 text-xs font-base">
          {{ t('onboarding.userSetup.teamHint') }}
        </div>
      </div>
      <button
        type="submit"
        ref="myTeamSubmitRef"
        hidden
        aria-hidden="true"
      ></button>
    </form>
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
  setMultiUserLoginValid: Function,
  myTeamSubmitRef: Object,
});

const { t } = useI18n();
const router = useRouter();

const username = ref('');
const password = ref('');
const myTeamSubmitRef = ref(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = {
    username: formData.get('username'),
    password: formData.get('password'),
  };
  const { success, error } = await System.setupMultiUser(data);
  if (!success) {
    showToast(`Error: ${error}`, 'error');
    return;
  }

  router.push(paths.onboarding.dataHandling());
  // Auto-request token with credentials that was just set so they
  // are not redirected to login after completion.
  const { user, token } = await System.requestToken(data);
  window.localStorage.setItem(AUTH_USER, JSON.stringify(user));
  window.localStorage.setItem(AUTH_TOKEN, token);
  window.localStorage.removeItem(AUTH_TIMESTAMP);
};

const setNewUsername = (e) => {
  username.value = e.target.value;
};

const setNewPassword = (e) => {
  password.value = e.target.value;
};

const handleUsernameChange = debounce(setNewUsername, 500);
const handlePasswordChange = debounce(setNewPassword, 500);

watch([username, password], () => {
  if (username.value.length >= 6 && password.value.length >= 8) {
    props.setMultiUserLoginValid(true);
  } else {
    props.setMultiUserLoginValid(false);
  }
});
</script>

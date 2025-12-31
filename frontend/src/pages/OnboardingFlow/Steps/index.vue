<template>
  <div
    data-layout="onboarding"
    :class="isMobile ? 'w-screen h-screen overflow-y-auto bg-theme-bg-primary overflow-hidden' : 'w-screen overflow-y-auto bg-theme-bg-primary flex justify-center overflow-hidden'"
  >
    <!-- Mobile Layout -->
    <div v-if="isMobile" class="flex flex-col">
      <div class="w-full relative py-10 px-2">
        <div class="flex flex-col w-fit mx-auto gap-y-1 mb-[55px]">
          <h1 class="text-theme-text-primary font-semibold text-center text-2xl">
            {{ header.title }}
          </h1>
          <p class="text-theme-text-secondary text-base text-center">
            {{ header.description }}
          </p>
        </div>
        <slot :setHeader="setHeader" :setBackBtn="setBackBtn" :setForwardBtn="setForwardBtn" />
      </div>
      <div class="flex w-full justify-center gap-x-4 pb-20">
        <div class="flex justify-center items-center">
          <button
            v-if="backBtn.showing"
            :disabled="backBtn.disabled"
            @click="backBtn.onClick"
            class="group p-2 rounded-lg border-2 border-zinc-300 disabled:border-zinc-600 h-fit w-fit disabled:not-allowed hover:bg-zinc-100 disabled:hover:bg-transparent"
          >
            <ArrowLeft
              class="text-white group-hover:text-black group-disabled:text-gray-500"
              :size="30"
            />
          </button>
        </div>

        <div class="flex justify-center items-center">
          <button
            v-if="forwardBtn.showing"
            :disabled="forwardBtn.disabled"
            @click="forwardBtn.onClick"
            class="group p-2 rounded-lg border-2 border-zinc-300 disabled:border-zinc-600 h-fit w-fit disabled:not-allowed hover:bg-teal disabled:hover:bg-transparent"
          >
            <ArrowRight
              class="text-white group-hover:text-teal group-disabled:text-gray-500"
              :size="30"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop Layout -->
    <template v-else>
      <div class="flex w-1/5 h-screen justify-center items-center">
        <button
          v-if="backBtn.showing"
          :disabled="backBtn.disabled"
          @click="backBtn.onClick"
          class="group p-2 rounded-lg border-2 border-theme-sidebar-border h-fit w-fit disabled:cursor-not-allowed hover:bg-theme-bg-secondary disabled:hover:bg-transparent"
          aria-label="Back"
        >
          <ArrowLeft
            class="text-theme-text-secondary group-hover:text-theme-text-primary group-disabled:text-gray-500"
            :size="30"
          />
        </button>
      </div>

      <div class="w-full md:w-3/5 relative h-full py-10">
        <div class="flex flex-col w-fit mx-auto gap-y-1 mb-[55px]">
          <h1 class="text-theme-text-primary font-semibold text-center text-2xl">
            {{ header.title }}
          </h1>
          <p class="text-theme-text-secondary text-base text-center">
            {{ header.description }}
          </p>
        </div>
        <slot :setHeader="setHeader" :setBackBtn="setBackBtn" :setForwardBtn="setForwardBtn" />
      </div>

      <div class="flex w-1/5 h-screen justify-center items-center">
        <button
          v-if="forwardBtn.showing"
          :disabled="forwardBtn.disabled"
          @click="forwardBtn.onClick"
          class="group p-2 rounded-lg border-2 border-theme-sidebar-border h-fit w-fit disabled:cursor-not-allowed hover:bg-teal disabled:hover:bg-transparent"
          aria-label="Continue"
        >
          <ArrowRight
            class="text-theme-text-secondary group-hover:text-white group-disabled:text-gray-500"
            :size="30"
          />
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { isMobile } from 'react-device-detect';
import { PhArrowLeft, PhArrowRight } from '@phosphor-icons/vue';
import Home from './Home/index.vue';
import LLMPreference from './LLMPreference/index.vue';
import UserSetup from './UserSetup/index.vue';
import DataHandling from './DataHandling/index.vue';
import Survey from './Survey/index.vue';
import CreateWorkspace from './CreateWorkspace/index.vue';

// Export OnboardingSteps object
export const OnboardingSteps = {
  home: Home,
  'llm-preference': LLMPreference,
  'user-setup': UserSetup,
  'data-handling': DataHandling,
  survey: Survey,
  'create-workspace': CreateWorkspace,
};

const header = ref({
  title: '',
  description: '',
});

const backBtn = ref({
  showing: false,
  disabled: true,
  onClick: () => null,
});

const forwardBtn = ref({
  showing: false,
  disabled: true,
  onClick: () => null,
});

const setHeader = (value) => {
  header.value = value;
};

const setBackBtn = (value) => {
  backBtn.value = value;
};

const setForwardBtn = (value) => {
  forwardBtn.value = value;
};
</script>

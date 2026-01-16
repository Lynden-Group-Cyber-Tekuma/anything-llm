<template>
  <div class="relative w-screen h-screen flex overflow-hidden bg-theme-bg-primary">
    <div
      class="hidden md:block fixed bottom-10 left-10 w-[320px] h-[320px] bg-no-repeat bg-contain"
      :style="{ backgroundImage: `url(${srcSet.l})` }"
    ></div>

    <div
      class="hidden md:block fixed top-10 right-10 w-[320px] h-[320px] bg-no-repeat bg-contain"
      :style="{ backgroundImage: `url(${srcSet.r})` }"
    ></div>

    <div class="relative flex justify-center items-center m-auto">
      <div class="flex flex-col justify-center items-center">
        <p class="text-theme-text-primary font-thin text-[24px]">
          {{ t('onboarding.home.title') }}
        </p>
        <img
          :src="AnythingLLMLogo"
          alt="AnythingLLM"
          class="md:h-[50px] flex-shrink-0 max-w-[300px] light:invert"
        />
        <button
          @click="() => router.push(paths.onboarding.llmPreference())"
          class="border-[2px] border-theme-text-primary animate-pulse light:animate-none w-full md:max-w-[350px] md:min-w-[300px] text-center py-3 bg-theme-button-primary hover:bg-theme-bg-secondary text-theme-text-primary font-semibold text-sm my-10 rounded-md"
        >
          {{ t('onboarding.home.getStarted') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import paths from '@/utils/paths';
import LGroupImg from './l_group.png';
import RGroupImg from './r_group.png';
import LGroupImgLight from './l_group-light.png';
import RGroupImgLight from './r_group-light.png';
import AnythingLLMLogo from '@/media/logo/anything-llm.png';
import { useTheme } from '@/hooks/useTheme';

const router = useRouter();
const { t } = useI18n();
const { theme } = useTheme();

const IMG_SRCSET = {
  light: {
    l: LGroupImgLight,
    r: RGroupImgLight,
  },
  default: {
    l: LGroupImg,
    r: RGroupImg,
  },
};

const srcSet = computed(() => IMG_SRCSET[theme.value] || IMG_SRCSET.default);
</script>

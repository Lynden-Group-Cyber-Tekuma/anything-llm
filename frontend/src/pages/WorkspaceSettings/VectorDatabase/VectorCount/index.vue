<template>
  <div v-if="totalVectors === null">
    <h3 class="input-label">{{ t('general.vector.title') }}</h3>
    <p class="text-white text-opacity-60 text-xs font-medium py-1">
      {{ t('general.vector.description') }}
    </p>
    <div class="text-white text-opacity-60 text-sm font-medium">
      <PreLoader size="4" />
    </div>
  </div>
  <div v-else>
    <h3 class="input-label">{{ t('general.vector.title') }}</h3>
    <p class="text-white text-opacity-60 text-sm font-medium">
      {{ totalVectors }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import PreLoader from '@/components/Preloader';
import System from '@/models/system';

const props = defineProps({
  reload: {
    type: Boolean,
    default: false,
  },
  workspace: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();
const totalVectors = ref(null);

async function fetchVectorCount() {
  const vectors = await System.totalIndexes(props.workspace.slug);
  totalVectors.value = vectors;
}

onMounted(() => {
  fetchVectorCount();
});

watch(() => [props.workspace?.slug, props.reload], () => {
  fetchVectorCount();
});
</script>

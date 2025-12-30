<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Gauge } from '@phosphor-icons/vue'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const { t } = useI18n()
const model = ref(props.settings?.WhisperModelPref)
const models = ['Xenova/whisper-small', 'Xenova/whisper-large']
</script>

<template>
  <div class="w-full flex flex-col gap-y-4">
    <LocalWarning :model="model" />
    <div class="w-full flex items-center gap-4">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          {{ t('common.selection') }}
        </label>
        <select
          name="WhisperModelPref"
          v-model="model"
          class="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option
            v-for="(value, i) in models"
            :key="i"
            :value="value"
          >
            {{ value }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
// LocalWarning sub-component
export const LocalWarning = {
  name: 'LocalWarning',
  components: { Gauge },
  props: {
    model: String
  },
  setup(props) {
    const { t } = useI18n()

    return () => {
      if (props.model === 'Xenova/whisper-large') {
        return h('div', {
          class: 'flex flex-col md:flex-row md:items-center gap-x-2 text-white mb-4 bg-blue-800/30 w-fit rounded-lg px-4 py-2'
        }, [
          h('div', { class: 'gap-x-2 flex items-center' }, [
            h(Gauge, { size: 25 }),
            h('p', { class: 'text-sm' }, [
              t('transcription.warn-start'),
              h('br'),
              t('transcription.warn-recommend'),
              h('br'),
              h('br'),
              h('i', {}, `${t('transcription.warn-end')} (1.56GB)`)
            ])
          ])
        ])
      }

      // Default: Whisper Small
      return h('div', {
        class: 'flex flex-col md:flex-row md:items-center gap-x-2 text-white mb-4 bg-blue-800/30 w-fit rounded-lg px-4 py-2'
      }, [
        h('div', { class: 'gap-x-2 flex items-center' }, [
          h(Gauge, { size: 25 }),
          h('p', { class: 'text-sm' }, [
            t('transcription.warn-start'),
            h('br'),
            t('transcription.warn-recommend'),
            h('br'),
            h('br'),
            h('i', {}, `${t('transcription.warn-end')} (250mb)`)
          ])
        ])
      ])
    }
  }
}
</script>

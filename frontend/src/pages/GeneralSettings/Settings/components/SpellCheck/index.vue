<script setup>
import { ref } from 'vue'
import Appearance from '@/models/appearance'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const saving = ref(false)
const enableSpellCheck = ref(Appearance.get('enableSpellCheck'))

const handleChange = async (e) => {
  const newValue = e.target.checked
  enableSpellCheck.value = newValue
  saving.value = true
  try {
    Appearance.set('enableSpellCheck', newValue)
  } catch (error) {
    console.error('Failed to update appearance settings:', error)
    enableSpellCheck.value = !newValue
  }
  saving.value = false
}
</script>

<template>
  <div class="flex flex-col gap-y-0.5 my-4">
    <p class="text-sm leading-6 font-semibold text-white">
      {{ t('customization.chat.spellcheck.title') }}
    </p>
    <p class="text-xs text-white/60">
      {{ t('customization.chat.spellcheck.description') }}
    </p>
    <div class="flex items-center gap-x-4">
      <label class="relative inline-flex cursor-pointer items-center">
        <input
          id="spellcheck"
          type="checkbox"
          name="spellcheck"
          value="yes"
          :checked="enableSpellCheck"
          @change="handleChange"
          :disabled="saving"
          class="peer sr-only"
        />
        <div class="pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
      </label>
    </div>
  </div>
</template>

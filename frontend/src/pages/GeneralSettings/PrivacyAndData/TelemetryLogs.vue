<template>
  <div class="relative w-full max-h-full">
    <div class="relative rounded-lg">
      <div class="space-y-6 flex h-full w-full">
        <div class="w-full flex flex-col gap-y-4">
          <div>
            <label class="mb-2.5 block font-medium text-theme-text-primary">
              {{ t('privacy.anonymous') }}
            </label>
            <label class="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                @click="toggleTelemetry"
                :checked="telemetry"
                class="peer sr-only pointer-events-none"
              />
              <div class="peer-disabled:opacity-50 pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
            </label>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-left space-y-2">
        <p class="text-theme-text-secondary text-xs rounded-lg w-96">
          All events do not record IP-address and contain{" "}
          <b>no identifying</b> content, settings, chats, or other non-usage
          based information. To see the list of event tags collected you can
          look on{" "}
          <a
            href="https://github.com/search?q=repo%3AMintplex-Labs%2Fanything-llm%20.sendTelemetry(&type=code"
            class="underline text-blue-400"
            target="_blank"
          >
            GitHub here
          </a>
          .
        </p>
        <p class="text-theme-text-secondary text-xs rounded-lg w-96">
          As an open-source project we respect your right to privacy. We are
          dedicated to building the best solution for integrating AI and
          documents privately and securely. If you do decide to turn off
          telemetry all we ask is to consider sending us feedback and thoughts
          so that we can continue to improve AnythingLLM for you.{" "}
          <a
            href="mailto:team@mintplexlabs.com"
            class="underline text-blue-400"
            target="_blank"
          >
            team@mintplexlabs.com
          </a>
          .
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import System from '@/models/system'
import showToast from '@/utils/toast'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const telemetry = ref(props.settings?.DisableTelemetry !== 'true')

watch(() => props.settings, (newSettings) => {
  telemetry.value = newSettings?.DisableTelemetry !== 'true'
}, { immediate: true })

const toggleTelemetry = async () => {
  await System.updateSystem({
    DisableTelemetry: !telemetry.value ? 'false' : 'true',
  })
  telemetry.value = !telemetry.value
  showToast(
    `Anonymous Telemetry has been ${!telemetry.value ? 'enabled' : 'disabled'}.`,
    'info',
    { clear: true }
  )
}
</script>

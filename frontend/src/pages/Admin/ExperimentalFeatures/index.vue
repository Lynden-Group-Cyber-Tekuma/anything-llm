<script setup>
import { ref, onMounted } from 'vue'
import { isMobile } from 'react-device-detect'
import Admin from '@/models/admin'
import Sidebar from '@/components/SettingsSidebar'
import { CaretRight, Flask } from '@phosphor-icons/vue'
import { configurableFeatures } from './features'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import paths from '@/utils/paths'
import showToast from '@/utils/toast'

const featureFlags = ref({})
const loading = ref(true)
const selectedFeature = ref('experimental_live_file_sync')

const refresh = async () => {
  const { settings } = await Admin.systemPreferences()
  featureFlags.value = settings?.feature_flags ?? {}
}

onMounted(async () => {
  loading.value = true
  const { settings } = await Admin.systemPreferences()
  featureFlags.value = settings?.feature_flags ?? {}
  loading.value = false
})

const acceptTos = (e) => {
  e.preventDefault()

  window.localStorage.setItem(
    'anythingllm_tos_experimental_feature_set',
    'accepted'
  )
  showToast(
    'Experimental Feature set enabled. Reloading the page.',
    'success'
  )
  setTimeout(() => {
    window.location.reload()
  }, 2_500)
}

const showTosModal = !window.localStorage.getItem('anythingllm_tos_experimental_feature_set')
</script>

<template>
  <div
    id="workspace-feature-settings-container"
    class="w-screen h-screen overflow-hidden bg-theme-bg-container flex md:mt-0 mt-6"
  >
    <Sidebar />
    <div
      v-if="loading"
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] w-full h-full flex justify-center items-center"
    >
      <div class="flex items-center justify-center h-full">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    </div>
    <div
      v-else
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] w-full h-full flex"
    >
      <div class="flex-1 flex gap-x-6 p-4 mt-10">
        <!-- Feature settings nav -->
        <div class="flex flex-col gap-y-[18px]">
          <div class="text-white flex items-center gap-x-2">
            <Flask :size="24" />
            <p class="text-lg font-medium">Experimental Features</p>
          </div>
          <!-- Feature list -->
          <div class="bg-theme-bg-secondary text-white rounded-xl min-w-[360px] w-fit">
            <div
              v-for="(feature, index) in Object.values(configurableFeatures)"
              :key="feature.key"
              :class="[
                'py-3 px-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-white/5',
                index === 0 ? 'rounded-t-xl' : '',
                index === Object.values(configurableFeatures).length - 1
                  ? 'rounded-b-xl'
                  : 'border-b border-white/10',
                selectedFeature === feature.key ? 'bg-white/10 light:bg-theme-bg-sidebar' : ''
              ]"
              @click="
                () => {
                  if (feature?.href) window.location = feature.href
                  else selectedFeature = feature.key
                }
              "
            >
              <div class="text-sm font-light">{{ feature.title }}</div>
              <div class="flex items-center gap-x-2">
                <template v-if="feature.autoEnabled">
                  <div class="text-sm text-theme-text-secondary font-medium">
                    On
                  </div>
                  <div class="w-[14px]" />
                </template>
                <template v-else>
                  <div class="text-sm text-theme-text-secondary font-medium">
                    {{ featureFlags[feature.key] ? 'On' : 'Off' }}
                  </div>
                  <CaretRight
                    :size="14"
                    weight="bold"
                    class="text-theme-text-secondary"
                  />
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected feature setting panel -->
        <div class="flex-[2] flex flex-col gap-y-[18px] mt-10">
          <div class="bg-theme-bg-secondary text-white rounded-xl flex-1 p-4">
            <component
              v-if="selectedFeature && configurableFeatures[selectedFeature]?.component"
              :is="configurableFeatures[selectedFeature].component"
              :enabled="featureFlags[configurableFeatures[selectedFeature].key]"
              :feature="configurableFeatures[selectedFeature].key"
              :on-toggle="refresh"
            />
            <div
              v-else
              class="flex flex-col items-center justify-center h-full text-white/60"
            >
              <Flask :size="40" />
              <p class="font-medium">Select an experimental feature</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TOS Modal -->
      <ModalWrapper :is-open="showTosModal">
        <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
          <div class="relative p-6 border-b rounded-t border-theme-modal-border">
            <div class="flex items-center gap-2">
              <Flask :size="24" class="text-theme-text-primary" />
              <h3 class="text-xl font-semibold text-white">
                Terms of use for experimental features
              </h3>
            </div>
          </div>
          <form @submit="acceptTos">
            <div class="py-7 px-9 space-y-4 flex-col">
              <div class="w-full text-white text-md flex flex-col gap-y-4">
                <p>
                  Experimental features of AnythingLLM are features that we
                  are piloting and are <b>opt-in</b>. We proactively will
                  condition or warn you on any potential concerns should any
                  exist prior to approval of any feature.
                </p>

                <div>
                  <p>
                    Use of any feature on this page can result in, but not
                    limited to, the following possibilities.
                  </p>
                  <ul class="list-disc ml-6 text-sm font-mono mt-2">
                    <li>Loss of data.</li>
                    <li>Change in quality of results.</li>
                    <li>Increased storage.</li>
                    <li>Increased resource consumption.</li>
                    <li>
                      Increased cost or use of any connected LLM or embedding
                      provider.
                    </li>
                    <li>Potential bugs or issues using AnythingLLM.</li>
                  </ul>
                </div>

                <div>
                  <p>
                    Use of an experimental feature also comes with the
                    following list of non-exhaustive conditions.
                  </p>
                  <ul class="list-disc ml-6 text-sm font-mono mt-2">
                    <li>Feature may not exist in future updates.</li>
                    <li>The feature being used is not currently stable.</li>
                    <li>
                      The feature may not be available in future versions,
                      configurations, or subscriptions of AnythingLLM.
                    </li>
                    <li>
                      Your privacy settings <b>will be honored</b> with use of
                      any beta feature.
                    </li>
                    <li>These conditions may change in future updates.</li>
                  </ul>
                </div>

                <p>
                  Access to any features requires approval of this modal. If
                  you would like to read more you can refer to{" "}
                  <a
                    href="https://docs.anythingllm.com/beta-preview/overview"
                    class="underline text-blue-500"
                  >
                    docs.anythingllm.com
                  </a>{" "}
                  or email{" "}
                  <a
                    href="mailto:team@mintplexlabs.com"
                    class="underline text-blue-500"
                  >
                    team@mintplexlabs.com
                  </a>
                </p>
              </div>
            </div>
            <div class="flex w-full justify-between items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
              <a
                :href="paths.home()"
                class="transition-all duration-300 bg-transparent text-white hover:bg-red-500/50 light:hover:bg-red-300/50 px-4 py-2 rounded-lg text-sm border border-theme-modal-border"
              >
                Reject & close
              </a>
              <button
                type="submit"
                class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm border border-theme-modal-border"
              >
                I understand
              </button>
            </div>
          </form>
        </div>
      </ModalWrapper>
    </div>
  </div>
</template>

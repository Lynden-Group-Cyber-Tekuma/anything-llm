<template>
  <WidgetLayout>
    <div v-if="isMobile" class="flex flex-col w-full p-4 mt-10">
      <div
        v-show="!showViewModal"
        class="flex flex-col gap-y-[18px] overflow-y-scroll no-scroll"
      >
        <div class="text-theme-text-primary flex items-center gap-x-2">
          <p class="text-lg font-medium">Chat Embed</p>
        </div>
        <WidgetList
          :selectedView="selectedView"
          :handleClick="(view) => {
            selectedView = view
            showViewModal = true
          }"
        />
      </div>
      <div v-if="showViewModal" class="fixed top-0 left-0 w-full h-full bg-sidebar z-30">
        <div class="flex flex-col h-full">
          <div class="flex items-center p-4">
            <button
              type="button"
              @click="() => {
                showViewModal = false
                selectedView = ''
              }"
              class="text-white/60 hover:text-white transition-colors duration-200"
            >
              <div class="flex items-center text-sky-400">
                <CaretLeft :size="24" />
                <div>Back</div>
              </div>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <div class="bg-theme-bg-secondary text-white rounded-xl p-4 overflow-y-scroll no-scroll">
              <EmbedConfigsView v-if="selectedView === 'configs'" />
              <EmbedChatsView v-else />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex gap-x-6 p-4 mt-10">
      <div class="flex flex-col min-w-[360px] h-[calc(100vh-90px)]">
        <div class="flex-none mb-4">
          <div class="text-theme-text-primary flex items-center gap-x-2">
            <p class="text-lg font-medium">Chat Embed</p>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto pr-2 pb-4">
          <div class="space-y-4">
            <WidgetList
              :selectedView="selectedView"
              :handleClick="(view) => selectedView = view"
            />
          </div>
        </div>
      </div>
      <div class="flex-[2] flex flex-col gap-y-[18px] mt-10">
        <div class="bg-theme-bg-secondary text-white rounded-xl flex-1 p-4 overflow-y-scroll no-scroll">
          <EmbedConfigsView v-if="selectedView === 'configs'" />
          <EmbedChatsView v-else />
        </div>
      </div>
    </div>
  </WidgetLayout>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/SettingsSidebar/index.vue'
import { isMobile } from 'react-device-detect'
import { CaretLeft, CaretRight } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'
import EmbedConfigsView from './EmbedConfigs/index.vue'
import EmbedChatsView from './EmbedChats/index.vue'

const { t } = useI18n()
const selectedView = ref('configs')
const showViewModal = ref(false)
</script>

<script>
import { isMobile } from 'react-device-detect'
import { CaretRight } from '@phosphor-icons/vue'

export const WidgetLayout = {
  name: 'WidgetLayout',
  props: {
    children: null
  },
  template: `
    <div
      id="workspace-widget-settings-container"
      class="w-screen h-screen overflow-hidden bg-theme-bg-container flex md:mt-0 mt-6"
    >
      <Sidebar />
      <div
        :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
        class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] w-full h-full flex"
      >
        <slot />
      </div>
    </div>
  `,
  setup() {
    return { isMobile }
  }
}

export const WidgetList = {
  name: 'WidgetList',
  props: {
    selectedView: String,
    handleClick: Function
  },
  setup() {
    const views = {
      configs: {
        title: 'Widgets',
      },
      chats: {
        title: 'History',
      },
    }

    return { views, isMobile }
  },
  template: `
    <div
      :class="[
        'bg-theme-bg-secondary text-white rounded-xl',
        isMobile ? 'w-full' : 'min-w-[360px] w-fit'
      ]"
    >
      <div
        v-for="([view, settings], index) in Object.entries(views)"
        :key="view"
        :class="[
          'py-3 px-4 flex items-center justify-between',
          index === 0 ? 'rounded-t-xl' : '',
          index === Object.keys(views).length - 1 ? 'rounded-b-xl' : 'border-b border-white/10',
          'cursor-pointer transition-all duration-300 hover:bg-theme-bg-primary',
          selectedView === view ? 'bg-white/10 light:bg-theme-bg-sidebar' : ''
        ]"
        @click="() => handleClick?.(view)"
      >
        <div class="text-sm font-light">{{ settings.title }}</div>
        <CaretRight
          :size="14"
          weight="bold"
          class="text-theme-text-secondary"
        />
      </div>
    </div>
  `
}
</script>

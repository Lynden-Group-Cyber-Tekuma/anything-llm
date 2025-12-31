<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isMobile } from 'react-device-detect'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useI18n } from 'vue-i18n'
import Sidebar from '@/components/SettingsSidebar'
import System from '@/models/system'
import showToast from '@/utils/toast'
import CTAButton from '@/components/lib/CTAButton/index.vue'
import LogRow from './LogRow/index.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const logs = ref([])
const offset = ref(Number(route.query.offset || 0))
const canNext = ref(false)

const fetchLogs = async () => {
  const { logs: _logs, hasPages = false } = await System.eventLogs(offset.value)
  logs.value = _logs
  canNext.value = hasPages
  loading.value = false
}

const handleResetLogs = async () => {
  if (
    !window.confirm(
      'Are you sure you want to clear all event logs? This action is irreversible.'
    )
  )
    return

  const { success, error } = await System.clearEventLogs()
  if (success) {
    showToast('Event logs cleared successfully.', 'success')
    logs.value = []
    canNext.value = false
    offset.value = 0
  } else {
    showToast(`Failed to clear logs: ${error}`, 'error')
  }
}

const handlePrevious = () => {
  offset.value = Math.max(offset.value - 1, 0)
}

const handleNext = () => {
  offset.value = offset.value + 1
}

watch(offset, () => {
  fetchLogs()
})

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar />
    <div
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
    >
      <div class="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
        <div class="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
          <div class="flex gap-x-4 items-center">
            <p class="text-lg leading-6 font-bold text-theme-text-primary">
              {{ t('event.title') }}
            </p>
          </div>
          <p class="text-xs leading-[18px] font-base text-theme-text-secondary mt-2">
            {{ t('event.description') }}
          </p>
        </div>
        <div class="w-full justify-end flex">
          <CTAButton
            @click="handleResetLogs"
            class-name="mt-3 mr-0 mb-4 md:-mb-14 z-10"
          >
            {{ t('event.clear') }}
          </CTAButton>
        </div>
        <div class="overflow-x-auto mt-6">
          <Skeleton
            v-if="loading"
            height="80vh"
            width="100%"
            highlightColor="var(--theme-bg-primary)"
            baseColor="var(--theme-bg-secondary)"
            :count="1"
            class="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm"
            containerClassName="flex w-full"
          />
          <template v-else>
            <table class="w-full text-xs text-left rounded-lg min-w-[640px] border-spacing-0">
              <thead class="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
                <tr>
                  <th scope="col" class="px-6 py-3 rounded-tl-lg">
                    {{ t('event.table.type') }}
                  </th>
                  <th scope="col" class="px-6 py-3">
                    {{ t('event.table.user') }}
                  </th>
                  <th scope="col" class="px-6 py-3">
                    {{ t('event.table.occurred') }}
                  </th>
                  <th scope="col" class="px-6 py-3 rounded-tr-lg">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                <LogRow
                  v-for="log in logs"
                  :key="log.id"
                  :log="log"
                />
              </tbody>
            </table>
            <div class="flex w-full justify-between items-center mt-6">
              <button
                @click="handlePrevious"
                class="px-4 py-2 rounded-lg border border-slate-200 text-slate-200 light:text-theme-text-secondary light:border-theme-sidebar-border text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 disabled:invisible"
                :disabled="offset === 0"
              >
                {{ t('common.previous') }}
              </button>
              <button
                @click="handleNext"
                class="px-4 py-2 rounded-lg border border-slate-200 text-slate-200 light:text-theme-text-secondary light:border-theme-sidebar-border text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 disabled:invisible"
                :disabled="!canNext"
              >
                {{ t('common.next') }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

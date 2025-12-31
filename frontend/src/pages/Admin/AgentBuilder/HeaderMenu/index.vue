<template>
  <div class="absolute top-[calc(40px+16px)] left-4 right-4">
    <div class="flex justify-between items-start max-w-[1700px] mx-auto">
      <div class="flex items-center gap-x-2">
        <button
          @click="router.push(paths.settings.agentSkills())"
          class="w-8 h-8 flex items-center justify-center rounded-full bg-theme-settings-input-bg border border-white/10 hover:bg-theme-action-menu-bg transition-colors duration-300"
          type="button"
        >
          <CaretLeft
            weight="bold"
            class="w-5 h-5 text-theme-text-primary"
          />
        </button>
        <div
          ref="dropdownRef"
          class="flex items-center bg-theme-settings-input-bg rounded-md border border-white/10 pointer-events-auto"
        >
          <button
            @click="router.push(paths.settings.agentSkills())"
            class="!border-t-transparent !border-l-transparent !border-b-transparent flex items-center gap-x-2 px-4 py-2 border-r border-white/10 hover:bg-theme-action-menu-bg transition-colors duration-300"
            type="button"
          >
            <img
              :src="AnythingInfinityLogo"
              alt="logo"
              class="w-[20px] light:invert"
            />
            <span class="text-theme-text-primary text-sm uppercase tracking-widest">
              Builder
            </span>
          </button>
          <div class="relative">
            <button
              :disabled="!hasOtherFlows"
              class="border-none flex items-center justify-between gap-x-1 text-theme-text-primary text-sm px-4 py-2 enabled:hover:bg-theme-action-menu-bg transition-colors duration-300 min-w-[200px] max-w-[300px]"
              @click="() => {
                if (!agentName && !hasOtherFlows) {
                  const agentNameInput = document.getElementById('agent-flow-name-input')
                  if (agentNameInput) agentNameInput.focus()
                  return
                }
                showDropdown = !showDropdown
              }"
              type="button"
            >
              <span
                :class="[
                  'text-sm font-medium truncate',
                  agentName ? 'text-theme-text-primary' : 'text-theme-text-secondary'
                ]"
              >
                {{ agentName || 'Untitled Flow' }}
              </span>
              <div v-if="hasOtherFlows" class="flex flex-col ml-2 shrink-0">
                <CaretUp :size="10" />
                <CaretDown :size="10" />
              </div>
            </button>
            <div
              v-if="showDropdown"
              class="absolute top-full left-0 mt-1 w-full min-w-[200px] max-w-[350px] bg-theme-settings-input-bg border border-white/10 rounded-md shadow-lg z-50 animate-fadeUpIn"
            >
              <button
                v-for="flow in availableFlows.filter((flow) => flow.uuid !== flowId)"
                :key="flow?.uuid || Math.random()"
                @click="() => {
                  router.push(paths.agents.editAgent(flow.uuid))
                  showDropdown = false
                }"
                class="border-none w-full text-left px-2 py-1 text-sm text-theme-text-primary hover:bg-theme-action-menu-bg transition-colors duration-300"
                type="button"
              >
                <span class="block truncate">
                  {{ flow?.name || 'Untitled Flow' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-y-1 items-end">
        <div class="flex items-center gap-x-[15px]">
          <button
            @click="onNewFlow"
            class="flex items-center gap-x-2 text-theme-text-primary text-sm font-medium px-3 py-2 rounded-lg border border-white bg-theme-settings-input-bg hover:bg-theme-action-menu-bg transition-colors duration-300"
            type="button"
          >
            <Plus class="w-4 h-4" />
            New Flow
          </button>
          <button
            @click="onPublishFlow"
            class="px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border border-white/10 bg-theme-bg-primary text-theme-text-primary hover:bg-theme-action-menu-bg transition-all duration-300"
            type="button"
          >
            Publish
          </button>
          <button
            @click="onSaveFlow"
            class="border-none bg-primary-button hover:opacity-80 text-black light:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
            type="button"
          >
            Save
          </button>
        </div>
        <a
          href="https://docs.anythingllm.com/agent-flows/overview"
          target="_blank"
          rel="noopener noreferrer"
          class="text-theme-text-secondary text-sm hover:underline hover:text-cta-button flex items-center gap-x-1 w-fit float-right"
        >
          view documentation &rarr;
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CaretDown, CaretUp, Plus, CaretLeft } from '@phosphor-icons/vue'
import AnythingInfinityLogo from '@/media/logo/anything-llm-infinity.png'
import paths from '@/utils/paths'

const props = defineProps({
  agentName: {
    type: String,
    default: ''
  },
  availableFlows: {
    type: Array,
    default: () => []
  },
  onNewFlow: {
    type: Function,
    required: true
  },
  onSaveFlow: {
    type: Function,
    required: true
  },
  onPublishFlow: {
    type: Function,
    required: true
  }
})

const router = useRouter()
const route = useRoute()
const flowId = computed(() => route.params.flowId || null)

const showDropdown = ref(false)
const dropdownRef = ref(null)

const hasOtherFlows = computed(() => {
  return props.availableFlows.filter((flow) => flow.uuid !== flowId.value).length > 0
})

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

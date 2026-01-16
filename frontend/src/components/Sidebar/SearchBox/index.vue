<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { PhPlus, PhMagnifyingGlass } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import paths from '@/utils/paths'
import Preloader from '@/components/Preloader'
import Workspace from '@/models/workspace'

const DEFAULT_SEARCH_RESULTS = {
  workspaces: [],
  threads: []
}

const SEARCH_RESULT_SELECTED = 'search-result-selected'

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  showNewWsModal: {
    type: Function,
    required: true
  }
})

const { t } = useI18n()
const searchRef = ref(null)
const searchTerm = ref('')
const loading = ref(false)
const searchResults = ref(DEFAULT_SEARCH_RESULTS)

// Debounce utility function
let debounceTimer = null
function debounce(func, delay) {
  return function(...args) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => func.apply(this, args), delay)
  }
}

async function handleSearchDebounced(e) {
  try {
    const searchValue = e.target.value
    searchTerm.value = searchValue
    loading.value = true
    const results = await Workspace.searchWorkspaceOrThread(searchValue)
    searchResults.value = results
  } catch (error) {
    console.error(error)
    searchResults.value = DEFAULT_SEARCH_RESULTS
  } finally {
    loading.value = false
  }
}

const handleSearch = debounce(handleSearchDebounced, 500)

function handleReset() {
  if (searchRef.value) {
    searchRef.value.value = ''
  }
  searchTerm.value = ''
  loading.value = false
  searchResults.value = DEFAULT_SEARCH_RESULTS
}

onMounted(() => {
  window.addEventListener(SEARCH_RESULT_SELECTED, handleReset)
})

onUnmounted(() => {
  window.removeEventListener(SEARCH_RESULT_SELECTED, handleReset)
})

// Computed properties for sub-components
const shouldShowNewWorkspaceButton = computed(() => {
  return !props.user || props.user.role !== 'default'
})

const workspaceItems = computed(() => {
  return searchResults.value.workspaces?.map((workspace) => ({
    id: workspace.slug,
    to: paths.workspace.chat(workspace.slug),
    name: workspace.name
  })) || []
})

const threadItems = computed(() => {
  return searchResults.value.threads?.map((thread) => ({
    id: thread.slug,
    to: paths.workspace.thread(thread.workspace.slug, thread.slug),
    name: thread.name,
    hint: thread.workspace.name
  })) || []
})

const showResults = computed(() => searchTerm.value && searchTerm.value.length >= 3)
const hasNoResults = computed(() =>
  searchResults.value.workspaces.length === 0 &&
  searchResults.value.threads.length === 0
)

function handleResultClick() {
  window.dispatchEvent(new Event(SEARCH_RESULT_SELECTED))
}
</script>

<template>
  <div class="flex gap-x-[5px] w-full items-center h-[32px]">
    <div class="relative h-full w-full flex">
      <input
        ref="searchRef"
        type="search"
        :placeholder="t('common.search')"
        @input="handleSearch"
        @reset="handleReset"
        @focus="(e) => e.target.select()"
        class="border-none w-full h-full rounded-lg bg-theme-sidebar-item-default pl-9 focus:pl-4 pr-1 placeholder:text-theme-settings-input-placeholder outline-none text-white search-input peer text-sm"
      />
      <MagnifyingGlass
        :size="14"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-settings-input-placeholder peer-focus:invisible"
        weight="bold"
        v-show="!searchTerm"
      />
    </div>

    <!-- New Workspace Button -->
    <button
      v-if="shouldShowNewWorkspaceButton"
      :title="t('new-workspace.title')"
      @click="showNewWsModal"
      class="border-none flex items-center justify-center bg-white rounded-lg p-[8px] hover:bg-white/80 transition-all duration-300"
    >
      <PhPlus :size="16" weight="bold" class="text-black" />
    </button>

    <!-- Search Results -->
    <div
      v-if="showResults"
      class="absolute right-0 top-[6.2%] w-full flex flex-col gap-y-[24px] h-auto bg-theme-modal-border light:bg-theme-bg-primary light:border-2 light:border-theme-modal-border rounded-lg p-[16px] z-10 max-h-[calc(100%-24px)] overflow-y-scroll no-scroll"
    >
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col gap-y-[8px] h-[200px] justify-center items-center">
        <Preloader :size="5" />
        <p class="text-theme-text-secondary text-xs font-semibold text-center">
          Searching for "{{ searchTerm }}"
        </p>
      </div>

      <!-- No Results -->
      <div v-else-if="hasNoResults" class="flex flex-col gap-y-[8px] h-[200px] justify-center items-center">
        <p class="text-theme-text-secondary text-xs font-semibold text-center">
          No results found for
          <br />
          <span class="text-theme-text-primary font-semibold text-sm">
            "{{ searchTerm }}"
          </span>
        </p>
      </div>

      <!-- Results -->
      <template v-else>
        <!-- Workspaces -->
        <div v-if="workspaceItems.length > 0" class="flex flex-col gap-y-[8px]">
          <p class="text-theme-text-secondary text-xs uppercase font-semibold px-[4px]">
            Workspaces
          </p>
          <div class="flex flex-col gap-y-[6px]">
            <RouterLink
              v-for="item in workspaceItems"
              :key="item.id"
              :to="item.to"
              @click="handleResultClick"
              class="hover:bg-[#FFF]/10 light:hover:bg-[#000]/10 transition-all duration-300 rounded-sm px-[8px] py-[2px]"
            >
              <p class="text-theme-text-primary text-sm truncate w-[80%]">
                {{ item.name }}
              </p>
            </RouterLink>
          </div>
        </div>

        <!-- Threads -->
        <div v-if="threadItems.length > 0" class="flex flex-col gap-y-[8px]">
          <p class="text-theme-text-secondary text-xs uppercase font-semibold px-[4px]">
            Threads
          </p>
          <div class="flex flex-col gap-y-[6px]">
            <RouterLink
              v-for="item in threadItems"
              :key="item.id"
              :to="item.to"
              @click="handleResultClick"
              class="hover:bg-[#FFF]/10 light:hover:bg-[#000]/10 transition-all duration-300 rounded-sm px-[8px] py-[2px]"
            >
              <p class="text-theme-text-primary text-sm truncate w-[80%]">
                {{ item.name }}
                <span v-if="item.hint" class="text-theme-text-secondary text-xs ml-[4px]">
                  | {{ item.hint }}
                </span>
              </p>
            </RouterLink>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

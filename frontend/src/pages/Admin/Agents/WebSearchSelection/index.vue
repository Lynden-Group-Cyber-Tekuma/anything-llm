<template>
  <div class="p-2">
    <div class="flex flex-col gap-y-[18px] max-w-[500px]">
      <div class="flex items-center gap-x-2">
        <ListMagnifyingGlass
          :size="24"
          color="var(--theme-text-primary)"
          weight="bold"
        />
        <label
          for="name"
          class="text-theme-text-primary text-md font-bold"
        >
          Live web search and browsing
        </label>
        <label class="border-none relative inline-flex items-center ml-auto cursor-pointer">
          <input
            type="checkbox"
            class="peer sr-only"
            :checked="enabled"
            @change="toggleSkill(skill)"
          />
          <div class="peer-disabled:opacity-50 pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
          <span class="ml-3 text-sm font-medium"></span>
        </label>
      </div>
      <img
        :src="WebSearchImage"
        alt="Web Search"
        class="w-full rounded-md"
      />
      <p class="text-theme-text-secondary text-opacity-60 text-xs font-medium py-1.5">
        Enable your agent to search the web to answer your questions by
        connecting to a web-search (SERP) provider. Web search during agent
        sessions will not work until this is set up.
      </p>
      <div :hidden="!enabled">
        <div class="relative">
          <input
            type="hidden"
            name="system::agent_search_provider"
            :value="selectedProvider"
          />
          <div
            v-if="searchMenuOpen"
            class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 backdrop-blur-sm z-10"
            @click="searchMenuOpen = false"
          />
          <div
            v-if="searchMenuOpen"
            class="absolute top-0 left-0 w-full max-w-[640px] max-h-[310px] min-h-[64px] bg-theme-settings-input-bg rounded-lg flex flex-col justify-between cursor-pointer border-2 border-primary-button z-20"
          >
            <div class="w-full flex flex-col gap-y-1">
              <div class="flex items-center sticky top-0 z-10 border-b border-[#9CA3AF] mx-4 bg-theme-settings-input-bg">
                <MagnifyingGlass
                  :size="20"
                  weight="bold"
                  class="absolute left-4 z-30 text-theme-text-primary -ml-4 my-2"
                />
                <input
                  ref="searchInputRef"
                  type="text"
                  name="web-provider-search"
                  autocomplete="off"
                  placeholder="Search available web-search providers"
                  class="border-none -ml-4 my-2 bg-transparent z-20 pl-12 h-[38px] w-full px-4 py-1 text-sm outline-none text-theme-text-primary placeholder:text-theme-text-primary placeholder:font-medium"
                  @input="searchQuery = $event.target.value"
                  @keydown.enter.prevent
                />
                <X
                  :size="20"
                  weight="bold"
                  class="cursor-pointer text-white hover:text-x-button"
                  @click="handleXButton"
                />
              </div>
              <div class="flex-1 pl-4 pr-2 flex flex-col gap-y-1 overflow-y-auto white-scrollbar pb-4 max-h-[245px]">
                <SearchProviderItem
                  v-for="provider in filteredResults"
                  :key="provider.name"
                  :provider="provider"
                  :checked="selectedProvider === provider.value"
                  @click="updateChoice(provider.value)"
                />
              </div>
            </div>
          </div>
          <button
            v-else
            class="w-full max-w-[640px] h-[64px] bg-theme-settings-input-bg rounded-lg flex items-center p-[14px] justify-between cursor-pointer border-2 border-transparent hover:border-primary-button transition-all duration-300"
            type="button"
            @click="searchMenuOpen = true"
          >
            <div class="flex gap-x-4 items-center">
              <img
                :src="selectedSearchProviderObject.logo"
                :alt="`${selectedSearchProviderObject.name} logo`"
                class="w-10 h-10 rounded-md"
              />
              <div class="flex flex-col text-left">
                <div class="text-sm font-semibold text-white">
                  {{ selectedSearchProviderObject.name }}
                </div>
                <div class="mt-1 text-xs text-description">
                  {{ selectedSearchProviderObject.description }}
                </div>
              </div>
            </div>
            <CaretUpDown :size="24" weight="bold" class="text-white" />
          </button>
        </div>
        <div v-if="selectedProvider !== 'none'" class="mt-4 flex flex-col gap-y-1">
          <component :is="selectedSearchProviderObject.options" :settings="settings" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Admin from '@/models/admin'
import AnythingLLMIcon from '@/media/logo/anything-llm-icon.png'
import GoogleSearchIcon from './icons/google.png'
import SerpApiIcon from './icons/serpapi.png'
import SearchApiIcon from './icons/searchapi.png'
import SerperDotDevIcon from './icons/serper.png'
import BingSearchIcon from './icons/bing.png'
import SerplySearchIcon from './icons/serply.png'
import SearXNGSearchIcon from './icons/searxng.png'
import TavilySearchIcon from './icons/tavily.svg'
import DuckDuckGoIcon from './icons/duckduckgo.png'
import ExaIcon from './icons/exa.png'
import { PhCaretUpDown, PhMagnifyingGlass, PhX, PhListMagnifyingGlass } from '@phosphor-icons/vue'
import SearchProviderItem from './SearchProviderItem/index.vue'
import WebSearchImage from '@/media/agents/scrape-websites.png'
import {
  SerpApiOptions,
  SearchApiOptions,
  SerperDotDevOptions,
  GoogleSearchOptions,
  BingSearchOptions,
  SerplySearchOptions,
  SearXNGOptions,
  TavilySearchOptions,
  DuckDuckGoOptions,
  ExaSearchOptions
} from './SearchProviderOptions/index.vue'

const props = defineProps({
  skill: {
    type: String,
    required: true
  },
  settings: {
    type: Object,
    default: () => ({})
  },
  toggleSkill: {
    type: Function,
    required: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  setHasChanges: {
    type: Function,
    required: true
  }
})

const SEARCH_PROVIDERS = [
  {
    name: 'Please make a selection',
    value: 'none',
    logo: AnythingLLMIcon,
    options: () => null,
    description:
      'Web search will be disabled until a provider and keys are provided.'
  },
  {
    name: 'DuckDuckGo',
    value: 'duckduckgo-engine',
    logo: DuckDuckGoIcon,
    options: DuckDuckGoOptions,
    description: 'Free and privacy-focused web search using DuckDuckGo.'
  },
  {
    name: 'Google Search Engine',
    value: 'google-search-engine',
    logo: GoogleSearchIcon,
    options: GoogleSearchOptions,
    description: 'Web search powered by a custom Google Search Engine.'
  },
  {
    name: 'SerpApi',
    value: 'serpapi',
    logo: SerpApiIcon,
    options: SerpApiOptions,
    description:
      'Scrape Google and several other search engines with SerpApi. 250 free searches every month, and then paid.'
  },
  {
    name: 'SearchApi',
    value: 'searchapi',
    logo: SearchApiIcon,
    options: SearchApiOptions,
    description:
      'SearchApi delivers structured data from multiple search engines. Free for 100 queries, but then paid. '
  },
  {
    name: 'Serper.dev',
    value: 'serper-dot-dev',
    logo: SerperDotDevIcon,
    options: SerperDotDevOptions,
    description:
      'Serper.dev web-search. Free account with a 2,500 calls, but then paid.'
  },
  {
    name: 'Bing Search',
    value: 'bing-search',
    logo: BingSearchIcon,
    options: BingSearchOptions,
    description: 'Web search powered by the Bing Search API (paid service).'
  },
  {
    name: 'Serply.io',
    value: 'serply-engine',
    logo: SerplySearchIcon,
    options: SerplySearchOptions,
    description:
      'Serply.io web-search. Free account with a 100 calls/month forever.'
  },
  {
    name: 'SearXNG',
    value: 'searxng-engine',
    logo: SearXNGSearchIcon,
    options: SearXNGOptions,
    description:
      'Free, open-source, internet meta-search engine with no tracking.'
  },
  {
    name: 'Tavily Search',
    value: 'tavily-search',
    logo: TavilySearchIcon,
    options: TavilySearchOptions,
    description:
      'Tavily Search API. Offers a free tier with 1000 queries per month.'
  },
  {
    name: 'Exa Search',
    value: 'exa-search',
    logo: ExaIcon,
    options: ExaSearchOptions,
    description: 'AI-powered search engine optimized for LLM use cases.'
  }
]

const searchInputRef = ref(null)
const filteredResults = ref([])
const selectedProvider = ref('none')
const searchQuery = ref('')
const searchMenuOpen = ref(false)

const selectedSearchProviderObject = computed(() =>
  SEARCH_PROVIDERS.find((provider) => provider.value === selectedProvider.value)
)

function updateChoice(selection) {
  searchQuery.value = ''
  selectedProvider.value = selection
  searchMenuOpen.value = false
  props.setHasChanges(true)
}

function handleXButton() {
  if (searchQuery.value.length > 0) {
    searchQuery.value = ''
    if (searchInputRef.value) searchInputRef.value.value = ''
  } else {
    searchMenuOpen.value = !searchMenuOpen.value
  }
}

watch([searchQuery, selectedProvider], () => {
  const filtered = SEARCH_PROVIDERS.filter((provider) =>
    provider.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  filteredResults.value = filtered
}, { immediate: true })

onMounted(() => {
  Admin.systemPreferencesByFields(['agent_search_provider'])
    .then((res) =>
      selectedProvider.value = res?.settings?.agent_search_provider ?? 'none'
    )
    .catch(() => selectedProvider.value = 'none')
})
</script>

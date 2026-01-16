<template>
  <component :is="optionComponent" :settings="settings" />
</template>

<script setup>
import { computed } from 'vue'
import GoogleSearchOptions from './GoogleSearchOptions.vue'
import SerpApiOptions from './SerpApiOptions.vue'
import SearchApiOptions from './SearchApiOptions.vue'
import SerperDotDevOptions from './SerperDotDevOptions.vue'
import BingSearchOptions from './BingSearchOptions.vue'
import SerplySearchOptions from './SerplySearchOptions.vue'
import SearXNGOptions from './SearXNGOptions.vue'
import TavilySearchOptions from './TavilySearchOptions.vue'
import DuckDuckGoOptions from './DuckDuckGoOptions.vue'
import ExaSearchOptions from './ExaSearchOptions.vue'

const props = defineProps({
  provider: {
    type: String,
    required: true
  },
  settings: {
    type: Object,
    default: () => ({})
  }
})

const componentMap = {
  'google-search-engine': GoogleSearchOptions,
  'serpapi': SerpApiOptions,
  'searchapi': SearchApiOptions,
  'serper-dot-dev': SerperDotDevOptions,
  'bing-search': BingSearchOptions,
  'serply-engine': SerplySearchOptions,
  'searxng-engine': SearXNGOptions,
  'tavily-search': TavilySearchOptions,
  'duckduckgo-engine': DuckDuckGoOptions,
  'exa-search': ExaSearchOptions
}

const optionComponent = computed(() => componentMap[props.provider] || null)
</script>

<script>
export {
  default as GoogleSearchOptions
} from './GoogleSearchOptions.vue'
export {
  default as SerpApiOptions
} from './SerpApiOptions.vue'
export {
  default as SearchApiOptions
} from './SearchApiOptions.vue'
export {
  default as SerperDotDevOptions
} from './SerperDotDevOptions.vue'
export {
  default as BingSearchOptions
} from './BingSearchOptions.vue'
export {
  default as SerplySearchOptions
} from './SerplySearchOptions.vue'
export {
  default as SearXNGOptions
} from './SearXNGOptions.vue'
export {
  default as TavilySearchOptions
} from './TavilySearchOptions.vue'
export {
  default as DuckDuckGoOptions
} from './DuckDuckGoOptions.vue'
export {
  default as ExaSearchOptions
} from './ExaSearchOptions.vue'
</script>

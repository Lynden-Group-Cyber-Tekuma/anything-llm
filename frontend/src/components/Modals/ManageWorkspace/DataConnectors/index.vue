<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ConnectorImages from '@/components/DataConnectorOption/media'
import { MagnifyingGlass } from '@phosphor-icons/vue'
import GithubOptions from './Connectors/Github/index.vue'
import GitlabOptions from './Connectors/Gitlab/index.vue'
import YoutubeOptions from './Connectors/Youtube/index.vue'
import ConfluenceOptions from './Connectors/Confluence/index.vue'
import DrupalWikiOptions from './Connectors/DrupalWiki/index.vue'
import WebsiteDepthOptions from './Connectors/WebsiteDepth/index.vue'
import ObsidianOptions from './Connectors/Obsidian/index.vue'
import PaperlessNgxOptions from './Connectors/PaperlessNgx/index.vue'
import ConnectorOption from './ConnectorOption/index.vue'

const { t } = useI18n()
const selectedConnector = ref('github')
const searchQuery = ref('')

const getDataConnectors = () => ({
  github: {
    name: t('connectors.github.name'),
    image: ConnectorImages.github,
    description: t('connectors.github.description'),
    component: GithubOptions,
  },
  gitlab: {
    name: t('connectors.gitlab.name'),
    image: ConnectorImages.gitlab,
    description: t('connectors.gitlab.description'),
    component: GitlabOptions,
  },
  'youtube-transcript': {
    name: t('connectors.youtube.name'),
    image: ConnectorImages.youtube,
    description: t('connectors.youtube.description'),
    component: YoutubeOptions,
  },
  'website-depth': {
    name: t('connectors.website-depth.name'),
    image: ConnectorImages.websiteDepth,
    description: t('connectors.website-depth.description'),
    component: WebsiteDepthOptions,
  },
  confluence: {
    name: t('connectors.confluence.name'),
    image: ConnectorImages.confluence,
    description: t('connectors.confluence.description'),
    component: ConfluenceOptions,
  },
  drupalwiki: {
    name: 'Drupal Wiki',
    image: ConnectorImages.drupalwiki,
    description: 'Import Drupal Wiki spaces in a single click.',
    component: DrupalWikiOptions,
  },
  obsidian: {
    name: 'Obsidian',
    image: ConnectorImages.obsidian,
    description: 'Import Obsidian vault in a single click.',
    component: ObsidianOptions,
  },
  'paperless-ngx': {
    name: 'Paperless-ngx',
    image: ConnectorImages.paperlessNgx,
    description: 'Import documents from your Paperless-ngx instance.',
    component: PaperlessNgxOptions,
  },
})

const DATA_CONNECTORS = computed(() => getDataConnectors())

const filteredConnectors = computed(() =>
  Object.keys(DATA_CONNECTORS.value).filter((slug) =>
    DATA_CONNECTORS.value[slug].name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

const selectedConnectorComponent = computed(() =>
  DATA_CONNECTORS.value[selectedConnector.value]?.component
)
</script>

<template>
  <div class="flex upload-modal -mt-10 relative min-h-[80vh] w-[70vw]">
    <div class="w-full p-4 top-0 z-20">
      <div class="w-full flex items-center sticky top-0 z-50">
        <MagnifyingGlass
          :size="16"
          weight="bold"
          class="absolute left-4 z-30 text-white"
        />
        <input
          type="text"
          :placeholder="t('connectors.search-placeholder')"
          class="border-none z-20 pl-10 h-[38px] rounded-full w-full px-4 py-1 text-sm border-2 border-slate-300/40 outline-none focus:outline-primary-button active:outline-primary-button outline-none placeholder:text-theme-settings-input-placeholder text-white bg-theme-settings-input-bg"
          autocomplete="off"
          v-model="searchQuery"
        />
      </div>
      <div class="mt-2 flex flex-col gap-y-2">
        <template v-if="filteredConnectors.length > 0">
          <ConnectorOption
            v-for="(slug, index) in filteredConnectors"
            :key="index"
            :slug="slug"
            :selectedConnector="selectedConnector"
            @update:selectedConnector="selectedConnector = $event"
            :image="DATA_CONNECTORS[slug].image"
            :name="DATA_CONNECTORS[slug].name"
            :description="DATA_CONNECTORS[slug].description"
          />
        </template>
        <div v-else class="text-white text-center mt-4">
          {{ t('connectors.no-connectors') }}
        </div>
      </div>
    </div>
    <div class="xl:block hidden absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-white/20 -translate-x-1/2"></div>
    <div class="w-full p-4 top-0 text-white min-w-[500px]">
      <component :is="selectedConnectorComponent" />
    </div>
  </div>
</template>

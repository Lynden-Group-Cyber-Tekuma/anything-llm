<script setup>
import { ref } from 'vue'
import { v4 } from 'uuid'
import { decode as HTMLDecode } from 'he'
import truncate from 'truncate'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import { middleTruncate } from '@/utils/directories'
import {
  CaretRight,
  FileText,
  Info,
  ArrowSquareOut,
  GithubLogo,
  X,
  YoutubeLogo,
  LinkSimple,
  GitlabLogo,
} from '@phosphor-icons/vue'
import ConfluenceLogo from '@/media/dataConnectors/confluence.png'
import DrupalWikiLogo from '@/media/dataConnectors/drupalwiki.png'
import ObsidianLogo from '@/media/dataConnectors/obsidian.png'
import PaperlessNgxLogo from '@/media/dataConnectors/paperlessngx.png'
import { toPercentString } from '@/utils/numbers'
import { useI18n } from 'vue-i18n'
import pluralize from 'pluralize'
import useTextSize from '@/hooks/useTextSize'

const props = defineProps({
  sources: {
    type: Array,
    default: () => []
  }
})

const { t } = useI18n()
const { textSizeClass } = useTextSize()

const open = ref(false)
const selectedSource = ref(null)

function combineLikeSources(sources) {
  const combined = {}
  sources.forEach((source) => {
    const { id, title, text, chunkSource = '', score = null } = source
    if (combined.hasOwnProperty(title)) {
      combined[title].chunks.push({ id, text, chunkSource, score })
      combined[title].references += 1
    } else {
      combined[title] = {
        title,
        chunks: [{ id, text, chunkSource, score }],
        references: 1,
      }
    }
  })
  return Object.values(combined)
}

function omitChunkHeader(text) {
  if (!text.includes('<document_metadata>')) return text
  return text.split('</document_metadata>')[1].trim()
}

const supportedSources = [
  'link://',
  'confluence://',
  'github://',
  'gitlab://',
  'drupalwiki://',
  'youtube://',
  'obsidian://',
  'paperless-ngx://',
]

/**
 * Parses the chunk source to get the correct title and/or display text for citations
 * which contain valid outbound links that can be clicked by the
 * user when viewing a citation. Optionally allows various icons
 * to show distinct types of sources.
 * @param {{title: string, chunks: {text: string, chunkSource: string}[]}} options
 * @returns {{isUrl: boolean, text: string, href: string, icon: string}}
 */
function parseChunkSource({ title = '', chunks = [] }) {
  const nullResponse = {
    isUrl: false,
    text: null,
    href: null,
    icon: 'file',
  }

  if (
    !chunks.length ||
    !supportedSources.some((source) =>
      chunks[0].chunkSource?.startsWith(source)
    )
  )
    return nullResponse

  try {
    const sourceID = supportedSources.find((source) =>
      chunks[0].chunkSource?.startsWith(source)
    )
    let url, text, icon

    // Try to parse the URL from the chunk source
    // If it fails, we'll use the title as the text and the link icon
    // but the document will not be linkable
    try {
      url = new URL(chunks[0].chunkSource.split(sourceID)[1])
    } catch {}

    switch (sourceID) {
      case 'link://':
        text = url.host + url.pathname
        icon = 'link'
        break

      case 'youtube://':
        text = title
        icon = 'youtube'
        break

      case 'github://':
        text = title
        icon = 'github'
        break

      case 'gitlab://':
        text = title
        icon = 'gitlab'
        break

      case 'confluence://':
        text = title
        icon = 'confluence'
        break

      case 'drupalwiki://':
        text = title
        icon = 'drupalwiki'
        break

      case 'obsidian://':
        text = title
        icon = 'obsidian'
        break

      case 'paperless-ngx://':
        text = title
        icon = 'paperlessNgx'
        break

      default:
        text = url.host + url.pathname
        icon = 'link'
        break
    }

    return {
      isUrl: !!url,
      href: url?.toString() ?? '#',
      text,
      icon,
    }
  } catch (err) {
    console.warn(`Unsupported source identifier ${chunks[0].chunkSource}`, err)
  }
  return nullResponse
}

const ConfluenceIcon = ({ size = 16 }) => ({
  template: `<img :src="src" :width="size" :height="size" />`,
  props: ['size'],
  data() {
    return { src: ConfluenceLogo }
  }
})

const DrupalWikiIcon = ({ size = 16 }) => ({
  template: `<img :src="src" :width="size" :height="size" />`,
  props: ['size'],
  data() {
    return { src: DrupalWikiLogo }
  }
})

const ObsidianIcon = ({ size = 16 }) => ({
  template: `<img :src="src" :width="size" :height="size" />`,
  props: ['size'],
  data() {
    return { src: ObsidianLogo }
  }
})

const PaperlessNgxIcon = ({ size = 16 }) => ({
  template: `<img :src="src" :width="size" :height="size" class="rounded-sm bg-white" />`,
  props: ['size'],
  data() {
    return { src: PaperlessNgxLogo }
  }
})

const ICONS = {
  file: FileText,
  link: LinkSimple,
  youtube: YoutubeLogo,
  github: GithubLogo,
  gitlab: GitlabLogo,
  confluence: () => ({ template: `<img :src="src" :width="16" :height="16" />`, data() { return { src: ConfluenceLogo } } }),
  drupalwiki: () => ({ template: `<img :src="src" :width="16" :height="16" />`, data() { return { src: DrupalWikiLogo } } }),
  obsidian: () => ({ template: `<img :src="src" :width="16" :height="16" />`, data() { return { src: ObsidianLogo } } }),
  paperlessNgx: () => ({ template: `<img :src="src" :width="16" :height="16" class="rounded-sm bg-white" />`, data() { return { src: PaperlessNgxLogo } } }),
}

function getCitationIcon(source) {
  const chunkSourceInfo = parseChunkSource(source)
  return ICONS.hasOwnProperty(chunkSourceInfo?.icon)
    ? ICONS[chunkSourceInfo.icon]
    : ICONS.file
}

function getCitationText(source) {
  const chunkSourceInfo = parseChunkSource(source)
  return chunkSourceInfo?.text ?? middleTruncate(source.title, 25)
}
</script>

<template>
  <div v-if="sources.length > 0" class="flex flex-col mt-4 justify-left">
    <button
      @click="open = !open"
      :class="`border-none font-semibold text-white/50 light:text-black/50 font-medium italic ${textSizeClass} text-left ml-14 pt-2 ${
        open ? 'pb-2' : ''
      } hover:text-white/75 hover:light:text-black/75 transition-all duration-300`"
    >
      {{ open ? t('chat_window.hide_citations') : t('chat_window.show_citations') }}
      <CaretRight
        weight="bold"
        :size="14"
        :class="`inline-block ml-1 transform transition-transform duration-300 ${
          open ? 'rotate-90' : ''
        }`"
      />
    </button>
    <div v-if="open" class="flex flex-wrap flex-col items-start overflow-x-scroll no-scroll mt-1 ml-14 gap-y-2">
      <button
        v-for="source in combineLikeSources(sources)"
        :key="v4()"
        :class="`flex doc__source gap-x-1 ${textSizeClass}`"
        @click="selectedSource = source"
        type="button"
      >
        <div class="flex items-start flex-1 pt-[4px]">
          <component :is="getCitationIcon(source)" :size="16" />
        </div>
        <div class="flex flex-col items-start gap-y-[0.2px] px-1">
          <p
            :class="`!m-0 font-semibold whitespace-nowrap text-theme-text-primary hover:opacity-55 ${textSizeClass}`"
          >
            {{ getCitationText(source) }}
          </p>
          <p
            :class="`!m-0 text-[10px] font-medium text-theme-text-secondary ${textSizeClass}`"
          >
            {{ source.references || 1 }} {{ pluralize('Reference', Number(source.references) || 1) }}
          </p>
        </div>
      </button>
    </div>

    <ModalWrapper v-if="selectedSource" :is-open="!!selectedSource">
      <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
        <div class="relative p-6 border-b rounded-t border-theme-modal-border">
          <div class="w-full flex gap-x-2 items-center">
            <template v-if="parseChunkSource(selectedSource).isUrl">
              <a
                :href="parseChunkSource(selectedSource).href"
                target="_blank"
                rel="noreferrer"
                class="text-xl w-[90%] font-semibold text-white whitespace-nowrap hover:underline hover:text-blue-300 flex items-center gap-x-1"
              >
                <div class="flex items-center gap-x-1 max-w-full overflow-hidden">
                  <h3 class="truncate text-ellipsis whitespace-nowrap overflow-hidden w-full">
                    {{ parseChunkSource(selectedSource).text }}
                  </h3>
                  <ArrowSquareOut class="flex-shrink-0" />
                </div>
              </a>
            </template>
            <h3 v-else class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
              {{ truncate(selectedSource.title, 45) }}
            </h3>
          </div>
          <p v-if="selectedSource.references > 1" class="text-xs text-gray-400 mt-2">
            Referenced {{ selectedSource.references }} times.
          </p>
          <button
            @click="selectedSource = null"
            type="button"
            class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
          >
            <X :size="24" weight="bold" class="text-white" />
          </button>
        </div>
        <div
          class="h-full w-full overflow-y-auto"
          style="max-height: calc(100vh - 200px)"
        >
          <div class="py-7 px-9 space-y-2 flex-col">
            <template v-for="({ text, score }, idx) in selectedSource.chunks" :key="idx">
              <div class="pt-6 text-white">
                <div class="flex flex-col w-full justify-start pb-6 gap-y-1">
                  <p class="text-white whitespace-pre-line">
                    {{ HTMLDecode(omitChunkHeader(text)) }}
                  </p>

                  <div
                    v-if="!!score"
                    class="w-full flex items-center text-xs text-white/60 gap-x-2 cursor-default"
                  >
                    <div
                      data-tooltip-id="similarity-score"
                      data-tooltip-content="This is the semantic similarity score of this chunk of text compared to your query calculated by the vector database."
                      class="flex items-center gap-x-1"
                    >
                      <Info :size="14" />
                      <p>{{ toPercentString(score) }} match</p>
                    </div>
                  </div>
                </div>
              </div>
              <hr v-if="idx !== selectedSource.chunks.length - 1" class="border-theme-modal-border" />
            </template>
            <div class="mb-6"></div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PhArrowSquareOut } from '@phosphor-icons/vue'

const NEWS_CACHE_CONFIG = {
  articles: 'https://cdn.anythingllm.com/support/announcements/list.txt',
  announcementsDir: 'https://cdn.anythingllm.com/support/announcements',
  cacheKey: 'anythingllm_announcements',
  ttl: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
}

const articles = ref([])
const loading = ref(true)

function isExternalLink(url) {
  try {
    const link = new URL(url)
    return link.hostname !== window.location.hostname
  } catch {
    return false
  }
}

async function fetchArticles() {
  try {
    const response = await fetch(NEWS_CACHE_CONFIG.articles)
    if (!response.ok) throw new Error('Failed to fetch articles')

    const text = await response.text()
    const articleIds = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const articlePromises = articleIds.map(async (id) => {
      const articleUrl = `${NEWS_CACHE_CONFIG.announcementsDir}/${id}.json`
      const response = await fetch(articleUrl)
      if (!response.ok) return null

      const article = await response.json()
      return {
        id,
        ...article,
        imageUrl: article.image
          ? `${NEWS_CACHE_CONFIG.announcementsDir}/${article.image}`
          : null,
      }
    })

    const fetchedArticles = await Promise.all(articlePromises)
    return fetchedArticles.filter((article) => article !== null)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

function getCachedArticles() {
  try {
    const cached = localStorage.getItem(NEWS_CACHE_CONFIG.cacheKey)
    if (!cached) return null

    const { articles: cachedArticles, timestamp } = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid
    if (now - timestamp < NEWS_CACHE_CONFIG.ttl) {
      return cachedArticles
    }

    // Cache expired
    localStorage.removeItem(NEWS_CACHE_CONFIG.cacheKey)
    return null
  } catch (error) {
    console.error('Error reading cache:', error)
    localStorage.removeItem(NEWS_CACHE_CONFIG.cacheKey)
    return null
  }
}

function setCachedArticles(articles) {
  try {
    const cacheData = {
      articles,
      timestamp: Date.now(),
    }
    localStorage.setItem(NEWS_CACHE_CONFIG.cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}

onMounted(async () => {
  // Try to get cached articles first
  const cachedArticles = getCachedArticles()

  if (cachedArticles) {
    articles.value = cachedArticles
    loading.value = false
    return
  }

  // Fetch fresh articles if cache is empty or expired
  const fetchedArticles = await fetchArticles()
  articles.value = fetchedArticles

  // Cache the fetched articles
  if (fetchedArticles.length > 0) {
    setCachedArticles(fetchedArticles)
  }

  loading.value = false
})
</script>

<template>
  <div class="flex flex-col gap-y-4">
    <h2 class="text-lg font-semibold text-theme-text-primary">
      Latest Updates
    </h2>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="w-6 h-6 border-2 border-theme-action-primary border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else-if="articles.length === 0" class="text-center py-8">
      <p class="text-sm text-theme-text-secondary">
        No updates available at this time.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <a
        v-for="article in articles"
        :key="article.id"
        :href="article.link"
        :target="isExternalLink(article.link) ? '_blank' : '_self'"
        :rel="isExternalLink(article.link) ? 'noopener noreferrer' : undefined"
        class="group flex flex-col gap-y-3 rounded-lg border border-theme-modal-border hover:border-theme-action-primary/50 hover:bg-theme-bg-secondary/50 transition-all overflow-hidden"
      >
        <div
          v-if="article.imageUrl"
          class="w-full h-40 bg-theme-bg-secondary overflow-hidden"
        >
          <img
            :src="article.imageUrl"
            :alt="article.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div class="flex flex-col gap-y-2 p-4" :class="{ 'pt-0': article.imageUrl }">
          <div class="flex items-start justify-between gap-x-2">
            <h3 class="text-sm font-medium text-theme-text-primary group-hover:text-theme-action-primary transition-colors flex-1">
              {{ article.title }}
            </h3>
            <ArrowSquareOut
              v-if="isExternalLink(article.link)"
              class="w-4 h-4 text-theme-text-secondary group-hover:text-theme-action-primary transition-colors flex-shrink-0 mt-0.5"
              weight="duotone"
            />
          </div>
          <p class="text-xs text-theme-text-secondary line-clamp-2">
            {{ article.description }}
          </p>
          <div class="flex items-center gap-x-2 text-xs text-theme-text-secondary mt-1">
            <time v-if="article.date" :datetime="article.date">
              {{ new Date(article.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) }}
            </time>
            <span v-if="article.author" class="flex items-center gap-x-1">
              <span>&bull;</span>
              <span>{{ article.author }}</span>
            </span>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

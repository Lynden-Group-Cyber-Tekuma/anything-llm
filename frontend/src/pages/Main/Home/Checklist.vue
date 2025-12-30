<script setup>
import { ref, onMounted, computed } from 'vue'
import { PhCheckCircle, PhCircle } from '@phosphor-icons/vue'
import System from '@/models/system'

const systemSettings = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    systemSettings.value = await System.keys()
  } finally {
    loading.value = false
  }
})

const checklistItems = computed(() => {
  if (!systemSettings.value) return []

  return [
    {
      title: 'Configure LLM Provider',
      completed: !!systemSettings.value.LLMProvider,
      link: '/settings/llm-preference'
    },
    {
      title: 'Configure Embedding Provider',
      completed: !!systemSettings.value.EmbeddingEngine,
      link: '/settings/embedding-preference'
    },
    {
      title: 'Configure Vector Database',
      completed: !!systemSettings.value.VectorDB,
      link: '/settings/vector-database'
    }
  ]
})

const completedCount = computed(() =>
  checklistItems.value.filter(item => item.completed).length
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-theme-text-primary text-lg font-semibold">Setup Checklist</h2>
      <span class="text-theme-text-secondary text-sm">
        {{ completedCount }}/{{ checklistItems.length }} completed
      </span>
    </div>
    <div v-if="loading" class="text-theme-text-secondary">Loading...</div>
    <div v-else class="space-y-2">
      <router-link
        v-for="item in checklistItems"
        :key="item.title"
        :to="item.link"
        class="flex items-center gap-3 p-3 rounded-lg bg-theme-bg-secondary hover:bg-theme-sidebar-item-hover transition-colors"
      >
        <PhCheckCircle v-if="item.completed" class="w-5 h-5 text-green-500" />
        <PhCircle v-else class="w-5 h-5 text-theme-text-secondary" />
        <span :class="item.completed ? 'text-theme-text-secondary line-through' : 'text-theme-text-primary'">
          {{ item.title }}
        </span>
      </router-link>
    </div>
  </div>
</template>

<template>
  <div class="p-2">
    <div class="flex flex-col gap-y-[18px] max-w-[500px]">
      <div class="flex items-center gap-x-2">
        <Database
          :size="24"
          color="var(--theme-text-primary)"
          weight="bold"
        />
        <label
          for="name"
          class="text-theme-text-primary text-md font-bold"
        >
          SQL Agent
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
        :src="SQLAgentImage"
        alt="SQL Agent"
        class="w-full rounded-md"
      />
      <p class="text-theme-text-secondary text-opacity-60 text-xs font-medium py-1.5">
        Enable your agent to be able to leverage SQL to answer you questions
        by connecting to various SQL database providers.
      </p>
      <template v-if="enabled">
        <input
          name="system::agent_sql_connections"
          type="hidden"
          :value="JSON.stringify(connections)"
        />
        <input
          type="hidden"
          :value="JSON.stringify(
            connections.filter((conn) => conn.action !== 'remove')
          )"
        />
        <div class="flex flex-col mt-2 gap-y-2">
          <p class="text-theme-text-primary font-semibold text-sm">
            Your database connections
          </p>
          <div class="flex flex-col gap-y-3">
            <DBConnection
              v-for="connection in connections.filter((connection) => connection.action !== 'remove')"
              :key="connection.database_id"
              :connection="connection"
              :on-remove="handleRemoveConnection"
            />
            <button
              type="button"
              @click="openModal"
              class="w-fit relative flex h-[40px] items-center border-none hover:bg-theme-bg-secondary rounded-lg"
            >
              <div class="flex w-full gap-x-2 items-center p-4">
                <div class="bg-theme-bg-secondary p-2 rounded-lg h-[24px] w-[24px] flex items-center justify-center">
                  <Plus
                    weight="bold"
                    :size="14"
                    class="shrink-0 text-theme-text-primary"
                  />
                </div>
                <p class="text-left text-theme-text-primary text-sm">
                  New SQL connection
                </p>
              </div>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
  <NewSQLConnection
    :is-open="isOpen"
    :close-modal="closeModal"
    :set-has-changes="setHasChanges"
    :on-submit="(newDb) =>
      setConnections((prev) => [...prev, { action: 'add', ...newDb }])
    "
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DBConnection from './DBConnection.vue'
import { Plus, Database } from '@phosphor-icons/vue'
import NewSQLConnection from './NewConnectionModal.vue'
import SQLAgentImage from '@/media/agents/sql-agent.png'
import Admin from '@/models/admin'

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

const isOpen = ref(false)
const connections = ref([])

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const setConnections = (updater) => {
  connections.value = typeof updater === 'function' ? updater(connections.value) : updater
}

onMounted(() => {
  Admin.systemPreferencesByFields(['agent_sql_connections'])
    .then((res) => setConnections(res?.settings?.agent_sql_connections ?? []))
    .catch(() => setConnections([]))
})

function handleRemoveConnection(databaseId) {
  props.setHasChanges(true)
  setConnections((prev) =>
    prev.map((conn) => {
      if (conn.database_id === databaseId)
        return { ...conn, action: 'remove' }
      return conn
    })
  )
}
</script>

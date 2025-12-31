<template>
  <Teleport to="#workspace-agent-settings-container">
    <ModalWrapper :is-open="isOpen">
      <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div class="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
          <div class="relative p-6 border-b rounded-t border-theme-modal-border">
            <div class="w-full flex gap-x-2 items-center">
              <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
                New SQL Connection
              </h3>
            </div>
            <button
              @click="handleClose"
              type="button"
              class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
            >
              <X :size="24" weight="bold" class="text-white" />
            </button>
          </div>
          <form
            id="sql-connection-form"
            @change="onFormChange"
            @submit="handleUpdate"
          >
            <div class="px-7 py-6">
              <div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                <p class="text-sm text-white/60">
                  Add the connection information for your database below and it
                  will be available for future SQL agent calls.
                </p>
                <div class="flex flex-col w-full">
                  <div class="border border-red-800 bg-zinc-800 light:bg-red-200/50 p-4 rounded-lg flex items-center gap-x-2 text-sm text-red-400 light:text-red-500">
                    <WarningOctagon :size="28" class="shrink-0" />
                    <p>
                      <b>WARNING:</b> The SQL agent has been <i>instructed</i>
                      to only perform non-modifying queries. This
                      <b>does not</b> prevent a hallucination from still
                      deleting data. Only connect with a user who has
                      <b>READ_ONLY</b> permissions.
                    </p>
                  </div>

                  <label class="block mb-2 text-sm font-medium text-white mt-4">
                    Select your SQL engine
                  </label>
                  <div class="grid md:grid-cols-4 gap-4 grid-cols-2">
                    <DBEngine
                      provider="postgresql"
                      :active="engine === 'postgresql'"
                      @click="engine = 'postgresql'"
                    />
                    <DBEngine
                      provider="mysql"
                      :active="engine === 'mysql'"
                      @click="engine = 'mysql'"
                    />
                    <DBEngine
                      provider="sql-server"
                      :active="engine === 'sql-server'"
                      @click="engine = 'sql-server'"
                    />
                  </div>
                </div>

                <div class="flex flex-col w-full">
                  <label class="block mb-2 text-sm font-medium text-white">
                    Connection name
                  </label>
                  <input
                    type="text"
                    name="name"
                    class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                    placeholder="a unique name to identify this SQL connection"
                    required
                    autocomplete="off"
                    spellcheck="false"
                  />
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="flex flex-col">
                    <label class="block mb-2 text-sm font-medium text-white">
                      Database user
                    </label>
                    <input
                      type="text"
                      name="username"
                      class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                      placeholder="root"
                      required
                      autocomplete="off"
                      spellcheck="false"
                    />
                  </div>
                  <div class="flex flex-col">
                    <label class="block mb-2 text-sm font-medium text-white">
                      Database user password
                    </label>
                    <input
                      type="text"
                      name="password"
                      class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                      placeholder="password123"
                      required
                      autocomplete="off"
                      spellcheck="false"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div class="sm:col-span-2">
                    <label class="block mb-2 text-sm font-medium text-white">
                      Server endpoint
                    </label>
                    <input
                      type="text"
                      name="host"
                      class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                      placeholder="the hostname or endpoint for your database"
                      required
                      autocomplete="off"
                      spellcheck="false"
                    />
                  </div>
                  <div>
                    <label class="block mb-2 text-sm font-medium text-white">
                      Port
                    </label>
                    <input
                      type="text"
                      name="port"
                      class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                      placeholder="3306"
                      autocomplete="off"
                      spellcheck="false"
                    />
                  </div>
                </div>

                <div class="flex flex-col">
                  <label class="block mb-2 text-sm font-medium text-white">
                    Database
                  </label>
                  <input
                    type="text"
                    name="database"
                    class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                    placeholder="the database the agent will interact with"
                    required
                    autocomplete="off"
                    spellcheck="false"
                  />
                </div>

                <div v-if="engine === 'postgresql'" class="flex flex-col">
                  <label class="block mb-2 text-sm font-medium text-white">
                    Schema (optional)
                  </label>
                  <input
                    type="text"
                    name="schema"
                    class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                    placeholder="public (default schema if not specified)"
                    autocomplete="off"
                    spellcheck="false"
                  />
                </div>

                <div v-if="engine === 'sql-server'" class="flex items-center justify-between">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="encrypt"
                      value="true"
                      class="sr-only peer"
                      :checked="config.encrypt"
                    />
                    <div class="w-11 h-6 bg-theme-settings-input-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span class="ml-3 text-sm font-medium text-white">
                      Enable Encryption
                    </span>
                  </label>
                </div>

                <p class="text-theme-text-secondary text-sm">
                  {{ assembleConnectionString({ engine, ...config }) }}
                </p>
              </div>
            </div>
            <div class="flex justify-between items-center mt-6 pt-6 border-t border-theme-modal-border px-7 pb-6">
              <button
                type="button"
                @click="handleClose"
                class="transition-all duration-300 text-white hover:bg-zinc-700 light:hover:bg-theme-bg-primary px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="sql-connection-form"
                :disabled="isValidating"
                class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {{ isValidating ? 'Validating...' : 'Save connection' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalWrapper>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import ModalWrapper from '@/components/ModalWrapper/index.vue'
import { WarningOctagon, X } from '@phosphor-icons/vue'
import DBEngine from './DBEngine.vue'
import System from '@/models/system'
import showToast from '@/utils/toast'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  closeModal: {
    type: Function,
    required: true
  },
  onSubmit: {
    type: Function,
    required: true
  },
  setHasChanges: {
    type: Function,
    required: true
  }
})

const DEFAULT_ENGINE = 'postgresql'
const DEFAULT_CONFIG = {
  username: null,
  password: null,
  host: null,
  port: null,
  database: null,
  schema: null,
  encrypt: false
}

const engine = ref(DEFAULT_ENGINE)
const config = ref({ ...DEFAULT_CONFIG })
const isValidating = ref(false)

function assembleConnectionString({
  engine,
  username = '',
  password = '',
  host = '',
  port = '',
  database = '',
  encrypt = false
}) {
  if ([username, password, host, database].every((i) => !!i) === false)
    return 'Please fill out all the fields above.'
  switch (engine) {
    case 'postgresql':
      return `postgres://${username}:${password}@${host}:${port}/${database}`
    case 'mysql':
      return `mysql://${username}:${password}@${host}:${port}/${database}`
    case 'sql-server':
      return `mssql://${username}:${password}@${host}:${port}/${database}?encrypt=${encrypt}`
    default:
      return null
  }
}

function handleClose() {
  engine.value = DEFAULT_ENGINE
  config.value = { ...DEFAULT_CONFIG }
  props.closeModal()
}

function onFormChange(e) {
  const form = new FormData(e.target.form)
  config.value = {
    username: form.get('username').trim(),
    password: form.get('password'),
    host: form.get('host').trim(),
    port: form.get('port').trim(),
    database: form.get('database').trim(),
    encrypt: form.get('encrypt') === 'true'
  }
}

async function handleUpdate(e) {
  e.preventDefault()
  e.stopPropagation()
  const form = new FormData(e.target)
  const connectionString = assembleConnectionString({ engine: engine.value, ...config.value })

  isValidating.value = true
  try {
    const { success, error } = await System.validateSQLConnection(
      engine.value,
      connectionString
    )
    if (!success) {
      showToast(
        error ||
          'Failed to establish database connection. Please check your connection details.',
        'error',
        { clear: true }
      )
      isValidating.value = false
      return
    }

    props.onSubmit({
      engine: engine.value,
      database_id: form.get('name'),
      connectionString
    })
    props.setHasChanges(true)
    handleClose()
  } catch (error) {
    console.error('Error validating connection:', error)
    showToast(
      error?.message ||
        'Failed to validate connection. Please check your connection details.',
      'error',
      { clear: true }
    )
  } finally {
    isValidating.value = false
  }
  return false
}
</script>

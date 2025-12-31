<template>
  <div class="flex gap-x-4 items-center">
    <img
      :src="DB_LOGOS?.[engine] ?? null"
      :alt="`${engine} logo`"
      class="w-10 h-10 rounded-md"
    />
    <div class="flex w-full items-center justify-between">
      <div class="flex flex-col">
        <div class="text-sm font-semibold text-white">{{ database_id }}</div>
        <div class="mt-1 text-xs text-description">{{ engine }}</div>
      </div>
      <button
        type="button"
        @click="removeConfirmation"
        class="border-none text-white hover:text-red-500"
      >
        <X :size="24" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { X } from '@phosphor-icons/vue'
import PostgreSQLLogo from './icons/postgresql.png'
import MySQLLogo from './icons/mysql.png'
import MSSQLLogo from './icons/mssql.png'

const DB_LOGOS = {
  postgresql: PostgreSQLLogo,
  mysql: MySQLLogo,
  'sql-server': MSSQLLogo
}

const props = defineProps({
  connection: {
    type: Object,
    required: true
  },
  onRemove: {
    type: Function,
    required: true
  }
})

const { database_id, engine } = props.connection

function removeConfirmation() {
  if (
    !window.confirm(
      `Delete ${database_id} from the list of available SQL connections? This cannot be undone.`
    )
  )
    return false
  props.onRemove(database_id)
}
</script>

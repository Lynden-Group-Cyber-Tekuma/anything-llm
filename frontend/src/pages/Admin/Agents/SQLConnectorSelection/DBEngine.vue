<template>
  <button
    type="button"
    @click="$emit('click')"
    :class="[
      'flex flex-col p-4 border border-white/40 bg-zinc-800 light:bg-theme-settings-input-bg rounded-lg w-fit hover:bg-zinc-700',
      active ? '!bg-blue-500/50' : ''
    ]"
  >
    <img
      :src="DB_LOGOS[provider]"
      class="h-[100px] rounded-md"
      :alt="provider"
    />
  </button>
</template>

<script setup>
import PostgreSQLLogo from './icons/postgresql.png'
import MySQLLogo from './icons/mysql.png'
import MSSQLLogo from './icons/mssql.png'

const DB_LOGOS = {
  postgresql: PostgreSQLLogo,
  mysql: MySQLLogo,
  'sql-server': MSSQLLogo
}

defineProps({
  provider: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

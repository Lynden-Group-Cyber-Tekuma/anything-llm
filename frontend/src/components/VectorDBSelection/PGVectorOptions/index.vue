<script setup>
import { Info } from '@phosphor-icons/vue'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const connectionStringTooltip = `This is the connection string for the Postgres database in the format of
postgresql://username:password@host:port/database

The user for the database must have the following permissions:
• Read access to the database
• Read access to the database schema
• Create access to the database

You must have the pgvector extension installed on the database.`

const tableNameTooltip = `This is the name of the table in the Postgres database that will store the vectors.

By default, the table name is anythingllm_vectors.

This table must not already exist on the database - it will be created automatically.`
</script>

<template>
  <div class="w-full flex flex-col gap-y-7">
    <div class="w-full flex items-center gap-[36px] mt-1.5">
      <div class="flex flex-col w-96">
        <div class="flex items-center gap-x-1 mb-3">
          <label class="text-white text-sm font-semibold block">
            Postgres Connection String
          </label>
          <Info
            :size="16"
            class="text-theme-text-secondary cursor-pointer"
            :title="connectionStringTooltip"
          />
        </div>
        <input
          type="text"
          name="PGVectorConnectionString"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="postgresql://username:password@host:port/database"
          :value="settings?.PGVectorConnectionString ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="flex flex-col w-60">
        <div class="flex items-center gap-x-1 mb-3">
          <label class="text-white text-sm font-semibold block">
            Vector Table Name
          </label>
          <Info
            :size="16"
            class="text-theme-text-secondary cursor-pointer"
            :title="tableNameTooltip"
          />
        </div>
        <input
          type="text"
          name="PGVectorTableName"
          autocomplete="off"
          :value="settings?.PGVectorTableName"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="vector_table"
        />
      </div>
    </div>
  </div>
</template>

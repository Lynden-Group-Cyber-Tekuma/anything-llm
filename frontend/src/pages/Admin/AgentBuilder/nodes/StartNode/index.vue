<template>
  <div class="space-y-4">
    <h3 class="text-sm font-medium text-theme-text-primary">Variables</h3>
    <div
      v-for="(variable, index) in config.variables"
      :key="index"
      class="flex gap-2"
    >
      <input
        type="text"
        placeholder="Variable name"
        :value="variable.name"
        @input="(e) => {
          const newVars = [...config.variables]
          newVars[index].name = e.target.value
          onConfigChange({ variables: newVars })
        }"
        class="flex-1 border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
        autocomplete="off"
        spellcheck="false"
      />
      <input
        type="text"
        placeholder="Initial value"
        :value="variable.value"
        @input="(e) => {
          const newVars = [...config.variables]
          newVars[index].value = e.target.value
          onConfigChange({ variables: newVars })
        }"
        class="flex-1 border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
        autocomplete="off"
        spellcheck="false"
      />
      <button
        v-if="config.variables.length > 1"
        @click="handleDeleteVariable(index, variable.name)"
        class="p-2.5 rounded-lg border-none bg-theme-settings-input-bg text-theme-text-primary hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/10 transition-colors duration-300"
        title="Delete variable"
        type="button"
      >
        <X class="w-4 h-4" />
      </button>
      <button
        v-if="index === config.variables.length - 1"
        @click="() => {
          const newVars = [...config.variables, { name: '', value: '' }]
          onConfigChange({ variables: newVars })
        }"
        class="p-2.5 rounded-lg border-none bg-theme-settings-input-bg text-theme-text-primary hover:bg-theme-action-menu-item-hover transition-colors duration-300"
        title="Add variable"
        type="button"
      >
        <Plus class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Plus, X } from '@phosphor-icons/vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  onConfigChange: {
    type: Function,
    required: true
  },
  onDeleteVariable: {
    type: Function,
    required: true
  }
})

const handleDeleteVariable = (index, variableName) => {
  // First clean up references, then delete the variable
  props.onDeleteVariable(variableName)
  const newVars = props.config.variables.filter((_, i) => i !== index)
  props.onConfigChange({ variables: newVars })
}
</script>

<template>
  <select
    :value="value || ''"
    @change="(e) => onChange(e.target.value)"
    class="w-full border-none bg-theme-settings-input-bg text-theme-text-primary text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
  >
    <option value="" class="bg-theme-bg-primary">
      {{ placeholder }}
    </option>
    <option
      v-for="v in availableVariables"
      :key="v.name"
      :value="v.name"
      class="bg-theme-bg-primary"
    >
      {{ v.name }}
    </option>
  </select>
</template>

<script setup>
defineProps({
  value: {
    type: String,
    default: ''
  },
  onChange: {
    type: Function,
    required: true
  },
  availableVariables: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select variable'
  }
})
</script>

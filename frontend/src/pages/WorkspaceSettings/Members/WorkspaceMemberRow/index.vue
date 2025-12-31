<template>
  <tr class="bg-transparent text-theme-text-primary text-sm font-medium">
    <th scope="row" class="px-6 py-4 whitespace-nowrap">
      {{ user.username }}
    </th>
    <td class="px-6 py-4">{{ titleCase(user.role) }}</td>
    <td class="px-6 py-4">{{ user.lastUpdatedAt }}</td>
  </tr>
</template>

<script setup>
import { titleCase } from 'text-case';

defineProps({
  user: {
    type: Object,
    required: true,
  },
});
</script>

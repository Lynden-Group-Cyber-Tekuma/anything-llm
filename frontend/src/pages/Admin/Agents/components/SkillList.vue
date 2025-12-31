<template>
  <div v-if="Object.keys(skills).length > 0">
    <div
      :class="[
        'bg-theme-bg-secondary text-white rounded-xl',
        isMobile ? 'w-full' : 'min-w-[360px] w-fit'
      ]"
    >
      <div
        v-for="([skill, skillSettings], index) in Object.entries(skills)"
        :key="skill"
        :class="[
          'py-3 px-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-theme-bg-primary',
          index === 0 ? 'rounded-t-xl' : '',
          index === Object.keys(skills).length - 1
            ? 'rounded-b-xl'
            : 'border-b border-white/10',
          selectedSkill === skill ? 'bg-white/10 light:bg-theme-bg-sidebar' : ''
        ]"
        @click="() => handleClick?.(skill)"
      >
        <div class="text-sm font-light">{{ skillSettings.title }}</div>
        <div class="flex items-center gap-x-2">
          <DefaultBadge v-if="isDefault" :title="skill" />
          <div v-else class="text-sm text-theme-text-secondary font-medium">
            {{ activeSkills.includes(skill) ? 'On' : 'Off' }}
          </div>
          <CaretRight
            :size="14"
            weight="bold"
            class="text-theme-text-secondary"
          />
        </div>
      </div>
    </div>
    <!-- Tooltip for default skills - only render when skill list is passed isDefault -->
    <Tooltip
      v-if="isDefault"
      id="default-skill"
      place="bottom"
      :delay-show="300"
      class="tooltip light:invert-0 !text-xs"
    />
  </div>
</template>

<script setup>
import { isMobile } from 'react-device-detect'
import { CaretRight } from '@phosphor-icons/vue'
import DefaultBadge from '../Badges/default.vue'
import { Tooltip } from 'react-tooltip'

defineProps({
  isDefault: {
    type: Boolean,
    default: false
  },
  skills: {
    type: Object,
    default: () => ({})
  },
  selectedSkill: {
    type: [String, Object],
    default: null
  },
  handleClick: {
    type: Function,
    default: null
  },
  activeSkills: {
    type: Array,
    default: () => []
  }
})
</script>

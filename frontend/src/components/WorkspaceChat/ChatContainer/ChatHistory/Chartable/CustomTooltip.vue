<script setup>
import { Tooltip as RechartsTooltip } from 'recharts'
import { h } from 'vue'

const props = defineProps({
  legendColor: String
})

// Given a hex, convert to the opposite highest-contrast color
// and if `bw` is enabled, force it to be black/white to normalize
// interface.
function invertColor(hex, bw) {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1)
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.')
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16)
  if (bw) {
    // https://stackoverflow.com/a/3943023/112731
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#FFFFFF' : '#000000'
  }
  // invert color components
  r = (255 - r).toString(16)
  g = (255 - g).toString(16)
  b = (255 - b).toString(16)
  // pad each with zeros and return
  return '#' + padZero(r) + padZero(g) + padZero(b)
}

function padZero(str, len) {
  len = len || 2
  var zeros = new Array(len).join('0')
  return (zeros + str).slice(-len)
}
</script>

<template>
  <RechartsTooltip
    wrapper-style="outline: none"
    :is-animation-active="false"
    :cursor="{ fill: '#d1d5db', opacity: '0.15' }"
    :position="{ y: 0 }"
    v-bind="$attrs"
  >
    <template #content="{ active, payload, label }">
      <div v-if="active && payload" class="bg-theme-bg-primary text-sm rounded-md border shadow-lg">
        <div class="border-b py-2 px-4">
          <p class="text-theme-bg-primary font-medium">{{ label }}</p>
        </div>
        <div class="space-y-1 py-2 px-4">
          <div
            v-for="(item, idx) in payload"
            :key="`id-${idx}`"
            class="flex items-center justify-between space-x-8"
          >
            <div class="flex items-center space-x-2">
              <span
                class="shrink-0 h-3 w-3 border-theme-bg-primary rounded-md rounded-full border-2 shadow-md"
                :style="{ backgroundColor: legendColor }"
              />
              <p
                :style="{ color: invertColor(legendColor, true) }"
                class="font-medium tabular-nums text-right whitespace-nowrap"
              >
                {{ item.value }}
              </p>
            </div>
            <p
              :style="{ color: invertColor(legendColor, true) }"
              class="whitespace-nowrap font-normal"
            >
              {{ item.name }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </RechartsTooltip>
</template>

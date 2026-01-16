<script setup>
const props = defineProps({
  root: Object,
  depth: Number,
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  index: Number,
  payload: Object,
  colors: Array,
  rank: Number,
  name: String
})
</script>

<template>
  <g>
    <rect
      :x="x"
      :y="y"
      :width="width"
      :height="height"
      :style="{
        fill:
          depth < 2
            ? colors[Math.floor((index / root.children.length) * 6)]
            : '#ffffff00',
        stroke: '#fff',
        strokeWidth: 2 / (depth + 1e-10),
        strokeOpacity: 1 / (depth + 1e-10),
      }"
    />
    <text
      v-if="depth === 1"
      :x="x + width / 2"
      :y="y + height / 2 + 7"
      text-anchor="middle"
      fill="#fff"
      font-size="14"
    >
      {{ name }}
    </text>
    <text
      v-if="depth === 1"
      :x="x + 4"
      :y="y + 18"
      fill="#fff"
      font-size="16"
      fill-opacity="0.9"
    >
      {{ index + 1 }}
    </text>
  </g>
</template>

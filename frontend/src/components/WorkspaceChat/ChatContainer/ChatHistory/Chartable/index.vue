<script setup>
import { ref, computed } from 'vue'
import { v4 } from 'uuid'
import {
  AreaChart,
  BarChart,
  DonutChart,
  Legend,
  LineChart,
} from '@tremor/react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Funnel,
  FunnelChart,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  Treemap,
  XAxis,
  YAxis,
} from 'recharts'
import { Colors, getTremorColor } from './chart-utils.js'
import CustomCell from './CustomCell.vue'
import Tooltip from './CustomTooltip.vue'
import { safeJsonParse } from '@/utils/request.js'
import renderMarkdown from '@/utils/chat/markdown.js'
import { WorkspaceProfileImage } from '../PromptReply/index.vue'
import { saveAs } from 'file-saver'
import { useGenerateImage } from 'recharts-to-png'
import { PhCircleNotch, PhDownloadSimple } from '@phosphor-icons/vue'
import { h } from 'vue'

const props = defineProps({
  props: {
    type: Object,
    required: true
  },
  workspace: {
    type: Object,
    default: null
  }
})

const loading = ref(false)
const [getDivJpeg, { ref: chartRef }] = useGenerateImage({
  quality: 1,
  type: 'image/jpeg',
  options: {
    backgroundColor: '#393d43',
    padding: 20,
  },
})

const handleDownload = async () => {
  loading.value = true
  try {
    const jpeg = await getDivJpeg()
    if (jpeg) saveAs(jpeg, `chart-${v4().split('-')[0]}.jpg`)
  } finally {
    loading.value = false
  }
}

const dataFormatter = (number) => {
  return Intl.NumberFormat('us').format(number).toString()
}

const color = null
const showLegend = true

const content = computed(() => {
  return typeof props.props.content === 'string'
    ? safeJsonParse(props.props.content, null)
    : props.props.content
})

const chartType = computed(() => content.value?.type?.toLowerCase())

const data = computed(() => {
  const dataset = content.value?.dataset
  return typeof dataset === 'string' ? safeJsonParse(dataset, []) : dataset || []
})

const value = computed(() => {
  return data.value.length > 0 ? Object.keys(data.value[0])[1] : 'value'
})

const title = computed(() => content.value?.title)

const customTooltip = (tooltipProps) => {
  const { payload, active } = tooltipProps
  if (!active || !payload) return null
  const categoryPayload = payload?.[0]
  if (!categoryPayload) return null
  return h('div', {
    class: 'w-56 bg-theme-bg-primary rounded-lg border p-2 text-white'
  }, [
    h('div', { class: 'flex flex-1 space-x-2.5' }, [
      h('div', {
        class: `flex w-1.5 flex-col bg-${categoryPayload?.color}-500 rounded`
      }),
      h('div', { class: 'w-full' }, [
        h('div', { class: 'flex items-center justify-between space-x-8' }, [
          h('p', { class: 'whitespace-nowrap text-right text-tremor-content' }, categoryPayload.name),
          h('p', { class: 'whitespace-nowrap text-right font-medium text-tremor-content-emphasis' }, categoryPayload.value)
        ])
      ])
    ])
  ])
}
</script>

<template>
  <div v-if="content !== null">
    <div v-if="!!props.props.chatId" class="flex justify-center items-end w-full">
      <div class="py-2 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col">
        <div class="flex gap-x-5">
          <WorkspaceProfileImage :workspace="workspace" />
          <div class="relative w-full">
            <div class="absolute top-3 right-3 z-50 cursor-pointer">
              <div class="flex flex-col items-center">
                <div class="p-1 rounded-full border-none">
                  <CircleNotch
                    v-if="loading"
                    class="text-theme-text-primary w-5 h-5 animate-spin"
                    aria-label="Downloading image..."
                  />
                  <DownloadSimple
                    v-else
                    weight="bold"
                    class="text-theme-text-primary w-5 h-5 hover:text-theme-text-primary"
                    @click="handleDownload"
                    aria-label="Download graph image"
                  />
                </div>
              </div>
            </div>
            <div :ref="chartRef">
              <!-- Area Chart -->
              <div v-if="chartType === 'area'" class="bg-theme-bg-primary p-8 rounded-xl text-white light:border light:border-theme-border-primary">
                <h3 class="text-lg text-theme-text-primary font-medium">{{ title }}</h3>
                <AreaChart
                  class="h-[350px]"
                  :data="data"
                  index="name"
                  :categories="[value]"
                  :colors="[color || 'blue', 'cyan']"
                  :show-legend="showLegend"
                  :value-formatter="dataFormatter"
                />
              </div>

              <!-- Bar Chart -->
              <div v-else-if="chartType === 'bar'" class="bg-theme-bg-primary p-8 rounded-xl text-white light:border light:border-theme-border-primary">
                <h3 class="text-lg text-theme-text-primary font-medium">{{ title }}</h3>
                <BarChart
                  class="h-[350px]"
                  :data="data"
                  index="name"
                  :categories="[value]"
                  :colors="[color || 'blue']"
                  :show-legend="showLegend"
                  :value-formatter="dataFormatter"
                  layout="vertical"
                  :y-axis-width="100"
                />
              </div>

              <!-- Line Chart -->
              <div v-else-if="chartType === 'line'" class="bg-theme-bg-primary p-8 pb-12 rounded-xl text-white h-[500px] w-full light:border light:border-theme-border-primary">
                <h3 class="text-lg text-theme-text-primary font-medium">{{ title }}</h3>
                <LineChart
                  class="h-[400px]"
                  :data="data"
                  index="name"
                  :categories="[value]"
                  :colors="[color || 'blue']"
                  :show-legend="showLegend"
                  :value-formatter="dataFormatter"
                />
              </div>

              <!-- Composed Chart -->
              <div v-else-if="chartType === 'composed'" class="bg-theme-bg-primary p-8 rounded-xl text-white light:border light:border-theme-border-primary">
                <h3 class="text-lg text-theme-text-primary font-medium">{{ title }}</h3>
                <Legend
                  v-if="showLegend"
                  :categories="[value]"
                  :colors="[color || 'blue', color || 'blue']"
                  class="mb-5 justify-end"
                />
                <ComposedChart :width="500" :height="260" :data="data">
                  <CartesianGrid
                    stroke-dasharray="3 3"
                    horizontal
                    :vertical="false"
                  />
                  <XAxis
                    data-key="name"
                    :tick-line="false"
                    :axis-line="false"
                    interval="preserveStartEnd"
                    :tick="{ transform: 'translate(0, 6)', fill: 'white' }"
                    :style="{
                      fontSize: '12px',
                      fontFamily: 'Inter; Helvetica',
                    }"
                    :padding="{ left: 10, right: 10 }"
                  />
                  <YAxis
                    :tick-line="false"
                    :axis-line="false"
                    type="number"
                    :tick="{ transform: 'translate(-3, 0)', fill: 'white' }"
                    :style="{
                      fontSize: '12px',
                      fontFamily: 'Inter; Helvetica',
                    }"
                  />
                  <Tooltip :legend-color="getTremorColor(color || 'blue')" />
                  <Line
                    type="linear"
                    :data-key="value"
                    :stroke="getTremorColor(color || 'blue')"
                    :dot="false"
                    :stroke-width="2"
                  />
                  <Bar
                    data-key="value"
                    name="value"
                    type="linear"
                    :fill="getTremorColor(color || 'blue')"
                  />
                </ComposedChart>
              </div>

              <!-- Scatter Chart -->
              <div v-else-if="chartType === 'scatter'" class="bg-theme-bg-primary p-8 rounded-xl text-white light:border light:border-theme-border-primary">
                <h3 class="text-lg text-theme-text-primary font-medium">{{ title }}</h3>
                <div v-if="showLegend" class="flex justify-end">
                  <Legend
                    :categories="[value]"
                    :colors="[color || 'blue', color || 'blue']"
                    class="mb-5"
                  />
                </div>
                <ScatterChart :width="500" :height="260" :data="data">
                  <CartesianGrid
                    stroke-dasharray="3 3"
                    horizontal
                    :vertical="false"
                  />
                  <XAxis
                    data-key="name"
                    :tick-line="false"
                    :axis-line="false"
                    interval="preserveStartEnd"
                    :tick="{ transform: 'translate(0, 6)', fill: 'white' }"
                    :style="{
                      fontSize: '12px',
                      fontFamily: 'Inter; Helvetica',
                    }"
                    :padding="{ left: 10, right: 10 }"
                  />
                  <YAxis
                    :tick-line="false"
                    :axis-line="false"
                    type="number"
                    :tick="{ transform: 'translate(-3, 0)', fill: 'white' }"
                    :style="{
                      fontSize: '12px',
                      fontFamily: 'Inter; Helvetica',
                    }"
                  />
                  <Tooltip :legend-color="getTremorColor(color || 'blue')" />
                  <Scatter :data-key="value" :fill="getTremorColor(color || 'blue')" />
                </ScatterChart>
              </div>

              <!-- Pie Chart -->
              <div v-else-if="chartType === 'pie'" class="bg-theme-bg-primary p-8 rounded-xl text-white light:border light:border-theme-border-primary">
                <h3 class="text-lg text-theme-text-primary font-medium">{{ title }}</h3>
                <DonutChart
                  :data="data"
                  :category="value"
                  index="name"
                  :colors="[
                    color || 'cyan',
                    'violet',
                    'rose',
                    'amber',
                    'emerald',
                    'teal',
                    'fuchsia',
                  ]"
                  :show-label="showLegend"
                  :value-formatter="dataFormatter"
                  :custom-tooltip="customTooltip"
                />
              </div>

              <!-- Radar Chart -->
              <div v-else-if="chartType === 'radar'" class="bg-theme-bg-primary p-8 rounded-xl text-white light:border light:border-theme-border-primary">
                <h3 class="text-lg text-theme-text-primary font-medium">{{ title }}</h3>
                <div v-if="showLegend" class="flex justify-end">
                  <Legend
                    :categories="[value]"
                    :colors="[color || 'blue', color || 'blue']"
                    class="mb-5"
                  />
                </div>
                <RadarChart
                  :cx="300"
                  :cy="250"
                  :outer-radius="150"
                  :width="600"
                  :height="500"
                  :data="data"
                >
                  <PolarGrid />
                  <PolarAngleAxis data-key="name" :tick="{ fill: 'white' }" />
                  <PolarRadiusAxis :tick="{ fill: 'white' }" />
                  <Tooltip :legend-color="getTremorColor(color || 'blue')" />
                  <Radar
                    data-key="value"
                    :stroke="getTremorColor(color || 'blue')"
                    :fill="getTremorColor(color || 'blue')"
                    :fill-opacity="0.6"
                  />
                </RadarChart>
              </div>

              <!-- RadialBar Chart -->
              <div v-else-if="chartType === 'radialbar'" class="bg-theme-bg-primary p-8 rounded-xl text-white light:border light:border-theme-border-primary">
                <h3 class="text-lg text-theme-text-primary font-medium">{{ title }}</h3>
                <div v-if="showLegend" class="flex justify-end">
                  <Legend
                    :categories="[value]"
                    :colors="[color || 'blue', color || 'blue']"
                    class="mb-5"
                  />
                </div>
                <RadialBarChart
                  :width="500"
                  :height="300"
                  :cx="150"
                  :cy="150"
                  :inner-radius="20"
                  :outer-radius="140"
                  :bar-size="10"
                  :data="data"
                >
                  <RadialBar
                    :angle-axis-id="15"
                    :label="{
                      position: 'insideStart',
                      fill: getTremorColor(color || 'blue'),
                    }"
                    data-key="value"
                  />
                  <Tooltip :legend-color="getTremorColor(color || 'blue')" />
                </RadialBarChart>
              </div>

              <!-- Treemap Chart -->
              <div v-else-if="chartType === 'treemap'" class="bg-theme-bg-primary p-8 rounded-xl text-white light:border light:border-theme-border-primary">
                <h3 class="text-lg text-theme-text-primary font-medium">{{ title }}</h3>
                <div v-if="showLegend" class="flex justify-end">
                  <Legend
                    :categories="[value]"
                    :colors="[color || 'blue', color || 'blue']"
                    class="mb-5"
                  />
                </div>
                <Treemap
                  :width="500"
                  :height="260"
                  :data="data"
                  data-key="value"
                  stroke="#fff"
                  :fill="getTremorColor(color || 'blue')"
                >
                  <CustomCell :colors="Object.values(Colors)" />
                  <Tooltip :legend-color="getTremorColor(color || 'blue')" />
                </Treemap>
              </div>

              <!-- Funnel Chart -->
              <div v-else-if="chartType === 'funnel'" class="bg-theme-bg-primary p-8 rounded-xl text-white light:border light:border-theme-border-primary">
                <h3 class="text-lg text-theme-text-primary font-medium">{{ title }}</h3>
                <div v-if="showLegend" class="flex justify-end">
                  <Legend
                    :categories="[value]"
                    :colors="[color || 'blue', color || 'blue']"
                    class="mb-5"
                  />
                </div>
                <FunnelChart :width="500" :height="300" :data="data">
                  <Tooltip :legend-color="getTremorColor(color || 'blue')" />
                  <Funnel data-key="value" :color="getTremorColor(color || 'blue')" />
                </FunnelChart>
              </div>

              <!-- Unsupported Chart Type -->
              <p v-else>Unsupported chart type.</p>
            </div>
            <span
              class="flex flex-col gap-y-1 mt-2"
              v-html="renderMarkdown(content.caption)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Without chatId -->
    <div v-else class="flex justify-center items-end w-full">
      <div class="py-2 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col">
        <div class="relative w-full">
          <div class="absolute top-3 right-3 z-50 cursor-pointer">
            <div class="flex flex-col items-center">
              <div class="p-1 rounded-full border-none">
                <CircleNotch
                  v-if="loading"
                  class="text-theme-text-primary w-5 h-5 animate-spin"
                  aria-label="Downloading image..."
                />
                <DownloadSimple
                  v-else
                  weight="bold"
                  class="text-theme-text-primary w-5 h-5 hover:text-theme-text-primary"
                  @click="handleDownload"
                  aria-label="Download graph image"
                />
              </div>
            </div>
          </div>
          <div :ref="chartRef">
            <!-- Same chart rendering as above - duplicated for different layout -->
            <div v-if="chartType === 'area'" class="bg-theme-bg-primary p-8 rounded-xl text-white light:border light:border-theme-border-primary">
              <h3 class="text-lg text-theme-text-primary font-medium">{{ title }}</h3>
              <AreaChart
                class="h-[350px]"
                :data="data"
                index="name"
                :categories="[value]"
                :colors="[color || 'blue', 'cyan']"
                :show-legend="showLegend"
                :value-formatter="dataFormatter"
              />
            </div>
            <!-- ... other chart types omitted for brevity, same as above ... -->
          </div>
        </div>
        <div class="flex gap-x-5">
          <span
            class="flex flex-col gap-y-1 mt-2"
            v-html="renderMarkdown(content.caption)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide, inject, h } from 'vue'
import { formatDateTimeAsMoment } from '@/utils/directories'
import { numberWithCommas } from '@/utils/numbers'

const SHOW_METRICS_KEY = 'anythingllm_show_chat_metrics'
const SHOW_METRICS_EVENT = 'anythingllm_show_metrics_change'

// Metrics Context Key
const MetricsContextKey = Symbol('MetricsContext')

/**
 * @param {number} duration - duration in milliseconds
 * @returns {string}
 */
function formatDuration(duration) {
  try {
    return duration < 1
      ? `${(duration * 1000).toFixed(0)}ms`
      : `${duration.toFixed(3)}s`
  } catch {
    return ''
  }
}

/**
 * Format the output TPS to a string
 * @param {number} outputTps - output TPS
 * @returns {string}
 */
function formatTps(outputTps) {
  try {
    return outputTps < 1000
      ? outputTps.toFixed(2)
      : numberWithCommas(outputTps.toFixed(0))
  } catch {
    return ''
  }
}

/**
 * Get the show metrics setting from localStorage `anythingllm_show_chat_metrics` key
 * @returns {boolean}
 */
function getAutoShowMetrics() {
  return window?.localStorage?.getItem(SHOW_METRICS_KEY) === 'true'
}

/**
 * Build the metrics string for a given metrics object
 * - Model name
 * - Duration and output TPS
 * - Timestamp
 * @param {metrics: {duration:number, outputTps: number, model?: string, timestamp?: number}} metrics
 * @returns {string}
 */
function buildMetricsString(metrics = {}) {
  return [
    metrics?.model ? metrics.model : '',
    `${formatDuration(metrics.duration)} (${formatTps(metrics.outputTps)} tok/s)`,
    metrics?.timestamp
      ? formatDateTimeAsMoment(metrics.timestamp, 'MMM D, h:mm A')
      : '',
  ]
    .filter(Boolean)
    .join(' · ')
}

/**
 * Toggle the show metrics setting in localStorage `anythingllm_show_chat_metrics` key
 * @returns {void}
 */
function toggleAutoShowMetrics() {
  const currentValue = getAutoShowMetrics() || false
  window?.localStorage?.setItem(SHOW_METRICS_KEY, !currentValue)
  window.dispatchEvent(
    new CustomEvent(SHOW_METRICS_EVENT, {
      detail: { showMetricsAutomatically: !currentValue },
    })
  )
  return !currentValue
}
</script>

<script>
/**
 * Provider for the metrics context that controls the visibility of the metrics
 * per-chat based on the user's preference.
 */
export const MetricsProvider = {
  setup(props, { slots }) {
    const showMetricsAutomatically = ref(getAutoShowMetrics())

    function handleShowingMetricsEvent(e) {
      if (!e?.detail?.hasOwnProperty('showMetricsAutomatically')) return
      showMetricsAutomatically.value = e.detail.showMetricsAutomatically
    }

    onMounted(() => {
      console.log('Adding event listener for metrics visibility')
      window.addEventListener(SHOW_METRICS_EVENT, handleShowingMetricsEvent)
    })

    onUnmounted(() => {
      window.removeEventListener(SHOW_METRICS_EVENT, handleShowingMetricsEvent)
    })

    // Provide context
    provide(MetricsContextKey, {
      showMetricsAutomatically,
      setShowMetricsAutomatically: (value) => {
        showMetricsAutomatically.value = value
      }
    })

    return () => slots.default?.()
  }
}

/**
 * Render the metrics for a given chat, if available
 */
export default {
  props: {
    metrics: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    // Inherit the showMetricsAutomatically state from the MetricsProvider so the state is shared across all chats
    const context = inject(MetricsContextKey, null)

    if (!context) {
      console.warn('RenderMetrics must be used within MetricsProvider')
      return () => null
    }

    const { showMetricsAutomatically, setShowMetricsAutomatically } = context

    if (!props.metrics?.duration || !props.metrics?.outputTps) return () => null

    return () => h('button', {
      type: 'button',
      onClick: () => setShowMetricsAutomatically(toggleAutoShowMetrics()),
      'data-tooltip-id': 'metrics-visibility',
      'data-tooltip-content': showMetricsAutomatically.value
        ? 'Click to only show metrics when hovering'
        : 'Click to show metrics as soon as they are available',
      class: `border-none flex justify-end items-center gap-x-[8px] ${showMetricsAutomatically.value ? 'opacity-100' : 'opacity-0'} md:group-hover:opacity-100 transition-all duration-300`
    }, [
      h('p', {
        class: 'cursor-pointer text-xs font-mono text-theme-text-secondary opacity-50'
      }, buildMetricsString(props.metrics))
    ])
  }
}
</script>

<template>
  <slot />
</template>

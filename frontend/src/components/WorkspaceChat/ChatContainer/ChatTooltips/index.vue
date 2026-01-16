<script setup>
/**
 * Set the tooltips for the chat container in bulk.
 * Why do this?
 *
 * React-tooltip rendering on _each_ chat will attach an event listener to the body.
 * This will add up if we have many chats open resulting in the browser crashing
 * so we batch them together in a single component that renders at the top most level with
 * a static id the content can change, but this prevents the React-tooltip library from adding
 * hundreds of event listeners to the DOM.
 *
 * In general, anywhere we have iterative rendering the Tooltip should be rendered at the highest level to prevent
 * hundreds of event listeners from being added to the DOM in the worst case scenario.
 *
 * NOTE: This component is a placeholder for Vue tooltip implementation.
 * The actual tooltip functionality should be implemented using a Vue-compatible tooltip library
 * that supports data-tooltip-id attributes or similar functionality.
 */

// TODO: Implement with a Vue-compatible tooltip library (e.g., floating-vue, v-tooltip)
// For now, using native title attributes in components that reference these tooltip IDs
</script>

<template>
  <!-- Placeholder for tooltip implementation -->
  <!-- The following tooltip IDs should be supported:
    - message-to-speech
    - regenerate-assistant-text
    - copy-assistant-text
    - feedback-button
    - action-menu
    - edit-input-text
    - metrics-visibility
    - expand-cot
    - cot-thinking
    - query-refusal-info
    - context-window-limit-exceeded
    - similarity-score (document level, rendered at body)
  -->
  <div style="display: none;"></div>
</template>

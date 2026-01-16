<script setup>
import { ref } from 'vue'
import { PhCaretDown, PhCaretUp, PhInfo } from '@phosphor-icons/vue'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const showAdvancedControls = ref(false)

const handleScroll = (e) => {
  e.target.blur()
}
</script>

<template>
  <div class="w-full flex flex-col gap-y-7">
    <div class="w-full flex items-center gap-[36px] mt-1.5 flex-wrap">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Base URL
        </label>
        <input
          type="url"
          name="EmbeddingBasePath"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="https://api.openai.com/v1"
          :value="settings?.EmbeddingBasePath"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          Embedding Model
        </label>
        <input
          type="text"
          name="EmbeddingModelPref"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="text-embedding-ada-002"
          :value="settings?.EmbeddingModelPref"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <div
          :title="'Maximum length of text chunks, in characters, for embedding.'"
          class="flex gap-x-1 items-center mb-3"
        >
          <PhInfo :size="16" class="text-theme-text-secondary cursor-pointer" />
          <label class="text-white text-sm font-semibold block">
            Max embedding chunk length
          </label>
        </div>
        <input
          type="number"
          name="EmbeddingModelMaxChunkLength"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="8192"
          :min="1"
          @scroll="handleScroll"
          :value="settings?.EmbeddingModelMaxChunkLength"
          autocomplete="off"
        />
      </div>
    </div>
    <div class="w-full flex items-center gap-[36px]">
      <div class="flex flex-col w-60">
        <div class="flex flex-col gap-y-1 mb-4">
          <label class="text-white text-sm font-semibold flex items-center gap-x-2">
            API Key <p class="!text-xs !italic !font-thin">optional</p>
          </label>
        </div>
        <input
          type="password"
          name="GenericOpenAiEmbeddingApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="sk-mysecretkey"
          :value="settings?.GenericOpenAiEmbeddingApiKey ? '*'.repeat(20) : ''"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>
    <div class="flex justify-start mt-4">
      <button
        @click.prevent="showAdvancedControls = !showAdvancedControls"
        class="border-none text-theme-text-primary hover:text-theme-text-secondary flex items-center text-sm"
      >
        {{ showAdvancedControls ? 'Hide' : 'Show' }} advanced settings
        <PhCaretUp v-if="showAdvancedControls" :size="14" class="ml-1" />
        <PhCaretDown v-else :size="14" class="ml-1" />
      </button>
    </div>
    <div v-show="showAdvancedControls">
      <div class="w-full flex items-start gap-4">
        <div class="flex flex-col w-60">
          <div class="flex flex-col gap-y-1 mb-4">
            <label class="text-white text-sm font-semibold flex items-center gap-x-2">
              Max concurrent Chunks
              <p class="!text-xs !italic !font-thin">optional</p>
            </label>
          </div>
          <input
            type="number"
            name="GenericOpenAiEmbeddingMaxConcurrentChunks"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="500"
            :min="1"
            @scroll="handleScroll"
            :value="settings?.GenericOpenAiEmbeddingMaxConcurrentChunks"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

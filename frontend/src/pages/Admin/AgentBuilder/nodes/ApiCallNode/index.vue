<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-theme-text-primary mb-2">
        URL
      </label>
      <div class="flex gap-2">
        <input
          ref="urlInputRef"
          type="text"
          placeholder="https://api.example.com/endpoint"
          :value="config.url"
          @input="(e) => onConfigChange({ url: e.target.value })"
          class="flex-1 border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
          autocomplete="off"
          spellcheck="false"
        />
        <div class="relative">
          <button
            ref="varButtonRef"
            @click="showVarMenu = !showVarMenu"
            class="h-full px-3 rounded-lg border-none bg-theme-settings-input-bg text-theme-text-primary hover:bg-theme-action-menu-item-hover transition-colors duration-300 flex items-center gap-1"
            title="Insert variable"
            type="button"
          >
            <Plus class="w-4 h-4" />
            <CaretDown class="w-3 h-3" />
          </button>
          <div
            v-if="showVarMenu"
            class="absolute right-0 top-[calc(100%+4px)] w-48 bg-theme-settings-input-bg border-none rounded-lg shadow-lg z-10"
          >
            <select
              :value="''"
              @change="(e) => {
                insertVariableAtCursor(e.target.value)
                e.target.value = ''
              }"
              class="w-full border-none bg-theme-settings-input-bg text-theme-text-primary text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
            >
              <option value="" class="bg-theme-bg-primary">
                Select variable to insert
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
          </div>
        </div>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-theme-text-primary mb-2">
        Method
      </label>
      <select
        :value="config.method"
        @change="(e) => onConfigChange({ method: e.target.value })"
        class="w-full border-none bg-theme-settings-input-bg text-theme-text-primary text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
      >
        <option
          v-for="method in ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']"
          :key="method"
          :value="method"
          class="bg-theme-settings-input-bg"
        >
          {{ method }}
        </option>
      </select>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium text-theme-text-primary">
          Headers
        </label>
        <button
          @click="addHeader"
          class="p-1.5 rounded-lg border-none bg-theme-settings-input-bg text-theme-text-primary hover:bg-theme-action-menu-item-hover transition-colors duration-300"
          title="Add header"
          type="button"
        >
          <Plus class="w-3.5 h-3.5" />
        </button>
      </div>
      <div class="space-y-2">
        <div
          v-for="(header, index) in (config.headers || [])"
          :key="index"
          class="flex gap-2"
        >
          <input
            type="text"
            placeholder="Header name"
            :value="header.key"
            @input="(e) => handleHeaderChange(index, 'key', e.target.value)"
            class="flex-1 border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
            autocomplete="off"
            spellcheck="false"
          />
          <input
            type="text"
            placeholder="Value"
            :value="header.value"
            @input="(e) => handleHeaderChange(index, 'value', e.target.value)"
            class="flex-1 border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
            autocomplete="off"
            spellcheck="false"
          />
          <button
            @click="removeHeader(index)"
            class="p-2.5 rounded-lg border-none bg-theme-settings-input-bg text-theme-text-primary hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/10 transition-colors duration-300"
            title="Remove header"
            type="button"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="['POST', 'PUT', 'PATCH'].includes(config.method)">
      <label class="block text-sm font-medium text-theme-text-primary mb-2">
        Request Body
      </label>
      <div class="space-y-2">
        <select
          :value="config.bodyType || 'json'"
          @change="(e) => onConfigChange({ bodyType: e.target.value })"
          class="w-full p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-theme-text-primary focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none light:bg-theme-settings-input-bg light:border-black/10"
        >
          <option
            value="json"
            class="bg-theme-bg-primary light:bg-theme-settings-input-bg"
          >
            JSON
          </option>
          <option
            value="text"
            class="bg-theme-bg-primary light:bg-theme-settings-input-bg"
          >
            Raw Text
          </option>
          <option
            value="form"
            class="bg-theme-bg-primary light:bg-theme-settings-input-bg"
          >
            Form Data
          </option>
        </select>
        <textarea
          v-if="config.bodyType === 'json'"
          placeholder='{"key": "value"}'
          :value="config.body"
          @input="(e) => onConfigChange({ body: e.target.value })"
          class="w-full p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-theme-text-primary placeholder:text-theme-text-secondary/20 focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none light:bg-theme-settings-input-bg light:border-black/10 font-mono"
          rows="4"
          autocomplete="off"
          spellcheck="false"
        />
        <div v-else-if="config.bodyType === 'form'" class="space-y-2">
          <div
            v-for="(item, index) in (config.formData || [])"
            :key="index"
            class="flex gap-2"
          >
            <input
              type="text"
              placeholder="Key"
              :value="item.key"
              @input="(e) => {
                const newFormData = [...(config.formData || [])]
                newFormData[index] = { ...item, key: e.target.value }
                onConfigChange({ formData: newFormData })
              }"
              class="flex-1 p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-theme-text-primary placeholder:text-theme-text-secondary/20 focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none light:bg-theme-settings-input-bg light:border-black/10"
              autocomplete="off"
              spellcheck="false"
            />
            <input
              type="text"
              placeholder="Value"
              :value="item.value"
              @input="(e) => {
                const newFormData = [...(config.formData || [])]
                newFormData[index] = { ...item, value: e.target.value }
                onConfigChange({ formData: newFormData })
              }"
              class="flex-1 p-2.5 text-sm rounded-lg bg-theme-bg-primary border border-white/5 text-theme-text-primary placeholder:text-theme-text-secondary/20 focus:border-primary-button focus:ring-1 focus:ring-primary-button outline-none light:bg-theme-settings-input-bg light:border-black/10"
              autocomplete="off"
              spellcheck="false"
            />
            <button
              @click="() => {
                const newFormData = [...(config.formData || [])].filter((_, i) => i !== index)
                onConfigChange({ formData: newFormData })
              }"
              class="p-2.5 rounded-lg bg-theme-bg-primary border border-white/5 text-theme-text-primary hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/10 transition-colors duration-300 light:bg-theme-settings-input-bg light:border-black/10"
              title="Remove field"
              type="button"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <button
            @click="() => {
              const newFormData = [...(config.formData || []), { key: '', value: '' }]
              onConfigChange({ formData: newFormData })
            }"
            class="w-full p-2.5 rounded-lg border-none bg-theme-settings-input-bg text-theme-text-primary hover:bg-theme-action-menu-item-hover transition-colors duration-300 text-sm"
            type="button"
          >
            Add Form Field
          </button>
        </div>
        <textarea
          v-else
          placeholder="Raw request body..."
          :value="config.body"
          @input="(e) => onConfigChange({ body: e.target.value })"
          class="w-full border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none p-2.5"
          rows="4"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-theme-text-primary mb-2">
        Store Response In
      </label>
      <VariableSelect
        :value="config.responseVariable"
        :on-change="(value) => onConfigChange({ responseVariable: value })"
        :available-variables="availableVariables"
        placeholder="Select or create variable"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { PhPlus, PhX, PhCaretDown } from '@phosphor-icons/vue'
import VariableSelect from '../VariableSelect.vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  onConfigChange: {
    type: Function,
    required: true
  },
  renderVariableSelect: {
    type: Function,
    required: false
  }
})

const urlInputRef = ref(null)
const varButtonRef = ref(null)
const showVarMenu = ref(false)

// Get available variables from parent context
const getAvailableVariables = inject('getAvailableVariables', () => [])
const availableVariables = computed(() => getAvailableVariables())

const handleHeaderChange = (index, field, value) => {
  const newHeaders = [...(props.config.headers || [])]
  newHeaders[index] = { ...newHeaders[index], [field]: value }
  props.onConfigChange({ headers: newHeaders })
}

const addHeader = () => {
  const newHeaders = [...(props.config.headers || []), { key: '', value: '' }]
  props.onConfigChange({ headers: newHeaders })
}

const removeHeader = (index) => {
  const newHeaders = [...(props.config.headers || [])].filter((_, i) => i !== index)
  props.onConfigChange({ headers: newHeaders })
}

const insertVariableAtCursor = (variableName) => {
  if (!urlInputRef.value) return

  const input = urlInputRef.value
  const start = input.selectionStart
  const end = input.selectionEnd
  const currentValue = props.config.url

  const newValue =
    currentValue.substring(0, start) +
    '${' +
    variableName +
    '}' +
    currentValue.substring(end)

  props.onConfigChange({ url: newValue })
  showVarMenu.value = false

  // Set cursor position after the inserted variable
  setTimeout(() => {
    const newPosition = start + variableName.length + 3 // +3 for ${}
    input.setSelectionRange(newPosition, newPosition)
    input.focus()
  }, 0)
}
</script>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ICON_COMPONENTS } from '@/components/Footer/index.vue'
import { Plus, X } from '@phosphor-icons/vue'
import { h } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: null
  },
  url: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['save', 'remove'])

const selectedIcon = ref(props.icon || 'Plus')
const selectedUrl = ref(props.url || '')
const isDropdownOpen = ref(false)
const isEdited = ref(false)
const dropdownRef = ref(null)

watch([() => props.icon, () => props.url], () => {
  selectedIcon.value = props.icon || 'Plus'
  selectedUrl.value = props.url || ''
  isEdited.value = false
})

onMounted(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
      isDropdownOpen.value = false
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
})

const handleSubmit = (e) => {
  e.preventDefault()
  if (selectedIcon.value !== 'Plus' && selectedUrl.value) {
    emit('save', selectedIcon.value, selectedUrl.value)
    isEdited.value = false
  }
}

const handleRemove = () => {
  emit('remove')
  selectedIcon.value = 'Plus'
  selectedUrl.value = ''
  isEdited.value = false
}

const handleIconChange = (iconName) => {
  selectedIcon.value = iconName
  isDropdownOpen.value = false
  isEdited.value = true
}

const handleUrlChange = (e) => {
  selectedUrl.value = e.target.value
  isEdited.value = true
}
</script>

<template>
  <form @submit="handleSubmit" class="flex items-center gap-x-1.5">
    <div class="relative" ref="dropdownRef">
      <div
        class="h-[34px] w-[34px] bg-theme-settings-input-bg rounded-full flex items-center justify-center cursor-pointer hover:outline-primary-button hover:outline"
        @click="isDropdownOpen = !isDropdownOpen"
      >
        <component
          :is="ICON_COMPONENTS[selectedIcon] || Plus"
          class="h-5 w-5"
          :weight="selectedIcon === 'Plus' ? 'bold' : 'fill'"
          :style="{ color: 'var(--theme-sidebar-footer-icon-fill)' }"
        />
      </div>
      <div
        v-if="isDropdownOpen"
        class="absolute z-10 grid grid-cols-4 bg-theme-settings-input-bg mt-2 rounded-md w-[150px] h-[78px] overflow-y-auto border border-white/20 shadow-lg"
      >
        <button
          v-for="iconName in Object.keys(ICON_COMPONENTS)"
          :key="iconName"
          type="button"
          class="flex justify-center items-center border border-transparent hover:bg-theme-sidebar-footer-icon-hover hover:border-slate-100 light:hover:border-black/80 rounded-full p-2"
          @click="handleIconChange(iconName)"
        >
          <component
            :is="ICON_COMPONENTS[iconName]"
            class="h-5 w-5"
            weight="fill"
            :style="{ color: 'var(--theme-sidebar-footer-icon-fill)' }"
          />
        </button>
      </div>
    </div>
    <input
      type="url"
      :value="selectedUrl"
      @input="handleUrlChange"
      placeholder="https://example.com"
      class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-md p-2.5 w-[300px] h-[32px] focus:outline-primary-button active:outline-primary-button outline-none"
      required
    />
    <template v-if="selectedIcon !== 'Plus'">
      <button
        v-if="isEdited"
        type="submit"
        class="text-sky-400 px-2 py-2 rounded-md text-sm font-bold hover:text-sky-500"
      >
        Save
      </button>
      <button
        v-else
        type="button"
        @click="handleRemove"
        class="hover:text-red-500 text-white/80 px-2 py-2 rounded-md text-sm font-bold"
      >
        <X :size="20" />
      </button>
    </template>
  </form>
</template>

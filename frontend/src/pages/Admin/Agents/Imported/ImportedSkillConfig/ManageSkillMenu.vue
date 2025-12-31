<template>
  <div v-if="config.hubId" class="relative" ref="menuRef">
    <button
      type="button"
      @click="open = !open"
      class="p-1.5 rounded-lg text-white hover:bg-theme-action-menu-item-hover transition-colors duration-300"
    >
      <Gear class="h-5 w-5" weight="bold" />
    </button>
    <div
      v-if="open"
      class="absolute w-[100px] -top-1 left-7 mt-1 border-[1.5px] border-white/40 rounded-lg bg-theme-action-menu-bg flex flex-col shadow-[0_4px_14px_rgba(0,0,0,0.25)] text-white z-99 md:z-10"
    >
      <button
        type="button"
        @click="deleteSkill"
        class="border-none flex items-center rounded-lg gap-x-2 hover:bg-theme-action-menu-item-hover py-1.5 px-2 transition-colors duration-200 w-full text-left"
      >
        <span class="text-sm">Delete Skill</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { Gear } from '@phosphor-icons/vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  setImportedSkills: {
    type: Function,
    required: true
  }
})

const open = ref(false)
const menuRef = ref(null)

async function deleteSkill() {
  if (
    !window.confirm(
      'Are you sure you want to delete this skill? This action cannot be undone.'
    )
  )
    return
  const success = await System.experimentalFeatures.agentPlugins.deletePlugin(
    props.config.hubId
  )
  if (success) {
    props.setImportedSkills((prev) => prev.filter((s) => s.hubId !== props.config.hubId))
    showToast('Skill deleted successfully.', 'success')
    open.value = false
  } else {
    showToast('Failed to delete skill.', 'error')
  }
}

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

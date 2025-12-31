<template>
  <div class="p-2">
    <div class="flex flex-col gap-y-[18px] max-w-[500px]">
      <div class="flex items-center gap-x-2">
        <Plug :size="24" weight="bold" class="text-white" />
        <label for="name" class="text-white text-md font-bold">
          {{ sentenceCase(config.name) }}
        </label>
        <label class="border-none relative inline-flex items-center ml-auto cursor-pointer">
          <input
            type="checkbox"
            class="peer sr-only"
            :checked="config.active"
            @change="toggleSkill"
          />
          <div class="peer-disabled:opacity-50 pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
          <span class="ml-3 text-sm font-medium"></span>
        </label>
        <ManageSkillMenu
          :config="config"
          :set-imported-skills="setImportedSkills"
        />
      </div>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ config.description }} by
        <a
          :href="config.author_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-white hover:underline"
        >
          {{ config.author }}
        </a>
      </p>

      <div v-if="hasSetupArgs" class="flex flex-col gap-y-2">
        <div
          v-for="[key, props] in Object.entries(config.setup_args)"
          :key="key"
          class="flex flex-col gap-y-1"
        >
          <label :for="key" class="text-white text-sm font-bold">
            {{ key }}
          </label>
          <input
            :type="props?.input?.type || 'text'"
            :required="props?.input?.required"
            :value="props.hasOwnProperty('value') ? props.value : props?.input?.default || ''"
            @input="(e) => updateInput(key, e.target.value)"
            :placeholder="props?.input?.placeholder || ''"
            class="border-solid bg-transparent border border-white light:border-black rounded-md p-2 text-white text-sm"
          />
          <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
            {{ props?.input?.hint }}
          </p>
        </div>
        <button
          v-if="hasChanges"
          @click="handleSubmit"
          type="button"
          class="bg-blue-500 text-white light:text-white rounded-md p-2"
        >
          Save
        </button>
      </div>

      <p v-else class="text-white text-opacity-60 text-sm font-medium py-1.5">
        There are no options to modify for this skill.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import System from '@/models/system'
import showToast from '@/utils/toast'
import { Gear, Plug } from '@phosphor-icons/vue'
import { sentenceCase } from 'text-case'
import ManageSkillMenu from './ManageSkillMenu.vue'

const props = defineProps({
  selectedSkill: {
    type: Object,
    required: true
  },
  setImportedSkills: {
    type: Function,
    required: true
  }
})

function inputsFromArgs(setupArgs) {
  if (
    !setupArgs ||
    setupArgs.constructor?.call?.().toString() !== '[object Object]'
  ) {
    return {}
  }
  return Object.entries(setupArgs).reduce(
    (acc, [key, props]) => ({
      ...acc,
      [key]: props.hasOwnProperty('value')
        ? props.value
        : props?.input?.default || ''
    }),
    {}
  )
}

const config = ref(props.selectedSkill)
const hasChanges = ref(false)
const inputs = ref(inputsFromArgs(props.selectedSkill?.setup_args))

const hasSetupArgs = computed(() =>
  props.selectedSkill?.setup_args &&
  Object.keys(props.selectedSkill.setup_args).length > 0
)

const updateInput = (key, value) => {
  inputs.value[key] = value
}

async function toggleSkill() {
  const updatedConfig = { ...props.selectedSkill, active: !config.value.active }
  await System.experimentalFeatures.agentPlugins.updatePluginConfig(
    config.value.hubId,
    { active: !config.value.active }
  )
  props.setImportedSkills((prev) =>
    prev.map((s) => (s.hubId === config.value.hubId ? updatedConfig : s))
  )
  config.value = updatedConfig
  showToast(
    `Skill ${updatedConfig.active ? 'activated' : 'deactivated'}.`,
    'success',
    { clear: true }
  )
}

async function handleSubmit(e) {
  e?.preventDefault()
  const errors = []
  const updatedConfig = { ...config.value }

  for (const [key, value] of Object.entries(inputs.value)) {
    const settings = config.value.setup_args[key]
    if (settings.required && !value) {
      errors.push(`${key} is required to have a value.`)
      continue
    }
    if (typeof value !== settings.type) {
      errors.push(`${key} must be of type ${settings.type}.`)
      continue
    }
    updatedConfig.setup_args[key].value = value
  }

  if (errors.length > 0) {
    errors.forEach((error) => showToast(error, 'error'))
    return
  }

  await System.experimentalFeatures.agentPlugins.updatePluginConfig(
    config.value.hubId,
    updatedConfig
  )
  config.value = updatedConfig
  props.setImportedSkills((prev) =>
    prev.map((skill) =>
      skill.hubId === config.value.hubId ? updatedConfig : skill
    )
  )
  showToast('Skill config updated successfully.', 'success')
  hasChanges.value = false
}

watch(inputs, () => {
  hasChanges.value =
    JSON.stringify(inputs.value) !==
    JSON.stringify(inputsFromArgs(props.selectedSkill.setup_args))
}, { deep: true })
</script>

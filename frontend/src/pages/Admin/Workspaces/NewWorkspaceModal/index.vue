<script setup>
import { ref } from 'vue'
import { PhX } from '@phosphor-icons/vue'
import Admin from '@/models/admin'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  closeModal: {
    type: Function,
    required: true
  }
})

const { t } = useI18n()
const error = ref(null)

const handleCreate = async (e) => {
  error.value = null
  e.preventDefault()
  const form = new FormData(e.target)
  const { workspace, error: err } = await Admin.newWorkspace(form.get('name'))
  if (!!workspace) window.location.reload()
  error.value = err
}
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
    <div class="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            Create new workspace
          </h3>
        </div>
        <button
          @click="closeModal"
          type="button"
          class="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
        >
          <X :size="24" weight="bold" class="text-white" />
        </button>
      </div>
      <div class="p-6">
        <form @submit="handleCreate">
          <div class="space-y-4">
            <div>
              <label
                for="name"
                class="block mb-2 text-sm font-medium text-white"
              >
                {{ t('common.workspaces-name') }}
              </label>
              <input
                name="name"
                type="text"
                class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="My workspace"
                minlength="4"
                required
                autocomplete="off"
              />
            </div>
            <p v-if="error" class="text-red-400 text-sm">Error: {{ error }}</p>
            <p class="text-white text-opacity-60 text-xs md:text-sm">
              After creating this workspace only admins will be able to see
              it. You can add users after it has been created.
            </p>
          </div>
          <div class="flex justify-between items-center mt-6 pt-6 border-t border-theme-modal-border">
            <button
              @click="closeModal"
              type="button"
              class="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
            >
              Create workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

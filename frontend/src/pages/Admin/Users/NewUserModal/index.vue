<script setup>
import { ref } from 'vue'
import { X } from '@phosphor-icons/vue'
import Admin from '@/models/admin'
import { userFromStorage } from '@/utils/request'
import { ROLE_HINT } from '../index.vue'

const props = defineProps({
  closeModal: {
    type: Function,
    required: true
  }
})

const error = ref(null)
const role = ref('default')
const messageLimit = ref({
  enabled: false,
  limit: 10
})

const user = userFromStorage()

const handleCreate = async (e) => {
  error.value = null
  e.preventDefault()
  const data = {}
  const form = new FormData(e.target)
  for (const [key, value] of form.entries()) data[key] = value
  data.dailyMessageLimit = messageLimit.value.enabled ? messageLimit.value.limit : null

  const { user: newUser, error: err } = await Admin.newUser(data)
  if (!!newUser) window.location.reload()
  error.value = err
}
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
    <div class="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
      <div class="relative p-6 border-b rounded-t border-theme-modal-border">
        <div class="w-full flex gap-x-2 items-center">
          <h3 class="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            Add user to instance
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
              <label for="username" class="block mb-2 text-sm font-medium text-white">
                Username
              </label>
              <input
                name="username"
                type="text"
                class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="User's username"
                minlength="2"
                required
                autocomplete="off"
              />
              <p class="mt-2 text-xs text-white/60">
                Username must only contain lowercase letters, periods,
                numbers, underscores, and hyphens with no spaces
              </p>
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-white">
                Password
              </label>
              <input
                name="password"
                type="text"
                class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="User's initial password"
                required
                autocomplete="off"
                minlength="8"
              />
              <p class="mt-2 text-xs text-white/60">
                Password must be at least 8 characters long
              </p>
            </div>
            <div>
              <label for="bio" class="block mb-2 text-sm font-medium text-white">
                Bio
              </label>
              <textarea
                name="bio"
                class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="User's bio"
                autocomplete="off"
                :rows="3"
              />
            </div>
            <div>
              <label for="role" class="block mb-2 text-sm font-medium text-white">
                Role
              </label>
              <select
                name="role"
                required
                v-model="role"
                class="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
              >
                <option value="default">Default</option>
                <option value="manager">Manager</option>
                <option v-if="user?.role === 'admin'" value="admin">Administrator</option>
              </select>
              <div class="flex flex-col gap-y-1 py-1 pb-4">
                <p class="text-sm font-medium text-theme-text-primary">Permissions</p>
                <ul class="flex flex-col gap-y-1 list-disc px-4">
                  <li
                    v-for="(hint, i) in ROLE_HINT[role || 'default']"
                    :key="i"
                    class="text-xs text-theme-text-secondary"
                  >
                    {{ hint }}
                  </li>
                </ul>
              </div>
            </div>
            <div v-if="role !== 'admin'" class="mt-4 mb-8">
              <div class="flex flex-col gap-y-1">
                <div class="flex items-center gap-x-2">
                  <h2 class="text-base leading-6 font-bold text-white">
                    Limit messages per day
                  </h2>
                  <label class="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      v-model="messageLimit.enabled"
                      class="peer sr-only"
                    />
                    <div class="pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
                  </label>
                </div>
                <p class="text-xs leading-[18px] font-base text-white/60">
                  Restrict this user to a number of successful queries or chats within a
                  24 hour window.
                </p>
              </div>
              <div v-if="messageLimit.enabled" class="mt-4">
                <label class="text-white text-sm font-semibold block mb-4">
                  Message limit per day
                </label>
                <div class="relative mt-2">
                  <input
                    type="number"
                    v-model.number="messageLimit.limit"
                    :min="1"
                    class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                  />
                </div>
              </div>
            </div>
            <p v-if="error" class="text-red-400 text-sm">Error: {{ error }}</p>
            <p class="text-white text-xs md:text-sm">
              After creating a user they will need to login with their initial
              login to get access.
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
              Add user
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

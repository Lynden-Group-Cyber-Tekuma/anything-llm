<template>
  <div class="relative w-full max-w-[550px] max-h-full">
    <div class="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b rounded-t border-theme-modal-border">
        <div class="flex items-center gap-x-4">
          <h3 class="text-base font-semibold text-white">Users</h3>
          <div class="relative">
            <input
              @input="handleSearch"
              class="w-[400px] h-[34px] bg-theme-bg-primary rounded-[100px] text-white placeholder:text-theme-text-secondary text-sm px-10 pl-10"
              placeholder="Search for a user"
            />
            <MagnifyingGlass
              :size="16"
              weight="bold"
              class="text-white text-lg absolute left-3 top-1/2 transform -translate-y-1/2"
            />
          </div>
        </div>
        <button
          @click="closeModal"
          type="button"
          class="border-none bg-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center bg-sidebar-button hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
        >
          <X class="text-white text-lg" />
        </button>
      </div>
      <form @submit.prevent="handleUpdate">
        <div class="py-[17px] px-[20px]">
          <table class="gap-y-[8px] flex flex-col max-h-[385px] overflow-y-auto no-scroll">
            <tr
              v-if="filteredUsers.length > 0"
              v-for="user in filteredUsers"
              :key="user.id"
              class="flex items-center gap-x-2 cursor-pointer"
              @click="handleUserSelect(user.id)"
            >
              <div
                class="shrink-0 w-3 h-3 rounded border-[1px] border-solid border-white light:border-black flex justify-center items-center"
                role="checkbox"
                :aria-checked="isUserSelected(user.id)"
                tabindex="0"
              >
                <div v-if="isUserSelected(user.id)" class="w-2 h-2 bg-white light:bg-black rounded-[2px]" />
              </div>
              <p class="text-theme-text-primary text-sm font-medium">
                {{ user.username }}
              </p>
            </tr>
            <p v-else class="text-theme-text-secondary text-sm font-medium">
              No users found
            </p>
          </table>
        </div>
        <div class="flex w-full justify-between items-center p-3 space-x-2 border-t rounded-b border-gray-500/50">
          <div class="flex items-center gap-x-2">
            <button
              type="button"
              @click="handleSelectAll"
              class="flex items-center gap-x-2 ml-2"
            >
              <div
                class="shrink-0 w-3 h-3 rounded border-[1px] border-white flex justify-center items-center cursor-pointer"
                role="checkbox"
                :aria-checked="selectedUsers.length === filteredUsers.length"
                tabindex="0"
              >
                <div v-if="selectedUsers.length === filteredUsers.length" class="w-2 h-2 bg-white rounded-[2px]" />
              </div>
              <p class="text-white text-sm font-medium">Select All</p>
            </button>
            <button
              v-if="selectedUsers.length > 0"
              type="button"
              @click="handleUnselect"
              class="flex items-center gap-x-2 ml-2"
            >
              <p class="text-theme-text-secondary text-sm font-medium hover:text-theme-text-primary">
                Unselect
              </p>
            </button>
          </div>
          <button
            type="submit"
            class="transition-all duration-300 text-xs px-2 py-1 font-semibold rounded-lg bg-primary-button hover:bg-secondary border-2 border-transparent hover:border-primary-button hover:text-white h-[32px] w-[68px] -mr-8 whitespace-nowrap shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { MagnifyingGlass, X } from '@phosphor-icons/vue';
import Admin from '@/models/admin';
import showToast from '@/utils/toast';

const props = defineProps({
  closeModal: {
    type: Function,
    required: true,
  },
  workspace: {
    type: Object,
    required: true,
  },
  users: {
    type: Array,
    required: true,
  },
});

const searchTerm = ref('');
const selectedUsers = ref(props.workspace?.userIds || []);

const filteredUsers = computed(() =>
  props.users
    .filter((user) =>
      user.username.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
    .filter((user) => user.role !== 'admin')
    .filter((user) => user.role !== 'manager')
);

const handleUpdate = async (e) => {
  const { success, error } = await Admin.updateUsersInWorkspace(
    props.workspace.id,
    selectedUsers.value
  );
  if (success) {
    showToast('Users updated successfully.', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
  showToast(error, 'error');
};

const handleUserSelect = (userId) => {
  if (selectedUsers.value.includes(userId)) {
    selectedUsers.value = selectedUsers.value.filter((id) => id !== userId);
  } else {
    selectedUsers.value = [...selectedUsers.value, userId];
  }
};

const handleSelectAll = () => {
  if (selectedUsers.value.length === filteredUsers.value.length) {
    selectedUsers.value = [];
  } else {
    selectedUsers.value = filteredUsers.value.map((user) => user.id);
  }
};

const handleUnselect = () => {
  selectedUsers.value = [];
};

const isUserSelected = (userId) => {
  return selectedUsers.value.includes(userId);
};

const handleSearch = (event) => {
  searchTerm.value = event.target.value;
};
</script>

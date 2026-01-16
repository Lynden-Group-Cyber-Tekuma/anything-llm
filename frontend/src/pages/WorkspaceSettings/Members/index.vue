<template>
  <div v-if="loading">
    <Skeleton
      height="80vh"
      width="100%"
      highlightColor="var(--theme-bg-primary)"
      baseColor="var(--theme-bg-secondary)"
      :count="1"
      class="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
      containerClassName="flex w-full"
    />
  </div>
  <div v-else class="flex justify-between -mt-3">
    <table class="w-full max-w-[700px] text-sm text-left rounded-lg">
      <thead class="text-white text-opacity-80 text-xs leading-[18px] font-bold uppercase border-white/10 border-b border-opacity-60">
        <tr>
          <th scope="col" class="px-6 py-3 rounded-tl-lg">
            Username
          </th>
          <th scope="col" class="px-6 py-3">
            Role
          </th>
          <th scope="col" class="px-6 py-3">
            Date Added
          </th>
          <th scope="col" class="px-6 py-3 rounded-tr-lg">

          </th>
        </tr>
      </thead>
      <tbody>
        <WorkspaceMemberRow
          v-if="workspaceUsers.length > 0"
          v-for="(user, index) in workspaceUsers"
          :key="index"
          :user="user"
        />
        <tr v-else>
          <td class="text-center py-4 text-white/80" colspan="4">
            No workspace members
          </td>
        </tr>
      </tbody>
    </table>
    <CTAButton @click="openModal">Manage Users</CTAButton>
    <ModalWrapper :isOpen="isOpen">
      <AddMemberModal
        :closeModal="closeModal"
        :users="users"
        :workspace="adminWorkspace"
      />
    </ModalWrapper>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ModalWrapper from '@/components/ModalWrapper';
import { useModal } from '@/hooks/useModal';
import Admin from '@/models/admin';
import Skeleton from 'vue-loading-skeleton';
import 'vue-loading-skeleton/dist/style.css';
import AddMemberModal from './AddMemberModal/index.vue';
import WorkspaceMemberRow from './WorkspaceMemberRow/index.vue';
import CTAButton from '@/components/lib/CTAButton';

const props = defineProps({
  workspace: {
    type: Object,
    required: true,
  },
});

const loading = ref(true);
const users = ref([]);
const workspaceUsers = ref([]);
const adminWorkspace = ref(null);

const { isOpen, openModal, closeModal } = useModal();

onMounted(async () => {
  const _users = await Admin.users();
  const _workspaceUsers = await Admin.workspaceUsers(props.workspace.id);
  const adminWorkspaces = await Admin.workspaces();
  adminWorkspace.value = adminWorkspaces.find(
    (ws) => ws.id === props.workspace.id
  );
  workspaceUsers.value = _workspaceUsers;
  users.value = _users;
  loading.value = false;
});
</script>

<template>
  <div v-if="loading">
    <FullScreenLoader />
  </div>
  <div v-else-if="requiresAuth !== false">
    <PasswordModal v-if="requiresAuth !== null" :mode="mode" />
  </div>
  <ShowWorkspaceChat v-else />
</template>

<script setup>
import { FullScreenLoader } from '@/components/Preloader';
import PasswordModal, { usePasswordModal } from '@/components/Modals/Password';
import ShowWorkspaceChat from './ShowWorkspaceChat.vue';

const { loading, requiresAuth, mode } = usePasswordModal();
</script>

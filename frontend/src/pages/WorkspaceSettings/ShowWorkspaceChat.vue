<template>
  <div class="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
    <Sidebar v-if="!isMobile" />
    <div
      :style="{ height: isMobile ? '100%' : 'calc(100% - 32px)' }"
      class="transition-all duration-500 relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll"
    >
      <div class="flex gap-x-10 pt-6 pb-4 ml-16 mr-8 border-b-2 border-white light:border-theme-chat-input-border border-opacity-10">
        <router-link
          :to="paths.workspace.chat(slug)"
          class="absolute top-2 left-2 md:top-4 md:left-4 transition-all duration-300 p-2 rounded-full text-white bg-theme-sidebar-footer-icon hover:bg-theme-sidebar-footer-icon-hover z-10"
        >
          <ArrowUUpLeft class="h-5 w-5" weight="fill" />
        </router-link>
        <TabItem
          :title="t('workspaces—settings.general')"
          :icon="Wrench"
          :to="paths.workspace.settings.generalAppearance(slug)"
        />
        <TabItem
          :title="t('workspaces—settings.chat')"
          :icon="ChatText"
          :to="paths.workspace.settings.chatSettings(slug)"
        />
        <TabItem
          :title="t('workspaces—settings.vector')"
          :icon="Database"
          :to="paths.workspace.settings.vectorDatabase(slug)"
        />
        <TabItem
          :title="t('workspaces—settings.members')"
          :icon="User"
          :to="paths.workspace.settings.members(slug)"
          :visible="['admin', 'manager'].includes(user?.role)"
        />
        <TabItem
          :title="t('workspaces—settings.agent')"
          :icon="Robot"
          :to="paths.workspace.settings.agentConfig(slug)"
        />
      </div>
      <div class="px-16 py-6">
        <component :is="TabContent" :slug="slug" :workspace="workspace" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { isMobile } from 'react-device-detect';
import Sidebar from '@/components/Sidebar';
import Workspace from '@/models/workspace';
import System from '@/models/system';
import { FullScreenLoader } from '@/components/Preloader';
import { PhArrowUUpLeft, PhChatText, PhDatabase, PhRobot, PhUser, PhWrench,  } from '@phosphor-icons/vue';
import paths from '@/utils/paths';
import GeneralAppearance from './GeneralAppearance/index.vue';
import ChatSettings from './ChatSettings/index.vue';
import VectorDatabase from './VectorDatabase/index.vue';
import Members from './Members/index.vue';
import WorkspaceAgentConfiguration from './AgentConfig/index.vue';
import useUser from '@/hooks/useUser';
import TabItem from './TabItem.vue';

const TABS = {
  'general-appearance': GeneralAppearance,
  'chat-settings': ChatSettings,
  'vector-database': VectorDatabase,
  members: Members,
  'agent-config': WorkspaceAgentConfiguration,
};

const { t } = useI18n();
const route = useRoute();
const { user } = useUser();
const workspace = ref(null);
const loading = ref(true);

const slug = computed(() => route.params.slug);
const tab = computed(() => route.params.tab);
const TabContent = computed(() => TABS[tab.value]);

async function getWorkspace() {
  if (!slug.value) return;
  const _workspace = await Workspace.bySlug(slug.value);
  if (!_workspace) {
    loading.value = false;
    return;
  }

  const _settings = await System.keys();
  const suggestedMessages = await Workspace.getSuggestedMessages(slug.value);
  workspace.value = {
    ..._workspace,
    vectorDB: _settings?.VectorDB,
    suggestedMessages,
  };
  loading.value = false;
}

onMounted(() => {
  getWorkspace();
});

watch([slug, tab], () => {
  getWorkspace();
});
</script>

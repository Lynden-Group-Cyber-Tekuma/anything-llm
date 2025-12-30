import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/App.vue'),
    children: [
      {
        path: '',
        name: 'Main',
        component: () => import('@/pages/Main/index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/pages/Login/index.vue')
      },
      {
        path: 'sso/simple',
        name: 'SimpleSSOPassthrough',
        component: () => import('@/pages/Login/SSO/simple.vue')
      },
      {
        path: 'workspace/:slug/settings/:tab',
        name: 'WorkspaceSettings',
        component: () => import('@/pages/WorkspaceSettings/index.vue'),
        meta: { requiresAuth: true, requiresManager: true }
      },
      {
        path: 'workspace/:slug',
        name: 'WorkspaceChat',
        component: () => import('@/pages/WorkspaceChat/index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'workspace/:slug/t/:threadSlug',
        name: 'WorkspaceChatThread',
        component: () => import('@/pages/WorkspaceChat/index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'accept-invite/:code',
        name: 'AcceptInvite',
        component: () => import('@/pages/Invite/index.vue')
      },
      // Admin routes
      {
        path: 'settings/llm-preference',
        name: 'LLMPreference',
        component: () => import('@/pages/GeneralSettings/LLMPreference/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/transcription-preference',
        name: 'TranscriptionPreference',
        component: () => import('@/pages/GeneralSettings/TranscriptionPreference/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/audio-preference',
        name: 'AudioPreference',
        component: () => import('@/pages/GeneralSettings/AudioPreference/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/embedding-preference',
        name: 'EmbeddingPreference',
        component: () => import('@/pages/GeneralSettings/EmbeddingPreference/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/text-splitter-preference',
        name: 'TextSplitterPreference',
        component: () => import('@/pages/GeneralSettings/EmbeddingTextSplitterPreference/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/vector-database',
        name: 'VectorDatabase',
        component: () => import('@/pages/GeneralSettings/VectorDatabase/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/agents',
        name: 'Agents',
        component: () => import('@/pages/Admin/Agents/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/agents/builder',
        name: 'AgentBuilder',
        component: () => import('@/pages/Admin/AgentBuilder/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, hideUserMenu: true }
      },
      {
        path: 'settings/agents/builder/:flowId',
        name: 'AgentBuilderEdit',
        component: () => import('@/pages/Admin/AgentBuilder/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, hideUserMenu: true }
      },
      {
        path: 'settings/event-logs',
        name: 'EventLogs',
        component: () => import('@/pages/Admin/Logging/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/embed-chat-widgets',
        name: 'ChatEmbedWidgets',
        component: () => import('@/pages/GeneralSettings/ChatEmbedWidgets/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      // Manager routes
      {
        path: 'settings/security',
        name: 'Security',
        component: () => import('@/pages/GeneralSettings/Security/index.vue'),
        meta: { requiresAuth: true, requiresManager: true }
      },
      {
        path: 'settings/privacy',
        name: 'Privacy',
        component: () => import('@/pages/GeneralSettings/PrivacyAndData/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/interface',
        name: 'Interface',
        component: () => import('@/pages/GeneralSettings/Settings/Interface/index.vue'),
        meta: { requiresAuth: true, requiresManager: true }
      },
      {
        path: 'settings/branding',
        name: 'Branding',
        component: () => import('@/pages/GeneralSettings/Settings/Branding/index.vue'),
        meta: { requiresAuth: true, requiresManager: true }
      },
      {
        path: 'settings/default-system-prompt',
        name: 'DefaultSystemPrompt',
        component: () => import('@/pages/Admin/DefaultSystemPrompt/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/chat',
        name: 'ChatSettings',
        component: () => import('@/pages/GeneralSettings/Settings/Chat/index.vue'),
        meta: { requiresAuth: true, requiresManager: true }
      },
      {
        path: 'settings/beta-features',
        name: 'BetaFeatures',
        component: () => import('@/pages/Admin/ExperimentalFeatures/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/api-keys',
        name: 'ApiKeys',
        component: () => import('@/pages/GeneralSettings/ApiKeys/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/system-prompt-variables',
        name: 'SystemPromptVariables',
        component: () => import('@/pages/Admin/SystemPromptVariables/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/browser-extension',
        name: 'BrowserExtension',
        component: () => import('@/pages/GeneralSettings/BrowserExtensionApiKey/index.vue'),
        meta: { requiresAuth: true, requiresManager: true }
      },
      {
        path: 'settings/workspace-chats',
        name: 'WorkspaceChats',
        component: () => import('@/pages/GeneralSettings/Chats/index.vue'),
        meta: { requiresAuth: true, requiresManager: true }
      },
      {
        path: 'settings/invites',
        name: 'Invites',
        component: () => import('@/pages/Admin/Invitations/index.vue'),
        meta: { requiresAuth: true, requiresManager: true }
      },
      {
        path: 'settings/users',
        name: 'Users',
        component: () => import('@/pages/Admin/Users/index.vue'),
        meta: { requiresAuth: true, requiresManager: true }
      },
      {
        path: 'settings/workspaces',
        name: 'Workspaces',
        component: () => import('@/pages/Admin/Workspaces/index.vue'),
        meta: { requiresAuth: true, requiresManager: true }
      },
      // Onboarding
      {
        path: 'onboarding',
        name: 'Onboarding',
        component: () => import('@/pages/OnboardingFlow/index.vue')
      },
      {
        path: 'onboarding/:step',
        name: 'OnboardingStep',
        component: () => import('@/pages/OnboardingFlow/index.vue')
      },
      // Experimental features
      {
        path: 'settings/beta-features/live-document-sync/manage',
        name: 'LiveDocumentSyncManage',
        component: () => import('@/pages/Admin/ExperimentalFeatures/Features/LiveSync/manage/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/community-hub/trending',
        name: 'CommunityHubTrending',
        component: () => import('@/pages/GeneralSettings/CommunityHub/Trending/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/community-hub/authentication',
        name: 'CommunityHubAuthentication',
        component: () => import('@/pages/GeneralSettings/CommunityHub/Authentication/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/community-hub/import-item',
        name: 'CommunityHubImportItem',
        component: () => import('@/pages/GeneralSettings/CommunityHub/ImportItem/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/mobile-connections',
        name: 'MobileConnections',
        component: () => import('@/pages/GeneralSettings/MobileConnections/index.vue'),
        meta: { requiresAuth: true, requiresManager: true }
      },
      // 404
      {
        path: ':pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/404/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'Login' })
    }

    // Check for admin role
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      return next({ name: 'Main' })
    }

    // Check for manager role
    if (to.meta.requiresManager && !authStore.isManagerOrAbove) {
      return next({ name: 'Main' })
    }
  }

  next()
})

export default router

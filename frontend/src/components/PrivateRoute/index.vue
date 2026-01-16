<script setup>
import { ref, onMounted, computed, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import FullScreenLoader from '@/components/Preloader/FullScreenLoader.vue'
import validateSessionTokenForUser from '@/utils/session'
import paths from '@/utils/paths'
import { AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER } from '@/utils/constants'
import { userFromStorage } from '@/utils/request'
import System from '@/models/system'
import UserMenu from '@/components/UserMenu/index.vue'
import KeyboardShortcutWrapper from '@/components/KeyboardShortcutWrapper/index.vue'

// Composable: Used only for Multi-user mode only as we permission specific pages based on auth role.
// When in single user mode we just bypass any auth checks.
export function useIsAuthenticated() {
  const isAuthd = ref(null)
  const shouldRedirectToOnboarding = ref(false)
  const multiUserMode = ref(false)

  onMounted(async () => {
    const {
      MultiUserMode,
      RequiresAuth,
      LLMProvider = null,
      VectorDB = null,
    } = await System.keys()

    multiUserMode.value = MultiUserMode

    // Check for the onboarding redirect condition
    if (
      !MultiUserMode &&
      !RequiresAuth && // Not in Multi-user AND no password set.
      !LLMProvider &&
      !VectorDB
    ) {
      shouldRedirectToOnboarding.value = true
      isAuthd.value = true
      return
    }

    if (!MultiUserMode && !RequiresAuth) {
      isAuthd.value = true
      return
    }

    // Single User password mode check
    if (!MultiUserMode && RequiresAuth) {
      const localAuthToken = localStorage.getItem(AUTH_TOKEN)
      if (!localAuthToken) {
        isAuthd.value = false
        return
      }

      const isValid = await validateSessionTokenForUser()
      isAuthd.value = isValid
      return
    }

    const localUser = localStorage.getItem(AUTH_USER)
    const localAuthToken = localStorage.getItem(AUTH_TOKEN)
    if (!localUser || !localAuthToken) {
      isAuthd.value = false
      return
    }

    const isValid = await validateSessionTokenForUser()
    if (!isValid) {
      localStorage.removeItem(AUTH_USER)
      localStorage.removeItem(AUTH_TOKEN)
      localStorage.removeItem(AUTH_TIMESTAMP)
      isAuthd.value = false
      return
    }

    isAuthd.value = true
  })

  return { isAuthd, shouldRedirectToOnboarding, multiUserMode }
}
</script>

<script>
// AdminRoute Component
// Allows only admin to access the route and if in single user mode,
// allows all users to access the route
export const AdminRoute = defineComponent({
  name: 'AdminRoute',
  props: {
    Component: {
      type: Object,
      required: true
    },
    hideUserMenu: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const router = useRouter()
    const { isAuthd, shouldRedirectToOnboarding, multiUserMode } = useIsAuthenticated()

    const shouldShowComponent = computed(() => {
      if (isAuthd.value === null) return null
      if (shouldRedirectToOnboarding.value) return 'onboarding'

      const user = userFromStorage()
      return isAuthd.value && (user?.role === 'admin' || !multiUserMode.value)
    })

    return () => {
      if (shouldShowComponent.value === null) {
        return h(FullScreenLoader)
      }

      if (shouldShowComponent.value === 'onboarding') {
        router.push(paths.onboarding.home())
        return null
      }

      if (!shouldShowComponent.value) {
        router.push(paths.home())
        return null
      }

      if (props.hideUserMenu) {
        return h(KeyboardShortcutWrapper, {}, () => h(props.Component))
      }

      return h(KeyboardShortcutWrapper, {}, () =>
        h(UserMenu, {}, () => h(props.Component))
      )
    }
  }
})

// ManagerRoute Component
// Allows manager and admin to access the route and if in single user mode,
// allows all users to access the route
export const ManagerRoute = defineComponent({
  name: 'ManagerRoute',
  props: {
    Component: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const { isAuthd, shouldRedirectToOnboarding, multiUserMode } = useIsAuthenticated()

    const shouldShowComponent = computed(() => {
      if (isAuthd.value === null) return null
      if (shouldRedirectToOnboarding.value) return 'onboarding'

      const user = userFromStorage()
      return isAuthd.value && (user?.role !== 'default' || !multiUserMode.value)
    })

    return () => {
      if (shouldShowComponent.value === null) {
        return h(FullScreenLoader)
      }

      if (shouldShowComponent.value === 'onboarding') {
        router.push(paths.onboarding.home())
        return null
      }

      if (!shouldShowComponent.value) {
        router.push(paths.home())
        return null
      }

      return h(KeyboardShortcutWrapper, {}, () =>
        h(UserMenu, {}, () => h(props.Component))
      )
    }
  }
})

// PrivateRoute Component (default export)
export default defineComponent({
  name: 'PrivateRoute',
  props: {
    Component: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const { isAuthd, shouldRedirectToOnboarding } = useIsAuthenticated()

    const shouldShowComponent = computed(() => {
      if (isAuthd.value === null) return null
      if (shouldRedirectToOnboarding.value) return 'onboarding'
      return isAuthd.value
    })

    return () => {
      if (shouldShowComponent.value === null) {
        return h(FullScreenLoader)
      }

      if (shouldShowComponent.value === 'onboarding') {
        router.push('/onboarding')
        return null
      }

      if (!shouldShowComponent.value) {
        router.push(paths.login(true))
        return null
      }

      return h(KeyboardShortcutWrapper, {}, () =>
        h(UserMenu, {}, () => h(props.Component))
      )
    }
  }
})
</script>

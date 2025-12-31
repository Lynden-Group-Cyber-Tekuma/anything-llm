import { ref, onMounted } from "vue";
import System from "@/models/system";

/**
 * Checks if Simple SSO is enabled and if the user should be redirected to the SSO login page.
 * @returns {{loading: Ref<boolean>, ssoConfig: Ref<{enabled: boolean, noLogin: boolean, noLoginRedirect: string | null}>}}
 */
export default function useSimpleSSO() {
  const loading = ref(true);
  const ssoConfig = ref({
    enabled: false,
    noLogin: false,
    noLoginRedirect: null,
  });

  onMounted(async () => {
    try {
      const settings = await System.keys();
      ssoConfig.value = {
        enabled: settings?.SimpleSSOEnabled,
        noLogin: settings?.SimpleSSONoLogin,
        noLoginRedirect: settings?.SimpleSSONoLoginRedirect,
      };
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  });

  return { loading, ssoConfig };
}

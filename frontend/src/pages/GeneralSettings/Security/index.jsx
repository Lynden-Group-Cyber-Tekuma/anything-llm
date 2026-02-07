import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import { useTranslation } from "react-i18next";

export default function GeneralSecurity() {
  const { t } = useTranslation();
  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
      >
        <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:pt-6">
          <p className="text-lg leading-6 font-bold text-theme-text-primary md-6 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10 py-4">
            {t("security.title")}
          </p>
        </div>
        <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] mt-6">
          <p className="text-sm text-white text-opacity-60">
            Multi-user mode is enabled. User management is available in the
            Admin settings.
          </p>
        </div>
      </div>
    </div>
  );
}

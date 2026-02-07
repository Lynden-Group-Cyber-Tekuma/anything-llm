import { useEffect } from "react";

const availableThemes = {
  default: "Default",
};

/**
 * Returns the application theme (always dark/default)
 * @returns {{theme: 'default', setTheme: function, availableThemes: object}} The current theme, a no-op setTheme function, and available themes
 */
export function useTheme() {
  const theme = "default";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "default");
  }, []);

  // No-op function for backward compatibility
  function setTheme() {}

  return { theme, setTheme, availableThemes };
}

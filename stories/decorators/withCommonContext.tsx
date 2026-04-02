import * as Common from "@frontend/common";
import { theme2025, theme2026 } from "@frontend/theme";
import type { PyConKRThemeConfig } from "@frontend/theme";
import type { Decorator } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";

const themes: Record<string, PyConKRThemeConfig> = {
  "PyCon KR 2025": theme2025,
  "PyCon KR 2026": theme2026,
};

export const withCommonContext: Decorator = (Story, context) => {
  const themeName = context.globals.theme || "PyCon KR 2025";
  const themeConfig = themes[themeName] ?? theme2025;

  const commonOptions: Common.Contexts.ContextOptions = {
    language: "ko",
    baseUrl: ".",
    backendApiDomain: "",
    backendApiTimeout: 10000,
    eventConfig: themeConfig.event,
  };

  return (
    <MemoryRouter>
      <Common.Components.CommonContextProvider options={commonOptions}>
        <Story />
      </Common.Components.CommonContextProvider>
    </MemoryRouter>
  );
};

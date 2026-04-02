import { Global } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import type { Preview } from "@storybook/react-vite";
import * as React from "react";

import { theme2025, theme2026 } from "@frontend/theme";
import type { PyConKRThemeConfig } from "@frontend/theme";

const themes: Record<string, PyConKRThemeConfig> = {
  "PyCon KR 2025": theme2025,
  "PyCon KR 2026": theme2026,
};

const preview: Preview = {
  tags: ["autodocs"],
  globalTypes: {
    theme: {
      description: "PyConKR Theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: Object.keys(themes),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "PyCon KR 2025",
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const themeName = context.globals.theme || "PyCon KR 2025";
      const themeConfig = themes[themeName] ?? theme2025;
      const muiTheme = React.useMemo(
        () => createTheme(themeConfig.muiTheme),
        [themeConfig]
      );

      return (
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <Global styles={themeConfig.globalStyles} />
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;

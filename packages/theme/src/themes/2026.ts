import { baseGlobalStyles, PRETENDARD_FONT_FAMILY } from "../global-styles";
import type { PyConKRThemeConfig } from "../types";

export const theme2026: PyConKRThemeConfig = {
  event: {
    year: 2026,
    eventName: "PyCon Korea 2026",
    eventDates: "",
    venue: {
      ko: "",
      en: "",
    },
    assets: {
      logo: "",
    },
  },
  muiTheme: {
    typography: {
      fontFamily: PRETENDARD_FONT_FAMILY,
    },
    palette: {
      primary: {
        main: "#7C3AED",
        light: "#C4B5FD",
        dark: "#4C1D95",
      },
      secondary: {
        main: "#7C3AED",
        light: "#C4B5FD",
        dark: "#4C1D95",
      },
      highlight: {
        main: "#EC4899",
        light: "#F9A8D4",
        dark: "#BE185D",
        contrastText: "#FFFFFF",
      },
      mobileHeader: {
        main: {
          background: "rgba(124, 58, 237, 0.1)",
          text: "#FFFFFF",
          activeLanguage: "#888888",
        },
        sub: {
          background: "#C4B5FD",
          text: "rgba(76, 29, 149, 0.6)",
          activeLanguage: "#4C1D95",
        },
      },
      mobileNavigation: {
        main: {
          background:
            "linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15))",
          text: "#FFFFFF",
          chip: {
            background: "rgba(196, 181, 253, 0.5)",
            hover: "rgba(196, 181, 253, 0.7)",
          },
          divider: "rgba(255, 255, 255, 0.3)",
          languageToggle: {
            background: "transparent",
            active: {
              background: "rgba(255, 255, 255, 0.7)",
              hover: "rgba(255, 255, 255, 0.8)",
            },
            inactive: {
              hover: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
        sub: {
          background: "#C4B5FD",
          text: "rgba(76, 29, 149, 0.9)",
          chip: {
            background: "rgba(76, 29, 149, 0.2)",
            hover: "rgba(76, 29, 149, 0.3)",
          },
          divider: "rgba(76, 29, 149, 0.3)",
          languageToggle: {
            background: "rgba(255, 255, 255, 0.1)",
            active: {
              background: "rgba(255, 255, 255, 0.9)",
              hover: "rgba(255, 255, 255, 1)",
            },
            inactive: {
              hover: "rgba(255, 255, 255, 0.3)",
            },
          },
        },
      },
      text: {
        primary: "#000000",
        secondary: "#666666",
        disabled: "#999999",
      },
      background: {
        default: "#FFFFFF",
        paper: "#FFFFFF",
      },
      common: {
        black: "#000000",
        white: "#FFFFFF",
      },
      error: {
        main: "#d32f2f",
        light: "#ef5350",
        dark: "#c62828",
      },
      warning: {
        main: "#ed6c02",
        light: "#ff9800",
        dark: "#e65100",
      },
      info: {
        main: "#0288d1",
        light: "#03a9f4",
        dark: "#01579b",
      },
      success: {
        main: "#2e7d32",
        light: "#4caf50",
        dark: "#1b5e20",
      },
    },
  },
  globalStyles: baseGlobalStyles,
};

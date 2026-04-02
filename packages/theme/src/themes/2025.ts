import { baseGlobalStyles, PRETENDARD_FONT_FAMILY } from "../global-styles";
import type { PyConKRThemeConfig } from "../types";

export const theme2025: PyConKRThemeConfig = {
  event: {
    year: 2025,
    eventName: "PyCon Korea 2025",
    eventDates: "AUG 15 - 17",
    venue: {
      ko: "서울특별시 중구 필동로 1길 30 동국대학교 신공학관",
      en: "New Engineering Building, Dongguk University\nPildong-ro 1-gil, Jung-gu, Seoul, Republic of Korea",
    },
    assets: {
      logo: "",
      mobileCoverImage: "",
      mobileCoverTitle: "",
      hostLogoBig: "",
      hostLogoSmall: "",
    },
  },
  muiTheme: {
    typography: {
      fontFamily: PRETENDARD_FONT_FAMILY,
    },
    palette: {
      primary: {
        main: "#259299",
        light: "#B6D8D7",
        dark: "#126D7F",
        nonFocus: "#7AB2B3",
      },
      secondary: {
        main: "#259299",
        light: "#B6D8D7",
        dark: "#126D7F",
      },
      highlight: {
        main: "#E17101",
        light: "#EE8D74",
        dark: "#C66900",
        contrastText: "#FFFFFF",
      },
      mobileHeader: {
        main: {
          background: "rgba(182, 216, 215, 0.1)",
          text: "#FFFFFF",
          activeLanguage: "#888888",
        },
        sub: {
          background: "#B6D8D7",
          text: "rgba(18, 109, 127, 0.6)",
          activeLanguage: "#126D7F",
        },
      },
      mobileNavigation: {
        main: {
          background:
            "linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15))",
          text: "#FFFFFF",
          chip: {
            background: "rgba(212, 212, 212, 0.5)",
            hover: "rgba(212, 212, 212, 0.7)",
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
          background: "#B6D8D7",
          text: "rgba(18, 109, 127, 0.9)",
          chip: {
            background: "rgba(18, 109, 127, 0.2)",
            hover: "rgba(18, 109, 127, 0.3)",
          },
          divider: "rgba(18, 109, 127, 0.3)",
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

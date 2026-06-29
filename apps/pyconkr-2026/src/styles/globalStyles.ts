import { css } from "@emotion/react";
import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  typography: {
    fontFamily:
      'exqtEnglish, exqtNumber, exqt, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#ed5ebd",
      light: "#f5a0dc",
      dark: "#c93da0",
      nonFocus: "#c97baa",
    },
    secondary: {
      main: "#ed5ebd",
      light: "#f5a0dc",
      dark: "#c93da0",
    },
    highlight: {
      main: "#f5c73d",
      light: "#f9d86d",
      dark: "#d4a818",
      contrastText: "#12091e",
    },
    mobileHeader: {
      main: {
        background: "rgba(237, 94, 189, 0.1)",
        text: "#ededde",
        activeLanguage: "#888880",
      },
      sub: {
        background: "#1e1230",
        text: "rgba(237, 94, 189, 0.6)",
        activeLanguage: "#ed5ebd",
      },
    },
    mobileNavigation: {
      main: {
        background:
          "linear-gradient(0deg, rgba(18, 9, 30, 0.85), rgba(18, 9, 30, 0.85)), linear-gradient(0deg, rgba(237, 94, 189, 0.08), rgba(237, 94, 189, 0.08))",
        text: "#ededde",
        chip: {
          background: "rgba(237, 94, 189, 0.15)",
          hover: "rgba(237, 94, 189, 0.25)",
        },
        divider: "rgba(237, 94, 189, 0.2)",
        languageToggle: {
          background: "transparent",
          active: {
            background: "rgba(237, 94, 189, 0.3)",
            hover: "rgba(237, 94, 189, 0.4)",
          },
          inactive: {
            hover: "rgba(237, 94, 189, 0.1)",
          },
        },
      },
      sub: {
        background: "#1e1230",
        text: "rgba(237, 94, 189, 0.9)",
        chip: {
          background: "rgba(237, 94, 189, 0.15)",
          hover: "rgba(237, 94, 189, 0.25)",
        },
        divider: "rgba(237, 94, 189, 0.2)",
        languageToggle: {
          background: "rgba(237, 94, 189, 0.05)",
          active: {
            background: "rgba(237, 94, 189, 0.3)",
            hover: "rgba(237, 94, 189, 0.4)",
          },
          inactive: {
            hover: "rgba(237, 94, 189, 0.1)",
          },
        },
      },
    },
    text: {
      primary: "#ededde",
      secondary: "#b8b8a8",
      disabled: "#888880",
    },
    background: {
      default: "#12091e",
      paper: "#1e1230",
    },
    common: {
      black: "#000000",
      white: "#ffffff",
    },
    error: {
      main: "#f44336",
      light: "#e57373",
      dark: "#d32f2f",
    },
    warning: {
      main: "#f5c73d",
      light: "#f9d86d",
      dark: "#d4a818",
    },
    info: {
      main: "#29b6f6",
      light: "#4fc3f7",
      dark: "#0288d1",
    },
    success: {
      main: "#66bb6a",
      light: "#81c784",
      dark: "#388e3c",
    },
  },
});

export const globalStyles = css`
  @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");

  html,
  body {
    font-family:
      "exqtEnglish",
      "exqtNumber",
      "exqt",
      "Pretendard",
      -apple-system,
      BlinkMacSystemFont,
      system-ui,
      Roboto,
      "Helvetica Neue",
      "Segoe UI",
      "Apple SD Gothic Neo",
      "Noto Sans KR",
      "Malgun Gothic",
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-touch-callout: none;

    overscroll-behavior: none;
    word-break: keep-all;
    overflow-wrap: break-all;

    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;

    font-variant-numeric: tabular-nums;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  @media (min-width: 900px) {
    /* mui가 md를 900px로 보는 중 */
    html,
    body {
      font-size: 120%;
    }
  }
`;

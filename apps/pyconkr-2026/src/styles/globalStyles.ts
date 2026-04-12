import { css } from "@emotion/react";
import { createTheme } from "@mui/material/styles";

// 2026 다크 테마 — 티저 페이지 디자인 시스템 기반
//
// 티저 CSS 변수 → MUI 팔레트 매핑:
//   --background: hsl(270, 50%,  8%) → background.default: #12091e  (어두운 남보라)
//   --card:       hsl(270, 40%, 14%) → background.paper:   #1e1230  (어두운 보라)
//   --primary:    hsl(320, 80%, 65%) → primary.main:       #ed5ebd  (네온 핑크)
//   --accent:     hsl( 45, 90%, 60%) → highlight.main:     #f5c73d  (황금 노랑)
//   --foreground: hsl( 60, 30%, 90%) → text.primary:       #ededde  (아이보리)
//   --muted-fg:   hsl(270, 20%, 60%) → text.secondary:     #9985ad  (뮤트 보라)
//
// 픽셀 테두리: .pixel-border — 4방향 box-shadow로 pixel art border 효과
// 글로우 효과: .animate-glow — 핑크 네온 glow-pulse 3s infinite

export const muiTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ed5ebd",
      light: "#f28cd0",
      dark: "#c040a0",
      contrastText: "#12091e",
      nonFocus: "#c68fc8",
    },
    secondary: {
      main: "#7b4dcc",
      light: "#a47de0",
      dark: "#5530a0",
    },
    highlight: {
      main: "#f5c73d",
      light: "#f8d870",
      dark: "#d4a800",
      contrastText: "#12091e",
    },
    mobileHeader: {
      main: {
        background: "rgba(18, 9, 30, 0.92)",
        text: "#ededde",
        activeLanguage: "#9985ad",
      },
      sub: {
        background: "#1e1230",
        text: "rgba(237, 94, 189, 0.8)",
        activeLanguage: "#ed5ebd",
      },
    },
    mobileNavigation: {
      main: {
        background: "rgba(30, 18, 48, 0.97)",
        text: "#ededde",
        chip: {
          background: "rgba(123, 77, 204, 0.25)",
          hover: "rgba(123, 77, 204, 0.4)",
        },
        divider: "rgba(237, 94, 189, 0.2)",
        languageToggle: {
          background: "transparent",
          active: {
            background: "rgba(237, 94, 189, 0.2)",
            hover: "rgba(237, 94, 189, 0.3)",
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
          background: "rgba(237, 94, 189, 0.12)",
          hover: "rgba(237, 94, 189, 0.22)",
        },
        divider: "rgba(237, 94, 189, 0.2)",
        languageToggle: {
          background: "rgba(237, 94, 189, 0.08)",
          active: {
            background: "rgba(237, 94, 189, 0.2)",
            hover: "rgba(237, 94, 189, 0.3)",
          },
          inactive: {
            hover: "rgba(237, 94, 189, 0.08)",
          },
        },
      },
    },
    text: {
      primary: "#ededde",
      secondary: "#9985ad",
      disabled: "#5c4d75",
    },
    background: {
      default: "#12091e",
      paper: "#1e1230",
    },
    common: {
      black: "#000000",
      white: "#ffffff",
    },
    divider: "rgba(237, 94, 189, 0.18)",
    error: {
      main: "#f44336",
      light: "#e57373",
      dark: "#d32f2f",
    },
    warning: {
      main: "#f5c73d",
      light: "#f8d870",
      dark: "#d4a800",
    },
    info: {
      main: "#7b4dcc",
      light: "#a47de0",
      dark: "#5530a0",
    },
    success: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c",
    },
  },
  typography: {
    fontFamily:
      'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
  },
});

export const globalStyles = css`
  @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");

  html,
  body {
    font-family:
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

    background-color: #12091e;
    color: #ededde;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* ── 티저 디자인 시스템 ── */

  /* 픽셀 테두리: 4방향 box-shadow로 pixel art border 효과 */
  .pixel-border {
    box-shadow: 4px 0 #ed5ebd, -4px 0 #ed5ebd, 0 4px #ed5ebd, 0 -4px #ed5ebd;
  }

  /* 황금 픽셀 테두리 (highlight accent 사용처) */
  .pixel-border-gold {
    box-shadow: 4px 0 #f5c73d, -4px 0 #f5c73d, 0 4px #f5c73d, 0 -4px #f5c73d;
  }

  /* 핑크 네온 글로우 텍스트 애니메이션 */
  @keyframes glow-pulse {
    0%,
    100% {
      text-shadow:
        0 0 10px rgba(237, 94, 189, 0.5),
        0 0 20px rgba(237, 94, 189, 0.3);
    }
    50% {
      text-shadow:
        0 0 20px rgba(237, 94, 189, 0.8),
        0 0 40px rgba(237, 94, 189, 0.5),
        0 0 60px rgba(237, 94, 189, 0.2);
    }
  }

  .animate-glow {
    animation: glow-pulse 3s ease-in-out infinite;
  }
`;

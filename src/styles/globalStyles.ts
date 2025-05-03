import { css } from "@emotion/react";
import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  typography: {
    fontFamily:
      'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
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
});

export const globalStyles = css`
  @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

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
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
  }

  ul,
  ol {
    list-style: none;
  }
`;

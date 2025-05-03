import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
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

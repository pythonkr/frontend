import { Stack, styled } from "@mui/material";

export const Page = styled(Stack)(({ theme }) => ({
  height: "100%",
  width: "100%",
  maxWidth: "1200px",

  flexGrow: 1,

  justifyContent: "flex-start",
  alignItems: "center",

  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),

  paddingRight: theme.spacing(16),
  paddingLeft: theme.spacing(16),

  [theme.breakpoints.down("lg")]: {
    padding: theme.spacing(2, 4),
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
  },
}));

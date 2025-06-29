import { styled, Typography } from "@mui/material";

export const PrimaryTitle = styled(Typography)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),

  textAlign: "start",
  fontWeight: 700,

  [theme.breakpoints.down("sm")]: {
    textAlign: "center",
    fontSize: "2rem",
  },
}));

export const SecondaryTitle = styled(Typography)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(1),

  textAlign: "start",
  fontWeight: 600,

  [theme.breakpoints.down("sm")]: {
    textAlign: "center",
    fontSize: "1.5rem",
  },
}));

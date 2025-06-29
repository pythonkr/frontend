import { styled } from "@mui/material";

export const BlockQuote = styled("blockquote")(({ theme }) => ({
  margin: 0,
  paddingLeft: theme.spacing(1.5),
  borderLeft: `4px solid ${theme.palette.grey[700]}`,
  color: theme.palette.text.secondary,
}));

import { SocialSignInPanel } from "@frontend/common/components";
import { Stack, Typography } from "@mui/material";
import { FC } from "react";

export const SignInPage: FC = () => (
  <Stack sx={{ flexGrow: 1, width: "100%" }} alignItems="center" justifyContent="center" spacing={2}>
    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
      로그인
    </Typography>
    <SocialSignInPanel dev={import.meta.env.DEV} />
  </Stack>
);

import { SocialSignInPanel } from "@frontend/common/components";
import { useEmail } from "@frontend/common/hooks/useEmail";
import { Stack, Typography } from "@mui/material";
import { FC } from "react";

import { Page } from "@apps/pyconkr-participant-portal/components/page";
import { useAppContext } from "@apps/pyconkr-participant-portal/contexts/app_context";

export const SignInPage: FC = () => {
  const { sendEmail } = useEmail();
  const { language } = useAppContext();

  const signInStr = language === "ko" ? "로그인" : "Sign In";
  const contactToTeamStr =
    language === "ko" ? (
      <>
        계정 관련 문의는&nbsp;
        <a href="#" onClick={sendEmail}>
          파이콘 준비 위원회 (pyconkr@pycon.kr)
        </a>
        로 부탁드립니다.
      </>
    ) : (
      <>
        For account-related inquiries,
        <br />
        please contact the&nbsp;
        <a href="#" onClick={sendEmail}>
          PyCon Korea Organizing Committee (pyconkr@pycon.kr)
        </a>
      </>
    );

  return (
    <Page>
      <Stack spacing={4} style={{ width: "100%", flexGrow: 1 }} alignItems="center" justifyContent="center">
        <Typography variant="h4" component="h1" gutterBottom children={signInStr} />
        <SocialSignInPanel dev={import.meta.env.DEV} maxWidth="480px" />
        <Typography variant="body2" color="textSecondary" style={{ marginTop: "1rem" }} children={contactToTeamStr} />
      </Stack>
    </Page>
  );
};

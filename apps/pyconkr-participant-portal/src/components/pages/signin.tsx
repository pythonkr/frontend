import * as Common from "@frontend/common";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { enqueueSnackbar, OptionsObject } from "notistack";
import * as React from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAppContext } from "../../contexts/app_context";
import { Page } from "../page";

export const SignInPage: React.FC = () => {
  const formRef = React.useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const { sendEmail } = Common.Hooks.Common.useEmail();
  const { language } = useAppContext();
  const participantPortalClient = Common.Hooks.BackendParticipantPortalAPI.useParticipantPortalClient();
  const { data } = Common.Hooks.BackendParticipantPortalAPI.useSignedInUserQuery(participantPortalClient);
  if (data) return <Navigate to="/" replace />;

  const addSnackbar = (c: string | React.ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const signInStr = language === "ko" ? "로그인" : "Sign In";
  const emailStr = language === "ko" ? "이메일" : "Email";
  const passwordStr = language === "ko" ? "비밀번호" : "Password";
  const signInSucceedStr = language === "ko" ? "로그인에 성공했습니다!" : "Sign in succeeded!";
  const signInFailedStr = language === "ko" ? "로그인에 실패했습니다." : "Sign in failed.";
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

  const signInMutation = Common.Hooks.BackendParticipantPortalAPI.useSignInMutation(participantPortalClient);
  const signIn = () => {
    if (!Common.Utils.isFormValid(formRef.current)) return;

    const formData = Common.Utils.getFormValue<{ identity: string; password: string }>({ form: formRef.current });
    signInMutation.mutate(formData, {
      onSuccess: () => {
        addSnackbar(signInSucceedStr, "success");
        navigate("/");
      },
      onError: (error) => {
        console.error("Sign in failed:", error);

        let errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        if (error instanceof Common.BackendAPIs.BackendAPIClientError) errorMessage = error.message;

        addSnackbar(
          <>
            {signInFailedStr}
            <br />
            {errorMessage}
          </>,
          "error"
        );
      },
    });
  };
  const disabled = signInMutation.isPending;

  return (
    <Page>
      <Stack spacing={4} style={{ width: "100%", flexGrow: 1 }} alignItems="center" justifyContent="center">
        <Typography variant="h4" component="h1" gutterBottom children={signInStr} />
        <form style={{ width: "100%", maxWidth: "480px" }} ref={formRef}>
          <Stack spacing={2}>
            <TextField disabled={disabled} label={emailStr} type="email" name="identity" fullWidth />
            <TextField disabled={disabled} label={passwordStr} type="password" name="password" fullWidth />
          </Stack>
        </form>
        <Button variant="contained" children={signInStr} disabled={disabled} sx={{ width: "100%", maxWidth: "480px" }} onClick={signIn} />
        <Typography variant="body2" color="textSecondary" style={{ marginTop: "1rem" }} children={contactToTeamStr} />
      </Stack>
    </Page>
  );
};

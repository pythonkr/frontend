import { Login } from "@mui/icons-material";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { FC, FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";
import { me } from "@frontend/common/apis/admin_api";
import { useBackendAdminClient, useSignInMutation } from "@frontend/common/hooks/useAdminAPI";
import { getFormValue } from "@frontend/common/utils";

type PageStateType = {
  userJustSignedIn: boolean;
};

export const SignInPage: FC = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [pageState, setPageState] = useState<PageStateType>({ userJustSignedIn: false });
  const setUserJustSignedIn = () => setPageState((ps) => ({ ...ps, userJustSignedIn: true }));

  const backendAdminAPIClient = useBackendAdminClient();
  const signInMutation = useSignInMutation(backendAdminAPIClient);

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formRef.current) return;

    const formData = getFormValue<{
      identity: string;
      password: string;
    }>({ form: formRef.current });
    signInMutation.mutate(formData, {
      onSuccess: (data) => {
        setUserJustSignedIn();
        addSnackbar(`안녕하세요, ${data.username}님!`, "success");
        navigate("/");
      },
      onError: addErrorSnackbar,
    });
  };

  useEffect(() => {
    (async () => {
      if (pageState.userJustSignedIn) return;

      const userInfo = await me(backendAdminAPIClient)();
      if (userInfo) {
        addSnackbar(`이미 ${userInfo.username}님으로 로그인되어 있습니다!`, "success");
        navigate("/");
      }
    })();
  }, [backendAdminAPIClient, navigate, pageState.userJustSignedIn]);

  return (
    <Stack sx={{ width: "100%", height: "100%", flexGrow: 1 }}>
      <form ref={formRef} onSubmit={handleSignIn}>
        <Stack direction="column" spacing={2}>
          <Typography variant="h5">로그인</Typography>
          <TextField label="Email or Username" name="identity" required disabled={signInMutation.isPending} />
          <TextField label="Password" name="password" type="password" required disabled={signInMutation.isPending} />
          <Button type="submit" variant="contained" disabled={signInMutation.isPending} startIcon={<Login />}>
            로그인
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

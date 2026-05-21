import { Logout } from "@mui/icons-material";
import { Button, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { FC, FormEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";
import { me } from "@frontend/common/apis/admin_api";
import { useBackendAdminClient, useChangePasswordMutation, useSignOutMutation } from "@frontend/common/hooks/useAdminAPI";
import { getFormValue, isFormValid } from "@frontend/common/utils";

type ChangePasswordFormType = {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
};

export const AccountManagementPage: FC = () => {
  const changePasswordFormRef = useRef<HTMLFormElement>(null);
  const [pageState, setPageState] = useState<{ tab: number }>({ tab: 0 });
  const navigate = useNavigate();
  const backendAdminAPIClient = useBackendAdminClient();
  const signOutMutation = useSignOutMutation(backendAdminAPIClient);
  const changePasswordMutation = useChangePasswordMutation(backendAdminAPIClient);

  const setTab = (_: SyntheticEvent, tab: number) => setPageState((ps) => ({ ...ps, tab }));

  const handleSignOut = () => {
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        addSnackbar("로그아웃 되었습니다.", "success");
        navigate("/");
      },
      onError: addErrorSnackbar,
    });
  };

  const handleChangePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const form = changePasswordFormRef.current;
    if (!isFormValid(form)) {
      addSnackbar("폼에 오류가 있습니다. 다시 확인해주세요.", "error");
      return;
    }

    const formData = getFormValue<ChangePasswordFormType>({ form });
    if (formData.new_password !== formData.new_password_confirm) {
      addSnackbar("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.", "error");
      return;
    }

    changePasswordMutation.mutate(formData, {
      onSuccess: () => {
        addSnackbar("비밀번호가 변경되었습니다.", "success");
        navigate("/");
      },
      onError: addErrorSnackbar,
    });
  };

  useEffect(() => {
    (async () => {
      const userInfo = await me(backendAdminAPIClient)();
      if (!userInfo) {
        addSnackbar("로그아웃 상태입니다!", "error");
        navigate("/");
      }
    })();
  }, [backendAdminAPIClient, navigate]);

  const disabled = signOutMutation.isPending || changePasswordMutation.isPending;

  return (
    <Stack
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        maxHeight: "100%",
        flexGrow: 1,
      }}
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >
      <Tabs value={pageState.tab} onChange={setTab}>
        <Tab wrapped label="비밀번호 변경" />
        <Tab wrapped label="로그아웃" />
      </Tabs>

      {pageState.tab === 0 && (
        <Stack sx={{ width: "100%", maxWidth: "600px", textAlign: "center" }}>
          <Typography variant="h5">비밀번호 변경</Typography>
          <br />
          <form ref={changePasswordFormRef} onSubmit={handleChangePassword}>
            <Stack spacing={2}>
              <TextField disabled={disabled} name="old_password" type="password" label="현재 비밀번호" required fullWidth />
              <TextField disabled={disabled} name="new_password" type="password" label="새 비밀번호" required fullWidth />
              <TextField disabled={disabled} name="new_password_confirm" type="password" label="새 비밀번호 확인" required fullWidth />
              <Button type="submit" variant="contained" disabled={disabled} fullWidth>
                비밀번호 변경
              </Button>
            </Stack>
          </form>
        </Stack>
      )}
      {pageState.tab === 1 && (
        <>
          <Typography variant="h5">정말 로그아웃하시겠습니까?</Typography>
          <br />
          <Button variant="contained" onClick={handleSignOut} disabled={signOutMutation.isPending} startIcon={<Logout />}>
            로그아웃
          </Button>
        </>
      )}
    </Stack>
  );
};

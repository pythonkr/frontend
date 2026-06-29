import { getFormValue, isFormValid } from "@frontend/common/utils";
import { Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, FormEvent, useRef } from "react";

import { useShopClient, useSignInWithEmailMutation, useSignInWithSNSMutation, useSignOutMutation, useUserStatus } from "@frontend/shop/hooks";

/**
 * 현재 로그인 상태를 보여주고 로그인/로그아웃을 처리하는 컴포넌트.
 * 로그인 상태면 사용자명과 로그아웃 버튼을, 비로그인 상태면 이메일·비밀번호 폼과 구글 로그인 버튼을 보여준다.
 * @example <Shop__Feature__UserInfo />
 */
export const UserInfo: FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const shopAPIClient = useShopClient();
  const signInWithEmailMutation = useSignInWithEmailMutation(shopAPIClient);
  const SignInWithSNSMutation = useSignInWithSNSMutation(shopAPIClient);
  const signOutMutation = useSignOutMutation(shopAPIClient);

  const signInWithGoogle = () =>
    SignInWithSNSMutation.mutate({
      provider: "google",
      callback_url: window.location.href,
    });
  const signInWithEmail = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isFormValid(formRef.current)) return;
    signInWithEmailMutation.mutate(
      getFormValue<{ email: string; password: string }>({
        form: formRef.current,
      })
    );
  };

  const disabled = SignInWithSNSMutation.isPending || signInWithEmailMutation.isPending || signOutMutation.isPending;

  const WrappedUserStatus: FC = () => {
    const shopAPIClient = useShopClient();
    const { data } = useUserStatus(shopAPIClient);

    return data && data.meta.is_authenticated === true ? (
      <Stack>
        <Typography variant="body1">User: {data.data.user.username}</Typography>
        <Button variant="contained" color="primary" onClick={() => signOutMutation.mutate()} disabled={disabled}>
          Sign Out
        </Button>
      </Stack>
    ) : (
      <Stack>
        <form onSubmit={signInWithEmail} ref={formRef} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <TextField type="email" id="email" name="email" label="Email" variant="outlined" required disabled={disabled} />
          <TextField type="password" id="password" name="password" label="Password" variant="outlined" required disabled={disabled} />
          <Button type="submit" disabled={disabled}>
            Sign In
          </Button>
        </form>
        <Button variant="contained" color="primary" onClick={signInWithGoogle} disabled={disabled}>
          Sign In with Google
        </Button>
      </Stack>
    );
  };

  return (
    <ErrorBoundary fallback={<div>로그인 정보를 불러오는 중 문제가 발생했습니다.</div>}>
      <Suspense fallback={<CircularProgress />}>
        <WrappedUserStatus />
      </Suspense>
    </ErrorBoundary>
  );
};

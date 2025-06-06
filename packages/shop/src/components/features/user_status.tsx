import * as Common from "@frontend/common";
import { Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import * as React from "react";

import ShopHooks from "../../hooks";

export const UserInfo: React.FC = () => {
  const formRef = React.useRef<HTMLFormElement>(null);
  const shopAPIClient = ShopHooks.useShopClient();
  const signInWithEmailMutation = ShopHooks.useSignInWithEmailMutation(shopAPIClient);
  const SignInWithSNSMutation = ShopHooks.useSignInWithSNSMutation(shopAPIClient);
  const signOutMutation = ShopHooks.useSignOutMutation(shopAPIClient);

  const signInWithGoogle = () =>
    SignInWithSNSMutation.mutate({
      provider: "google",
      callback_url: window.location.href,
    });
  const signInWithEmail = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!Common.Utils.isFormValid(formRef.current)) return;
    signInWithEmailMutation.mutate(
      Common.Utils.getFormValue<{ email: string; password: string }>({
        form: formRef.current,
      })
    );
  };
  const signInWithNaver = () =>
    SignInWithSNSMutation.mutate({
      provider: "naver",
      callback_url: window.location.href,
    });
  const signInWithKakao = () =>
    SignInWithSNSMutation.mutate({
      provider: "kakao",
      callback_url: window.location.href,
    });

  const disabled = SignInWithSNSMutation.isPending || signInWithEmailMutation.isPending || signOutMutation.isPending;

  const WrappedUserStatus: React.FC = () => {
    const shopAPIClient = ShopHooks.useShopClient();
    const { data } = ShopHooks.useUserStatus(shopAPIClient);

    return data && data.meta.is_authenticated === true ? (
      <Stack>
        <Typography variant="body1">User: {data.data.user.username}</Typography>
        <Button variant="contained" color="primary" onClick={() => signOutMutation.mutate()} disabled={disabled}>
          Sign Out
        </Button>
      </Stack>
    ) : (
      <Stack>
        <form
          onSubmit={signInWithEmail}
          ref={formRef}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <TextField
            type="email"
            id="email"
            name="email"
            label="Email"
            variant="outlined"
            required
            disabled={disabled}
          />
          <TextField
            type="password"
            id="password"
            name="password"
            label="Password"
            variant="outlined"
            required
            disabled={disabled}
          />
          <Button type="submit" disabled={disabled}>
            Sign In
          </Button>
        </form>
        <Button variant="contained" color="primary" onClick={signInWithGoogle} disabled={disabled}>
          Sign In with Google
        </Button>
        <Button variant="contained" color="primary" onClick={signInWithNaver} disabled={disabled}>
          Sign In with Naver
        </Button>
        <Button variant="contained" color="primary" onClick={signInWithKakao} disabled={disabled}>
          Sign In with Kakao
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

import { Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, FormEvent, RefObject, useRef } from "react";

import { getFormValue, isFormValid } from "@frontend/common/utils";
import { useShopClient, useSignInWithEmailMutation, useSignInWithSNSMutation, useSignOutMutation, useUserStatus } from "@frontend/shop/hooks";

type WrappedUserStatusProps = {
  formRef: RefObject<HTMLFormElement | null>;
  disabled: boolean;
  onSignInWithEmail: (e: FormEvent) => void;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
};

const WrappedUserStatus: FC<WrappedUserStatusProps> = ({ formRef, disabled, onSignInWithEmail, onSignInWithGoogle, onSignOut }) => {
  const shopAPIClient = useShopClient();
  const { data } = useUserStatus(shopAPIClient);

  return data && data.meta.is_authenticated === true ? (
    <Stack>
      <Typography variant="body1">User: {data.data.user.username}</Typography>
      <Button variant="contained" color="primary" onClick={onSignOut} disabled={disabled}>
        Sign Out
      </Button>
    </Stack>
  ) : (
    <Stack>
      <form onSubmit={onSignInWithEmail} ref={formRef} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <TextField type="email" id="email" name="email" label="Email" variant="outlined" required disabled={disabled} />
        <TextField type="password" id="password" name="password" label="Password" variant="outlined" required disabled={disabled} />
        <Button type="submit" disabled={disabled}>
          Sign In
        </Button>
      </form>
      <Button variant="contained" color="primary" onClick={onSignInWithGoogle} disabled={disabled}>
        Sign In with Google
      </Button>
    </Stack>
  );
};

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

  return (
    <ErrorBoundary fallback={<div>로그인 정보를 불러오는 중 문제가 발생했습니다.</div>}>
      <Suspense fallback={<CircularProgress />}>
        <WrappedUserStatus
          formRef={formRef}
          disabled={disabled}
          onSignInWithEmail={signInWithEmail}
          onSignInWithGoogle={signInWithGoogle}
          onSignOut={() => signOutMutation.mutate()}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

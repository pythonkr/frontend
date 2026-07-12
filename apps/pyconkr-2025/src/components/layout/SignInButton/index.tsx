import { useShopClient, useSignOutMutation, useUserStatus } from "@frontend/shop/hooks";
import { Login, Logout } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { Link as RouterLink } from "react-router-dom";

import { useAppContext } from "@apps/pyconkr-2025/contexts/app_context";

type InnerSignInButtonImplPropType = {
  loading?: boolean;
  signedIn?: boolean;
  onSignOut?: () => void;
  isMobile?: boolean;
  isMainPath?: boolean;
  onClose?: () => void;
};

const InnerSignInButtonImpl: React.FC<InnerSignInButtonImplPropType> = ({
  loading,
  signedIn,
  onSignOut,
  isMobile = false,
  isMainPath = true,
  onClose,
}) => {
  const { language } = useAppContext();

  const signInBtnStr = language === "ko" ? "로그인" : "Sign In";
  const signOutBtnStr = language === "ko" ? "로그아웃" : "Sign Out";

  // 로그인 상태에 따라: 로그아웃은 클릭 액션, 로그인은 Ctrl+클릭(새 탭)이 동작하도록 Link로 이동.
  const navProps = signedIn
    ? { onClick: () => onSignOut?.() }
    : ({ component: RouterLink, to: "/account/sign-in", onClick: () => onClose?.() } as const);

  if (isMobile) {
    return (
      <Button
        {...navProps}
        variant="text"
        sx={{
          color: isMainPath ? "white" : "rgba(18, 109, 127, 0.9)",
          height: 29,
          fontSize: 13,
          fontWeight: 500,
          textTransform: "none",
          minWidth: "auto",
          padding: 0,

          "&:hover": {
            backgroundColor: isMainPath ? "rgba(255, 255, 255, 0.1)" : "rgba(18, 109, 127, 0.1)",
          },
        }}
        loading={loading}
      >
        <Stack direction="row" alignItems="center" sx={{ gap: "3px" }}>
          {signedIn ? <Logout fontSize="small" /> : <Login fontSize="small" />}
          {signedIn ? signOutBtnStr : signInBtnStr}
        </Stack>
      </Button>
    );
  }

  return (
    <Button
      {...navProps}
      variant="text"
      sx={({ palette }) => ({ color: palette.primary.dark })}
      loading={loading}
      children={signedIn ? signOutBtnStr : signInBtnStr}
    />
  );
};

type SignInButtonProps = { isMobile?: boolean; isMainPath?: boolean; onClose?: () => void };

const SignInButtonContent: React.FC<SignInButtonProps> = ({ isMobile, isMainPath, onClose }) => {
  const shopAPIClient = useShopClient();
  const signOutMutation = useSignOutMutation(shopAPIClient);
  const { data } = useUserStatus(shopAPIClient);

  return (
    <InnerSignInButtonImpl
      signedIn={data !== null}
      onSignOut={signOutMutation.mutate}
      isMobile={isMobile}
      isMainPath={isMainPath}
      onClose={onClose}
    />
  );
};

export const SignInButton: React.FC<SignInButtonProps> = ({ isMobile = false, isMainPath = true, onClose }) => (
  <ErrorBoundary fallback={<InnerSignInButtonImpl isMobile={isMobile} isMainPath={isMainPath} onClose={onClose} />}>
    <Suspense fallback={<InnerSignInButtonImpl loading isMobile={isMobile} isMainPath={isMainPath} onClose={onClose} />}>
      <SignInButtonContent isMobile={isMobile} isMainPath={isMainPath} onClose={onClose} />
    </Suspense>
  </ErrorBoundary>
);

import { DevSetCookieButton } from "@frontend/common/components";
import { useBackendContext } from "@frontend/common/hooks/useAPI";
import { useShopClient, useSignInWithSNSMutation, useUserStatus } from "@frontend/shop/hooks";
import { AccountCircleOutlined, Google } from "@mui/icons-material";
import { Alert, Backdrop, Button, ButtonProps, CircularProgress, Stack, Typography, alpha } from "@mui/material";
import { Suspense } from "@suspensive/react";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { FC, ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageLayout } from "@apps/pyconkr-2026/components/layout/PageLayout";
import { PENDING_REDIRECT_KEY } from "@apps/pyconkr-2026/consts/local_stroage";
import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";

type PageeStateType = {
  openBackdrop: boolean;
};

type OAuthErrorType = {
  error: string;
  errorProcess: string | null;
};

/** sessionStorage에 저장된 복귀 URL을 검증해 same-origin 라우터 경로로 변환합니다. (open-redirect 방지) */
const toSafeRedirectPath = (raw: string | null): string | null => {
  if (!raw) return null;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    if (url.pathname === "/account/sign-in") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
};

export const ShopSignInPage: FC = Suspense.with({ fallback: <CircularProgress /> }, () => {
  const { setAppContext, language } = useAppContext();
  const { backendApiAbsoluteDomain, backendApiSessionCookieName } = useBackendContext();
  const [state, setState] = useState<PageeStateType>({ openBackdrop: false });
  const [oauthError, setOauthError] = useState<OAuthErrorType | null>(null);
  const navigate = useNavigate();
  const shopAPIClient = useShopClient();
  const SignInMutation = useSignInWithSNSMutation(shopAPIClient);
  const { data } = useUserStatus(shopAPIClient);

  const shouldOpenBackdrop = SignInMutation.isPending || state.openBackdrop;

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const triggerSignIn = (provider: "google" | "kakao" | "naver") => {
    setOauthError(null);
    setState((ps) => ({ ...ps, openBackdrop: true }));
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(PENDING_REDIRECT_KEY);
    } catch {
      pending = null;
    }
    // 복귀할 위치가 있으면 로그인 페이지로 되돌아와 stash를 소비한다(아래 effect). 없으면 기존처럼 origin으로.
    const callbackUrl = toSafeRedirectPath(pending) ? `${window.location.origin}/account/sign-in` : window.location.origin;
    SignInMutation.mutate({ provider, callback_url: callbackUrl });
  };
  const signInWithGoogle = () => triggerSignIn("google");
  const signInWithKakao = () => triggerSignIn("kakao");
  const signInWithNaver = () => triggerSignIn("naver");

  const signInTitleStr = language === "ko" ? "로그인" : "Sign In";
  const signInWithGoogleStr = language === "ko" ? "구글로 로그인" : "Sign In with Google";
  const signInWithKakaoStr = language === "ko" ? "카카오로 로그인" : "Sign In with Kakao";
  const signInWithNaverStr = language === "ko" ? "네이버로 로그인" : "Sign In with Naver";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (!error) return;
    try {
      // 로그인 시도가 실패했으므로 보류 중이던 복귀 위치를 폐기합니다. (stale redirect 방지)
      sessionStorage.removeItem(PENDING_REDIRECT_KEY);
    } catch {
      // sessionStorage 미지원/차단 시 무시
    }
    setOauthError({ error, errorProcess: params.get("error_process") });
    params.delete("error");
    params.delete("error_process");
    const clean = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", clean);
  }, []);

  useEffect(() => {
    if (data && data.meta.is_authenticated) {
      let pending: string | null = null;
      try {
        pending = sessionStorage.getItem(PENDING_REDIRECT_KEY);
        sessionStorage.removeItem(PENDING_REDIRECT_KEY);
      } catch {
        pending = null;
      }
      const redirectPath = toSafeRedirectPath(pending);
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
        return;
      }
      addSnackbar(
        language === "ko" ? `이미 ${data.data.user.username}님으로 로그인되어 있습니다!` : `You are already signed in as ${data.data.user.username}!`,
        "success"
      );
      navigate("/");
      return;
    }

    setAppContext((prev) => ({
      ...prev,
      title: signInTitleStr,
      shouldShowTitleBanner: true,
      shouldShowSponsorBanner: false,
    }));
  }, [data, language, navigate, setAppContext, signInTitleStr]);

  const commonBtnProps: ButtonProps = {
    variant: "contained",
    fullWidth: true,
    size: "large",
    disabled: SignInMutation.isPending,
  };
  const commonBtnSxProps: ButtonProps["sx"] = {
    textTransform: "none",
  };
  const btnProps: ButtonProps[] = [
    {
      children: signInWithGoogleStr,
      onClick: signInWithGoogle,
      startIcon: <Google />,
      sx: { ...commonBtnSxProps, backgroundColor: "#4285F4", color: "#fff" },
    },
    {
      children: signInWithNaverStr,
      onClick: signInWithNaver,
      startIcon: <AccountCircleOutlined />,
      sx: { ...commonBtnSxProps, backgroundColor: "#03C75A", color: "#fff" },
    },
    {
      children: signInWithKakaoStr,
      onClick: signInWithKakao,
      startIcon: <AccountCircleOutlined />,
      sx: { ...commonBtnSxProps, backgroundColor: "#FEE500", color: "#000" },
    },
  ];

  return (
    <>
      <PageLayout spacing={6}>
        <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bolder" }} children={signInTitleStr} />
        <Stack spacing={1} sx={{ width: "100%", maxWidth: "400px" }}>
          {oauthError && (
            <Alert
              severity="error"
              variant="outlined"
              onClose={() => setOauthError(null)}
              sx={{ backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08) }}
            >
              {language === "ko"
                ? `소셜 로그인이 실패했습니다: ${oauthError.error}${oauthError.errorProcess ? ` (${oauthError.errorProcess})` : ""}`
                : `Social login failed: ${oauthError.error}${oauthError.errorProcess ? ` (${oauthError.errorProcess})` : ""}`}
            </Alert>
          )}
          {import.meta.env.DEV && (
            <DevSetCookieButton
              backendDomain={backendApiAbsoluteDomain ?? ""}
              cookieName={backendApiSessionCookieName ?? ""}
              cookieValue={shopAPIClient.getSessionId() ?? ""}
            >
              [localhost] 세션 쿠키 동기화 (로그인 전 클릭)
            </DevSetCookieButton>
          )}
          {btnProps.map((props, index) => (
            <Button key={index} {...commonBtnProps} {...props} />
          ))}
        </Stack>
      </PageLayout>
      <Backdrop sx={({ zIndex }) => ({ zIndex: zIndex.drawer + 1 })} open={shouldOpenBackdrop} onClick={() => {}} />
    </>
  );
});

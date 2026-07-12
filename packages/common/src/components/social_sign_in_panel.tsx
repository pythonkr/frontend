import { AccountCircleOutlined, Google } from "@mui/icons-material";
import { Alert, alpha, Backdrop, Button, ButtonProps, Link, Stack } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBackendClient, useSignInWithSNSMutation, useSocialSessionQuery } from "@frontend/common/hooks/useAPI";
import { useCommonContext } from "@frontend/common/hooks/useCommonContext";
import { SocialSignInProvider } from "@frontend/common/schemas/backendAPI";

import { DevSetCookieButton } from "./dev_set_cookie_button";

type OAuthErrorType = { error: string; errorProcess: string | null };

type SocialSignInPanelProps = {
  dev?: boolean;
  maxWidth?: number | string;
  /** 지정하면 로그인 후 이 sessionStorage 키에 저장된 same-origin 경로로 복귀합니다. (open-redirect 방지) */
  pendingRedirectKey?: string;
};

/** sessionStorage에 저장된 복귀 URL을 검증해 same-origin 라우터 경로로 변환합니다. (open-redirect 방지) */
const toSafeRedirectPath = (raw: string | null): string | null => {
  if (!raw) return null;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    if (url.pathname === window.location.pathname) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
};

const readPending = (key?: string): string | null => {
  if (!key) return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const consumePending = (key?: string): void => {
  if (!key) return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // sessionStorage 미지원/차단 시 무시
  }
};

export const SocialSignInPanel: FC<SocialSignInPanelProps> = ({ dev, maxWidth = 400, pendingRedirectKey }) => {
  const navigate = useNavigate();
  const client = useBackendClient();
  const { language, accountsDomain, backendApiAbsoluteDomain, backendApiSessionCookieName } = useCommonContext();
  const signInMutation = useSignInWithSNSMutation(client);
  const { data: session } = useSocialSessionQuery(client);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [oauthError, setOauthError] = useState<OAuthErrorType | null>(null);

  useEffect(() => {
    if (!session) return;
    const redirectPath = toSafeRedirectPath(readPending(pendingRedirectKey));
    consumePending(pendingRedirectKey);
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
      return;
    }
    const username = session.data.user?.username ?? "";
    enqueueSnackbar(language === "ko" ? `이미 ${username}님으로 로그인되어 있습니다!` : `You are already signed in as ${username}!`, {
      variant: "success",
      anchorOrigin: { vertical: "bottom", horizontal: "center" },
    });
    navigate("/");
  }, [session, language, navigate, pendingRedirectKey]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (!error) return;
    // 로그인 실패 시 보류 중이던 복귀 위치를 폐기합니다. (stale redirect 방지)
    consumePending(pendingRedirectKey);
    setOauthError({ error, errorProcess: params.get("error_process") });
    params.delete("error");
    params.delete("error_process");
    const clean = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", clean);
  }, [pendingRedirectKey]);

  const triggerSignIn = (provider: SocialSignInProvider) => {
    setOauthError(null);
    setOpenBackdrop(true);
    // 복귀할 위치가 있으면 이 페이지로 되돌아와 stash를 소비한다(위 effect). 없으면 origin으로.
    const callbackUrl = toSafeRedirectPath(readPending(pendingRedirectKey))
      ? `${window.location.origin}${window.location.pathname}`
      : window.location.origin;
    signInMutation.mutate({ provider, callback_url: callbackUrl });
  };

  const accountsLink = accountsDomain ? (
    <Link href={accountsDomain} target="_blank" rel="noopener noreferrer">
      accounts.pycon.kr
    </Link>
  ) : (
    "accounts.pycon.kr"
  );

  const commonBtnProps: ButtonProps = { variant: "contained", fullWidth: true, size: "large", disabled: signInMutation.isPending };
  const commonSx: ButtonProps["sx"] = { textTransform: "none" };
  const btnProps: ButtonProps[] = [
    {
      children: language === "ko" ? "구글로 로그인" : "Sign In with Google",
      onClick: () => triggerSignIn("google"),
      startIcon: <Google />,
      sx: { ...commonSx, backgroundColor: "#4285F4", color: "#fff" },
    },
    {
      children: language === "ko" ? "네이버로 로그인" : "Sign In with Naver",
      onClick: () => triggerSignIn("naver"),
      startIcon: <AccountCircleOutlined />,
      sx: { ...commonSx, backgroundColor: "#03C75A", color: "#fff" },
    },
    {
      children: language === "ko" ? "카카오로 로그인" : "Sign In with Kakao",
      onClick: () => triggerSignIn("kakao"),
      startIcon: <AccountCircleOutlined />,
      sx: { ...commonSx, backgroundColor: "#FEE500", color: "#000" },
    },
  ];

  return (
    <>
      <Stack spacing={1.5} sx={{ width: "100%", maxWidth }}>
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
        {dev && (
          <DevSetCookieButton
            backendDomain={backendApiAbsoluteDomain ?? ""}
            cookieName={backendApiSessionCookieName ?? ""}
            cookieValue={client.getSessionId() ?? ""}
          >
            {language === "ko" ? "[localhost] 세션 쿠키 동기화 (로그인 전 클릭)" : "[localhost] Sync session cookie (click before sign in)"}
          </DevSetCookieButton>
        )}
        {btnProps.map((props, index) => (
          <Button key={index} {...commonBtnProps} {...props} />
        ))}
        <Alert severity="info">
          {language === "ko" ? <>이메일 로그인은 {accountsLink} 에서 진행해주세요.</> : <>For email login, please visit {accountsLink}.</>}
        </Alert>
      </Stack>
      <Backdrop sx={({ zIndex }) => ({ zIndex: zIndex.drawer + 1 })} open={signInMutation.isPending || openBackdrop} />
    </>
  );
};

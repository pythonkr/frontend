import { AccountCircleOutlined, Google } from "@mui/icons-material";
import { Backdrop, Button, ButtonProps, CircularProgress, Stack, Typography } from "@mui/material";
import { Suspense } from "@suspensive/react";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { FC, ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageLayout } from "@apps/pyconkr-2025/components/layout/PageLayout";
import { useAppContext } from "@apps/pyconkr-2025/contexts/app_context";
import { useShopClient, useSignInWithSNSMutation, useUserStatus } from "@frontend/shop/hooks";

type PageeStateType = {
  openBackdrop: boolean;
};

export const ShopSignInPage: FC = Suspense.with({ fallback: <CircularProgress /> }, () => {
  const { setAppContext, language } = useAppContext();
  const [state, setState] = useState<PageeStateType>({ openBackdrop: false });
  const navigate = useNavigate();
  const shopAPIClient = useShopClient();
  const SignInMutation = useSignInWithSNSMutation(shopAPIClient);
  const { data } = useUserStatus(shopAPIClient);

  const shouldOpenBackdrop = SignInMutation.isPending || state.openBackdrop;

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const triggerSignIn = (provider: "google" | "kakao" | "naver") => {
    setState((ps) => ({ ...ps, openBackdrop: true }));
    SignInMutation.mutate({ provider, callback_url: window.location.origin });
  };
  const signInWithGoogle = () => triggerSignIn("google");
  const signInWithKakao = () => triggerSignIn("kakao");
  const signInWithNaver = () => triggerSignIn("naver");

  const signInTitleStr = language === "ko" ? "로그인" : "Sign In";
  const signInWithGoogleStr = language === "ko" ? "구글로 로그인" : "Sign In with Google";
  const signInWithKakaoStr = language === "ko" ? "카카오로 로그인" : "Sign In with Kakao";
  const signInWithNaverStr = language === "ko" ? "네이버로 로그인" : "Sign In with Naver";

  useEffect(() => {
    if (data && data.meta.is_authenticated) {
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
          {btnProps.map((props, index) => (
            <Button key={index} {...commonBtnProps} {...props} />
          ))}
        </Stack>
      </PageLayout>
      <Backdrop sx={({ zIndex }) => ({ zIndex: zIndex.drawer + 1 })} open={shouldOpenBackdrop} onClick={() => {}} />
    </>
  );
});

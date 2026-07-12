import { SocialSignInPanel } from "@frontend/common/components";
import { Typography } from "@mui/material";
import { FC, useEffect } from "react";

import { PageLayout } from "@apps/pyconkr-2026/components/layout/PageLayout";
import { PENDING_REDIRECT_KEY } from "@apps/pyconkr-2026/consts/local_stroage";
import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";

export const ShopSignInPage: FC = () => {
  const { setAppContext, language } = useAppContext();

  const signInTitleStr = language === "ko" ? "로그인" : "Sign In";

  useEffect(() => {
    setAppContext((prev) => ({
      ...prev,
      title: signInTitleStr,
      shouldShowTitleBanner: true,
      shouldShowSponsorBanner: false,
    }));
  }, [setAppContext, signInTitleStr]);

  return (
    <PageLayout spacing={6}>
      <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bolder" }} children={signInTitleStr} />
      <SocialSignInPanel dev={import.meta.env.DEV} pendingRedirectKey={PENDING_REDIRECT_KEY} />
    </PageLayout>
  );
};

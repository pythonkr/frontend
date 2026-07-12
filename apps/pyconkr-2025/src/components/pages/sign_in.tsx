import { SocialSignInPanel } from "@frontend/common/components";
import { Typography } from "@mui/material";
import { FC, useEffect } from "react";

import { PageLayout } from "@apps/pyconkr-2025/components/layout/PageLayout";
import { useAppContext } from "@apps/pyconkr-2025/contexts/app_context";

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
      <SocialSignInPanel dev={import.meta.env.DEV} />
    </PageLayout>
  );
};

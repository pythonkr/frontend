import { Stack, Typography } from "@mui/material";
import { FC, useEffect } from "react";

import { PageLayout } from "@apps/pyconkr-2026/components/layout/PageLayout";
import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";

/**
 * 세션 발표 제안(CFP) 페이지 placeholder.
 * 시간표의 "세션 발표 추가" 버튼이 이 경로(/cfp)로 연결됩니다. 실제 제안 폼은 추후 구현합니다.
 */
export const CfpPage: FC = () => {
  const { language, setAppContext } = useAppContext();
  const isKo = language === "ko";

  useEffect(() => {
    setAppContext((prev) => ({
      ...prev,
      title: language === "ko" ? "발표 제안" : "Call for Proposals",
      shouldShowTitleBanner: true,
      shouldShowSponsorBanner: false,
    }));
  }, [language, setAppContext]);

  return (
    <PageLayout>
      <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700 }}
          children={isKo ? "발표 제안 페이지는 준비 중이에요" : "Call for Proposals is coming soon"}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
          children={isKo ? "곧 이곳에서 세션 발표를 제안할 수 있어요." : "You'll be able to propose a session here soon."}
        />
      </Stack>
    </PageLayout>
  );
};

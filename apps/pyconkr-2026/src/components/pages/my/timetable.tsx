import { CenteredPage, ErrorFallback } from "@frontend/common/components";
import { useBackendClient, useSessionsQuery } from "@frontend/common/hooks/useAPI";
import { useShopClient, useUserStatus } from "@frontend/shop/hooks";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { PageLayout } from "@apps/pyconkr-2026/components/layout/PageLayout";
import { EVENT_NAME } from "@apps/pyconkr-2026/consts";
import { PENDING_REDIRECT_KEY } from "@apps/pyconkr-2026/consts/local_stroage";
import { getSessionUrl } from "@apps/pyconkr-2026/consts/session_url";
import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";
import { MyTimetableGrid } from "@apps/pyconkr-2026/features/schedule/my_timetable_grid";
import { useMyScheduleIds } from "@apps/pyconkr-2026/features/schedule/use_my_schedule";

const CenteredLoadingPage: FC = () => (
  <CenteredPage>
    <CircularProgress />
  </CenteredPage>
);

const SignInPrompt: FC = () => {
  const { language } = useAppContext();
  const navigate = useNavigate();
  const isKo = language === "ko";

  const goToSignIn = () => {
    try {
      sessionStorage.setItem(PENDING_REDIRECT_KEY, window.location.href);
    } catch {
      // sessionStorage 미지원/차단 시 무시
    }
    navigate("/account/sign-in");
  };

  return (
    <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }} children={isKo ? "로그인이 필요해요" : "Sign in required"} />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center" }}
        children={isKo ? "로그인하면 담은 세션을 시간표로 볼 수 있어요." : "Sign in to view your saved sessions as a timetable."}
      />
      <Button variant="contained" onClick={goToSignIn} children={isKo ? "로그인하기" : "Sign in"} />
    </Stack>
  );
};

const MyTimetableContainer: FC = () => {
  const backendClient = useBackendClient();
  const { data: sessions } = useSessionsQuery(backendClient, { event: EVENT_NAME });
  const { data: ids } = useMyScheduleIds();
  const mySessions = useMemo(() => sessions.filter((session) => ids.has(session.id)), [sessions, ids]);
  return <MyTimetableGrid mySessions={mySessions} getSessionUrl={getSessionUrl} />;
};

export const MyTimeTablePage: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CenteredLoadingPage /> }, () => {
    const { language, setAppContext } = useAppContext();
    const { data: userStatus } = useUserStatus(useShopClient());
    const isAuthenticated = userStatus?.meta.is_authenticated === true;

    useEffect(() => {
      setAppContext((prev) => ({
        ...prev,
        title: language === "ko" ? "내 시간표" : "My Schedule",
        shouldShowTitleBanner: true,
        shouldShowSponsorBanner: false,
      }));
    }, [language, setAppContext]);

    return <PageLayout>{isAuthenticated ? <MyTimetableContainer /> : <SignInPrompt />}</PageLayout>;
  })
);

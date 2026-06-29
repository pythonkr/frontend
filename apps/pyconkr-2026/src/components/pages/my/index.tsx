import { CenteredPage, ErrorFallback } from "@frontend/common/components";
import { useShopClient, useSignOutMutation, useUserStatus } from "@frontend/shop/hooks";
import { CalendarMonth, ChevronRight, Logout, Receipt } from "@mui/icons-material";
import { Avatar, Button, Card, CircularProgress, Divider, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PageLayout } from "@apps/pyconkr-2026/components/layout/PageLayout";
import { PENDING_REDIRECT_KEY } from "@apps/pyconkr-2026/consts/local_stroage";
import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";
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
        children={isKo ? "로그인하면 마이페이지를 볼 수 있어요." : "Sign in to view your page."}
      />
      <Button variant="contained" onClick={goToSignIn} children={isKo ? "로그인하기" : "Sign in"} />
    </Stack>
  );
};

const MyPageContent: FC = () => {
  const { language } = useAppContext();
  const navigate = useNavigate();
  const shopClient = useShopClient();
  const { data } = useUserStatus(shopClient);
  const signOutMutation = useSignOutMutation(shopClient);
  const { data: scheduleIds } = useMyScheduleIds();

  const isKo = language === "ko";
  const user = data?.data.user;
  const savedCount = scheduleIds.size;
  const initial = (user?.display || user?.email || "U").trim().charAt(0).toUpperCase();

  const handleSignOut = () => {
    signOutMutation.mutate();
    navigate("/");
  };

  return (
    <Stack spacing={3} sx={{ width: "100%", maxWidth: "32rem", mx: "auto" }}>
      <Card variant="outlined" sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main", color: "#37102a", width: 52, height: 52, fontWeight: 700 }} children={initial} />
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }} noWrap children={user?.display || user?.email || (isKo ? "회원" : "Member")} />
            {user?.email && <Typography variant="body2" color="text.secondary" noWrap children={user.email} />}
          </Stack>
        </Stack>
      </Card>

      <Card variant="outlined">
        <List disablePadding>
          <ListItemButton onClick={() => navigate("/my/timetable")}>
            <ListItemIcon>
              <CalendarMonth />
            </ListItemIcon>
            <ListItemText primary={isKo ? "내 시간표" : "My Schedule"} secondary={isKo ? `${savedCount}개 담음` : `${savedCount} saved`} />
            <ChevronRight color="action" />
          </ListItemButton>
          <Divider component="li" />
          <ListItemButton onClick={() => navigate("/store/order-histories")}>
            <ListItemIcon>
              <Receipt />
            </ListItemIcon>
            <ListItemText primary={isKo ? "결제 내역" : "Order History"} />
            <ChevronRight color="action" />
          </ListItemButton>
        </List>
      </Card>

      <Button variant="outlined" color="inherit" startIcon={<Logout />} onClick={handleSignOut} sx={{ alignSelf: "center" }}>
        {isKo ? "로그아웃" : "Sign out"}
      </Button>
    </Stack>
  );
};

export const MyPage: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CenteredLoadingPage /> }, () => {
    const { language, setAppContext } = useAppContext();
    const { data: userStatus } = useUserStatus(useShopClient());
    const isAuthenticated = userStatus?.meta.is_authenticated === true;

    useEffect(() => {
      setAppContext((prev) => ({
        ...prev,
        title: language === "ko" ? "마이페이지" : "My Page",
        shouldShowTitleBanner: true,
        shouldShowSponsorBanner: false,
      }));
    }, [language, setAppContext]);

    return <PageLayout>{isAuthenticated ? <MyPageContent /> : <SignInPrompt />}</PageLayout>;
  })
);

import * as React from "react";

import { CircularProgress, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";

import ShopHooks from "../../hooks";

type SignInGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

const InnerSignInGuard: React.FC<SignInGuardProps> = ({ children, fallback }) => {
  const { data } = ShopHooks.useUserStatus();
  const renderedFallback = fallback || <Typography variant="h6" gutterBottom>로그인 후 이용해주세요.</Typography>;
  return data?.meta?.is_authenticated === true ? children : renderedFallback;
};

export const SignInGuard: React.FC<SignInGuardProps> = ({ children, fallback }) => {
  return <ErrorBoundary fallback={<>로그인 정보를 불러오는 중 문제가 발생했습니다.</>}>
    <Suspense fallback={<CircularProgress />}>
      <InnerSignInGuard fallback={fallback}>{children}</InnerSignInGuard>
    </Suspense>
  </ErrorBoundary>
};

import { CircularProgress, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, ReactNode } from "react";

import { useShopClient, useShopContext, useUserStatus } from "@frontend/shop/hooks";

type SignInGuardProps = {
  /** 로그인 상태일 때 보여줄 내용. */
  children: ReactNode;
  /** 비로그인 시 보여줄 대체 내용. 미지정 시 기본 '로그인이 필요합니다' 안내 문구를 보여준다. */
  fallback?: ReactNode;
};

/**
 * 로그인한 사용자에게만 children 을 보여주고, 비로그인 시 안내 문구(또는 `fallback`)를 보여주는 가드.
 * 로그인이 필요한 영역(장바구니·주문 등)을 감쌀 때 사용한다. 보호할 내용을 태그 사이(children)에 넣는다.
 * @example
 * <Shop__Common__SignInGuard>
 *   <Shop__Feature__OrderList />
 * </Shop__Common__SignInGuard>
 */
export const SignInGuard: FC<SignInGuardProps> = Suspense.with({ fallback: <CircularProgress /> }, ({ children, fallback }) => {
  const { language } = useShopContext();
  const shopAPIClient = useShopClient();
  const { data } = useUserStatus(shopAPIClient);

  const errorFallbackStr =
    language === "ko"
      ? "로그인 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      : "An error occurred while loading sign-in information. Please try again later.";
  const signInRequiredStr =
    language === "ko" ? "로그인이 필요합니다. 로그인 후 다시 시도해주세요." : "You need to sign in. Please sign in and try again.";

  const signInRequiredFallback = fallback || (
    <Typography variant="h6" gutterBottom>
      {signInRequiredStr}
    </Typography>
  );

  return <ErrorBoundary fallback={errorFallbackStr}>{data?.meta?.is_authenticated === true ? children : signInRequiredFallback}</ErrorBoundary>;
});

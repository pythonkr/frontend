import { CircularProgress } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC } from "react";
import { isArray, isEmpty } from "remeda";

import { useShopClient, useShopContext, useUserStatus } from "@frontend/shop/hooks";

const ProviderTranslation: Record<string, { ko: string; en: string }> = {
  google: { ko: "구글", en: "Google" },
  kakao: { ko: "카카오", en: "Kakao" },
  naver: { ko: "네이버", en: "Naver" },
};

const ErrorBoundariedText: FC<{ ko: string; en: string }> = (props) => {
  const { language } = useShopContext();
  return props[language];
};

/**
 * 현재 로그인 방식을 텍스트로 표시한다(예: 구글/카카오/네이버, 계정 로그인).
 * 비로그인 시 '손님'(Guest)을 표시한다.
 * @example <Shop__Common__UserSignInMethod />
 */
export const UserSignInMethod: FC = ErrorBoundary.with(
  { fallback: <ErrorBoundariedText ko="손님" en="Guest" /> },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const { language } = useShopContext();
    const shopAPIClient = useShopClient();
    const { data } = useUserStatus(shopAPIClient);

    const notSignedInStr = language === "ko" ? "손님" : "Guest";
    const directSignInStr = language === "ko" ? "계정 로그인" : "Direct Sign-in";

    if (!data?.meta?.is_authenticated) return notSignedInStr;
    if (!isArray(data.data.methods) || isEmpty(data.data.methods)) return directSignInStr;

    const signInMethod = data.data.methods[0];
    return signInMethod.method === "socialaccount"
      ? ProviderTranslation[signInMethod.provider]?.[language] || signInMethod.provider
      : signInMethod.method;
  })
);

/**
 * 현재 로그인한 계정의 이메일을 텍스트로 표시한다.
 * 비로그인 시 '로그아웃됨'(Signed-out)을 표시한다.
 * @example <Shop__Common__UserSignInAccount />
 */
export const UserSignInAccount: FC = ErrorBoundary.with(
  { fallback: <ErrorBoundariedText ko="로그아웃됨" en="Signed-out" /> },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const { language } = useShopContext();
    const shopAPIClient = useShopClient();
    const { data } = useUserStatus(shopAPIClient);

    const notSignedInStr = language === "ko" ? "로그아웃됨" : "Signed-out";
    return data?.meta?.is_authenticated ? data.data.user.email : notSignedInStr;
  })
);

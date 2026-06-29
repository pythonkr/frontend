import { CircularProgress } from "@mui/material";
import { Suspense } from "@suspensive/react";
import { FC } from "react";

import { useShopContext } from "@frontend/shop/hooks";

/**
 * 금액을 통화 단위(한국어 `원`, 영어 `KRW`)와 천 단위 구분 기호를 붙여 보여주는 인라인 텍스트.
 * 가격·결제 금액 등을 표기할 때 사용한다.
 * @example <Shop__Common__PriceDisplay price={45000} label="얼리버드" />
 */
export const PriceDisplay: FC<{
  /** 표시할 금액(원 단위 정수). */
  price: number;
  /** 금액 앞에 붙일 라벨. 지정하면 `라벨 : 금액` 형태로 표시된다. */
  label?: string;
}> = Suspense.with({ fallback: <CircularProgress /> }, ({ price, label }) => {
  const { language } = useShopContext();
  const priceStr = language === "ko" ? "원" : "KRW";
  return <>{(label ? `${label} : ` : "") + price.toLocaleString() + priceStr}</>;
});

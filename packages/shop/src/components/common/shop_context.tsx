import { FC, ReactNode } from "react";

import { context, type ContextOptions } from "@frontend/shop/contexts";

type ShopContextProps = {
  /** Shop 전역 설정 값(언어, API 클라이언트, 결제 계정 등). */
  options: ContextOptions;
  /** 설정을 적용할 하위 트리. */
  children: ReactNode;
};

/**
 * Shop 컴포넌트들이 사용하는 설정(언어·API·결제 계정 등)을 하위에 제공하는 컨텍스트 프로바이더.
 * 다른 Shop 컴포넌트를 쓰기 전에 최상위에서 한 번 감싸야 한다. 적용 대상은 태그 사이(children)에 넣는다.
 * @example
 * <Shop__Common__ContextProvider options={shopOptions}>
 *   <Shop__Feature__ProductList />
 * </Shop__Common__ContextProvider>
 */
export const ShopContextProvider: FC<ShopContextProps> = (props) => <context.Provider value={props.options}>{props.children}</context.Provider>;

import * as Common from "@frontend/common";
import * as Shop from "@frontend/shop";
import type { MDXComponents } from "mdx/types.js";

const ShopMDXComponents: MDXComponents = {
  Shop__Common__PriceDisplay: Shop.Components.Common.PriceDisplay,
  Shop__Common__SignInGuard: Shop.Components.Common.SignInGuard,
  Shop__Common__ContextProvider: Shop.Components.Common.ShopContextProvider,
  Shop__Common__UserSignInMethod: Shop.Components.Common.UserSignInMethod,
  Shop__Common__UserSignInAccount: Shop.Components.Common.UserSignInAccount,
  Shop__Feature__CartStatus: Shop.Components.Features.CartStatus,
  Shop__Feature__ProductList: Shop.Components.Features.ProductList,
  Shop__Feature__ProductImageCardList: Shop.Components.Features.ProductImageCardList,
  Shop__Feature__OrderList: Shop.Components.Features.OrderList,
  Shop__Feature__UserInfo: Shop.Components.Features.UserInfo,
  Shop__Feature__PatronList: Shop.Components.Features.PatronList,
};

export const PyConKRMDXComponents: MDXComponents = {
  ...Common.BaseMDXComponents,
  ...ShopMDXComponents,
};

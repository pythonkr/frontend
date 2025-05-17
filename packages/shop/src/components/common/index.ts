import {
  OptionGroupInput as OptionGroupInput_,
  OrderProductRelationOptionInput as OrderProductRelationOptionInput_,
} from "./option_group_input";
import { PriceDisplay as PriceDisplay_ } from "./price_display";
import { ShopContextProvider as ShopContextProvider_ } from "./shop_context";
import { SignInGuard as SignInGuard_ } from "./signin_guard";

namespace CommonComponents {
  export const ShopContextProvider = ShopContextProvider_;
  export const OptionGroupInput = OptionGroupInput_;
  export const OrderProductRelationOptionInput = OrderProductRelationOptionInput_;
  export const PriceDisplay = PriceDisplay_;
  export const SignInGuard = SignInGuard_;
}

export default CommonComponents;

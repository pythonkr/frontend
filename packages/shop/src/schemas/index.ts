import { isArray, isPlainObject, isString } from "remeda";
export type EmptyObject = Record<string, never>;

export type DetailedErrorSchema = {
  code: string;
  detail: string;
  attr: string | null;
};

export type ErrorResponseSchema = {
  type: string;
  errors: DetailedErrorSchema[];
};

export type SocialSignInProvider = "google" | "naver" | "kakao";

export type SocialSignInRequest = {
  provider: SocialSignInProvider;
  callback_url: string;
};

export type SocialSessionStatusType = {
  meta: { is_authenticated: boolean };
  data: { user?: { email: string } };
};

export type EmailSignInRequest = {
  email: string;
  password: string;
};

export type UserSignedInStatus = {
  status: number;
  meta: {
    is_authenticated: true;
  };
  data: {
    user: {
      id: number;
      display: string;
      has_usable_password: boolean;
      email: string;
      username: string;
    };
    methods: {
      method: "socialaccount";
      at: number;
      provider: SocialSignInProvider;
      uid: string;
    }[];
  };
};

export type UserNotSignedInStatus = {
  status: number;
  meta: {
    is_authenticated: false;
  };
  data: {
    flows:
      | {
          id: "login";
        }
      | {
          id: "provider_redirect";
          providers: SocialSignInProvider[];
        }
      | {
          id: "provider_token";
          providers: SocialSignInProvider[];
        };
  };
};

export type OptionLeftoverStockInfo = {
  product_max_quantity_per_user: number | null;
  product_leftover_stock: number | null;
  option_group_max_quantity_per_user: number | null;
  option_max_quantity_per_user: number | null;
  option_leftover_stock: number | null;
};

export type OptionGroupLeftoverStockInfo = {
  product_max_quantity_per_user: number | null;
  product_leftover_stock: number | null;
  option_group_max_quantity_per_user: number | null;
};

export type Option = {
  id: string;
  name: string;
  additional_price: number;
  max_quantity_per_user: number;
  leftover_stock: number | null;
  leftover_stock_per_user: number | null;
  leftover_stock_info: OptionLeftoverStockInfo;
};

// "선택해주세요" placeholder 노출/검증 정책. 백엔드 OptionGroup.PlaceholderMode 와 동일.
// hidden: 미노출(옵션 필수 선택) / optional: 노출, 미선택 통과 / required: 노출, 미선택 시 검증 실패.
export type OptionGroupPlaceholderMode = "hidden" | "optional" | "required";

export type OptionGroup = {
  id: string;
  name: string;

  min_quantity_per_product: number;
  max_quantity_per_product: number;
  max_quantity_per_user: number;

  placeholder_mode: OptionGroupPlaceholderMode;

  // null이면 Product의 동일 필드를 따름.
  visible_starts_at: string | null;
  visible_ends_at: string | null;
  orderable_starts_at: string | null;
  orderable_ends_at: string | null;

  leftover_stock_per_user: number | null;
  leftover_stock_info: OptionGroupLeftoverStockInfo;

  options: Option[];
} & (
  | {
      is_custom_response: false;
      custom_response_pattern: null;
    }
  | {
      is_custom_response: true;
      custom_response_pattern: string;
    }
);

export type ProductListQueryParams = {
  /** 조회할 카테고리 그룹 코드. 지정하면 해당 그룹의 상품만 보여준다. */
  category_group?: string;
  /** 조회할 카테고리 코드. 지정하면 해당 카테고리의 상품만 보여준다. */
  category?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  is_ticket: boolean;
  orderable_starts_at: string;
  orderable_ends_at: string;
  refundable_ends_at: string | null; // null이면 환불 불가 상품.

  category_group: string;
  category: string;

  donation_allowed: boolean;
  donation_min_price: number | null;
  donation_max_price: number | null;

  option_groups: OptionGroup[];
  leftover_stock: number;
  tag_names: string[];
};

export type TicketInfo = {
  name: string;
  phone: string;
  email: string;
  organization: string | null;
  contribution_message: string | null;
};

export type TicketInfoRequest = {
  name: string;
  phone: string;
  email: string;
  organization: string;
  contribution_message?: string;
};

export type CertificateStatus = "not_issuable" | "issuable" | "issued" | "revoked";

export type PaymentHistoryStatus = "pending" | "completed" | "partial_refunded" | "refunded";

export type PaymentHistory = {
  price: number;
  status: PaymentHistoryStatus;
};

export type OrderProductItemStatus = "pending" | "paid" | "used" | "refunded";

export type OrderProductItem = {
  id: string;
  status: OrderProductItemStatus;
  price: number;
  donation_price: number;
  not_refundable_reason: string | null;
  scancode_url: string | null;
  is_ticket: boolean;
  ticket_info: TicketInfo | null;
  certificate_status: CertificateStatus;
  product: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    donation_allowed: boolean;
  };
  options: (
    | {
        id: string;
        product_option_group: {
          id: string;
          name: string;
          is_custom_response: false;
          custom_response_pattern: null;
          response_modifiable_ends_at: string | null;
          placeholder_mode: OptionGroupPlaceholderMode;
        };
        product_option: {
          id: string;
          name: string;
          additional_price: number;
        };
        custom_response: null;
      }
    | {
        id: string;
        product_option_group: {
          id: string;
          name: string;
          is_custom_response: true;
          custom_response_pattern: string;
          response_modifiable_ends_at: string | null;
          placeholder_mode: OptionGroupPlaceholderMode;
        };
        product_option: null;
        custom_response: string;
      }
  )[];
};

export type CustomerInfo = {
  name: string; // ^(.*)$
  phone: string; // ^([\d]{3}-[\d]{3,4}-[\d]{4}|\+[\d]{9,14})$
  email: string; // $email
  organization: string | null; // ^(.*)$
};

export type Order = {
  id: string;
  name: string;
  merchant_uid: string;
  first_paid_at: string;
  first_paid_price: number;
  current_paid_price: number;
  current_status: PaymentHistoryStatus;
  not_fully_refundable_reason: string | null;
  created_at: string;

  payment_histories: PaymentHistory[];
  products: OrderProductItem[];
  customer_info: CustomerInfo | null;
};
export type Cart = Omit<Order, "first_paid_at"> & { first_paid_at: string | null };

export type CartItemAppendRequest = {
  product: string;
  options: {
    product_option_group: string;
    product_option: string | null;
    custom_response: string | null;
  }[];
  donation_price?: number;
  ticket_info?: TicketInfoRequest; // 티켓 상품(product.is_ticket === true)인 경우 필수.
};
export type OneItemOrderRequest = CartItemAppendRequest & { customer_info: CustomerInfo };

export type OneItemRefundRequest = {
  order_id: string;
  order_product_relation_id: string;
};

export type OrderProductPatchRequest = {
  order_id: string;
  order_product_relation_id: string;
  ticket_info?: TicketInfoRequest;
  options?: {
    order_product_option_relation: string;
    custom_response: string;
  }[];
};

export type CertificateIssueRequest = {
  order_id: string;
  order_product_relation_id: string;
};

export type Patron = {
  name: string;
  contribution_message: string;
};

export const isObjectErrorResponseSchema = (obj?: unknown): obj is ErrorResponseSchema => {
  return (
    isPlainObject(obj) &&
    isString(obj.type) &&
    isArray(obj.errors) &&
    obj.errors.every((error) => {
      return isPlainObject(error) && isString(error.code) && isString(error.detail) && (error.attr === null || isString(error.attr));
    })
  );
};

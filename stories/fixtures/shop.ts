import type ShopSchemas from "@frontend/shop/src/schemas";

export const mockUserSignedIn: ShopSchemas.UserSignedInStatus = {
  status: 200,
  meta: { is_authenticated: true },
  data: {
    user: {
      id: 1,
      display: "홍길동",
      has_usable_password: false,
      email: "hong@example.com",
      username: "hong",
    },
    methods: [
      {
        method: "socialaccount",
        at: 1700000000,
        provider: "google",
        uid: "123456789",
      },
    ],
  },
};

export const mockUserNotSignedIn: ShopSchemas.UserNotSignedInStatus = {
  status: 401,
  meta: { is_authenticated: false },
  data: {
    flows: {
      id: "provider_redirect",
      providers: ["google", "naver", "kakao"],
    },
  },
};

export const mockProducts: ShopSchemas.Product[] = [
  {
    id: "prod-001",
    name: "파이콘 한국 2025 개인 티켓",
    description: "파이콘 한국 2025 행사에 참가할 수 있는 개인 티켓입니다.\n\n- 3일 모든 행사 참여 가능\n- 점심 식사 포함",
    image: null,
    price: 50000,
    orderable_starts_at: "2025-01-01T00:00:00Z",
    orderable_ends_at: "2099-12-31T23:59:59Z",
    refundable_ends_at: "2099-08-01T23:59:59Z",
    category_group: "ticket",
    category: "individual",
    donation_allowed: false,
    donation_min_price: null,
    donation_max_price: null,
    option_groups: [
      {
        id: "og-001",
        name: "식사 옵션",
        min_quantity_per_product: 1,
        max_quantity_per_product: 1,
        is_custom_response: false,
        custom_response_pattern: null,
        options: [
          { id: "o-001", name: "일반식", additional_price: 0, max_quantity_per_user: 1, leftover_stock: 100 },
          { id: "o-002", name: "채식", additional_price: 0, max_quantity_per_user: 1, leftover_stock: 20 },
        ],
      },
    ],
    leftover_stock: 200,
    tag_names: ["early-bird"],
  },
  {
    id: "prod-002",
    name: "파이콘 한국 2025 후원 티켓",
    description: "행사를 후원하는 분들을 위한 티켓입니다. 추가 기부도 가능합니다.",
    image: null,
    price: 100000,
    orderable_starts_at: "2025-01-01T00:00:00Z",
    orderable_ends_at: "2099-12-31T23:59:59Z",
    refundable_ends_at: "2099-08-01T23:59:59Z",
    category_group: "ticket",
    category: "supporter",
    donation_allowed: true,
    donation_min_price: 0,
    donation_max_price: 500000,
    option_groups: [],
    leftover_stock: 50,
    tag_names: ["supporter"],
  },
];

const mockOrderProductItem: ShopSchemas.OrderProductItem = {
  id: "opi-001",
  status: "paid",
  price: 50000,
  donation_price: 0,
  not_refundable_reason: null,
  scancode_url: null,
  product: {
    id: "prod-001",
    name: "파이콘 한국 2025 개인 티켓",
    price: 50000,
    image: null,
  },
  options: [
    {
      id: "opor-001",
      product_option_group: {
        id: "og-001",
        name: "식사 옵션",
        is_custom_response: false,
        custom_response_pattern: null,
        response_modifiable_ends_at: null,
      },
      product_option: {
        id: "o-001",
        name: "일반식",
        additional_price: 0,
      },
      custom_response: null,
    },
  ],
};

export const mockCart: ShopSchemas.Cart = {
  id: "cart-001",
  name: "장바구니",
  first_paid_price: 50000,
  current_paid_price: 50000,
  current_status: "pending",
  not_fully_refundable_reason: null,
  created_at: "2025-03-01T10:00:00Z",
  payment_histories: [],
  products: [mockOrderProductItem],
  customer_info: null,
};

export const mockEmptyCart: ShopSchemas.Cart = {
  id: "cart-empty",
  name: "장바구니",
  first_paid_price: 0,
  current_paid_price: 0,
  current_status: "pending",
  not_fully_refundable_reason: null,
  created_at: "2025-03-01T10:00:00Z",
  payment_histories: [],
  products: [],
  customer_info: null,
};

export const mockOrders: ShopSchemas.Order[] = [
  {
    id: "order-001",
    name: "파이콘 한국 2025 개인 티켓",
    first_paid_price: 50000,
    current_paid_price: 50000,
    current_status: "completed",
    not_fully_refundable_reason: null,
    created_at: "2025-03-01T10:00:00Z",
    payment_histories: [{ price: 50000, status: "completed" }],
    products: [mockOrderProductItem],
    customer_info: {
      name: "홍길동",
      phone: "010-1234-5678",
      email: "hong@example.com",
      organization: null,
    },
  },
];

export const mockPatrons: ShopSchemas.Patron[] = [
  { name: "홍길동", contribution_message: "파이콘을 응원합니다!" },
  { name: "김파이", contribution_message: "Python과 함께라면 무엇이든 가능해요." },
  { name: "이코드", contribution_message: "Weave with Python!" },
  { name: "박오픈", contribution_message: "오픈소스 커뮤니티 화이팅!" },
];

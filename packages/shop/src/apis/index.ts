import { BackendAPIClient } from "@frontend/common/apis/client";
import type {
  CartItemAppendRequest,
  CustomerInfo,
  EmailSignInRequest,
  EmptyObject,
  OneItemOrderRequest,
  OneItemRefundRequest,
  Order,
  OrderOptionsPatchRequest,
  Patron,
  Product,
  ProductListQueryParams,
  SocialSignInRequest,
  UserSignedInStatus,
} from "@frontend/shop/schemas";

export { BackendAPIClient, BackendAPIClientError, formatBackendErrorMessage } from "@frontend/common/apis/client";

/**
 * 로그인합니다.
 */
export const signInWithEmail = (client: BackendAPIClient) => (data: EmailSignInRequest) => {
  const requestPayload = {
    ...data,
    csrfmiddlewaretoken: client.getCSRFToken() ?? "",
  };
  return client.post<UserSignedInStatus, EmailSignInRequest>("authn/social/browser/v1/auth/login", requestPayload);
};

/**
 * SNS로 로그인합니다.
 */
export const signInWithSNS = (client: BackendAPIClient) => async (socialSignInInfo: SocialSignInRequest) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${client.baseURL}/authn/social/browser/v1/auth/provider/redirect`;

  Object.entries({
    ...socialSignInInfo,
    csrfmiddlewaretoken: client.getCSRFToken() ?? "",
    process: "login",
  }).forEach(([key, value]) => {
    const inputElement = document.createElement("input");
    inputElement.type = "hidden";
    inputElement.name = key;
    inputElement.value = value;
    form.appendChild(inputElement);
  });
  document.body.appendChild(form);
  form.submit();
  setTimeout(() => document.body.removeChild(form), 100);
};

/**
 * 로그아웃합니다.
 */
export const signOut = (client: BackendAPIClient) => async () => {
  try {
    await client.delete<void>("authn/social/browser/v1/auth/session");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return Promise.resolve({});
  }
};

/**
 * 로그인 정보를 조회합니다.
 * @returns 로그인 정보
 */
export const retrieveUserInfo = (client: BackendAPIClient) => async () => {
  try {
    const response = await client.get<UserSignedInStatus>("authn/social/browser/v1/auth/session");
    if (response.meta.is_authenticated) {
      return response;
    } else {
      throw new Error("User is not authenticated");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return Promise.resolve(null);
  }
};

/**
 * 노출 중인 모든 상품의 목록을 가져옵니다.
 * @returns 노출 중인 모든 상품의 목록
 */
export const listProducts = (client: BackendAPIClient) => (qs?: ProductListQueryParams) => client.get<Product[]>("v1/shop/products/", { params: qs });

/**
 * 현재 사용자의 장바구니에 담긴 상품의 목록을 가져옵니다.
 * @returns 현재 장바구니 상태
 */
export const retrieveCart = (client: BackendAPIClient) => () => client.get<Order | EmptyObject>("v1/shop/orders/cart/");

/**
 * 장바구니에 상품을 추가합니다.
 * @returns 현재 장바구니 상태
 */
export const appendItemToCart = (client: BackendAPIClient) => (data: CartItemAppendRequest) =>
  client.post<Order, CartItemAppendRequest>("v1/shop/orders/cart/products/", data);

/**
 * 장바구니에서 특정 상품을 제거합니다.
 * @returns 현재 장바구니 상태
 */
export const removeItemFromCart = (client: BackendAPIClient) => (data: { cartProductId: string }) =>
  client.delete<Order>(`v1/shop/orders/cart/products/${data.cartProductId}/`);

/**
 * 단일 상품 즉시 결제를 PortOne에 등록합니다.
 * @returns PortOne에 등록된 주문 정보
 */
export const prepareOneItemOrder = (client: BackendAPIClient) => (data: OneItemOrderRequest) =>
  client.post<Order, OneItemOrderRequest>("v1/shop/orders/single/", data);

/**
 * 고객의 장바구니에 담긴 전체 상품 결제를 PortOne에 등록합니다.
 * @returns PortOne에 등록된 주문 정보
 */
export const prepareCartOrder = (client: BackendAPIClient) => (data: CustomerInfo) => client.post<Order, CustomerInfo>("v1/shop/orders/", data);

/**
 * 고객의 모든 결제 내역을 가져옵니다.
 * @returns 고객의 모든 결제 내역
 */
export const listOrders = (client: BackendAPIClient) => () => client.get<Order[]>("v1/shop/orders/");

/**
 * 결제 완료된 주문 내역에서 특정 상품을 환불 시도합니다.
 */
export const refundOneItemFromOrder = (client: BackendAPIClient) => (data: OneItemRefundRequest) =>
  client.delete<void>(`v1/shop/orders/${data.order_id}/products/${data.order_product_relation_id}/`);

/**
 * 결제 완료된 주문 내역을 환불 시도합니다.
 */
export const refundAllItemsInOrder = (client: BackendAPIClient) => (data: { order_id: string }) =>
  client.delete<void>(`v1/shop/orders/${data.order_id}/`);

/**
 * 결제 완료된 주문의 사용자 정의 응답용 상품 옵션을 수정합니다.
 */
export const patchOrderOptions = (client: BackendAPIClient) => async (data: OrderOptionsPatchRequest) =>
  client.patch<Order, OrderOptionsPatchRequest["options"]>(
    `v1/shop/orders/${data.order_id}/products/${data.order_product_relation_id}/options/`,
    data.options
  );

/**
 * 후원자 목록을 가져옵니다.
 */
export const listPatrons = (client: BackendAPIClient, year: number) => () => client.get<Patron[]>("v1/shop/patron/", { params: { year } });

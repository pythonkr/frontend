import { BackendAPIClient } from "@frontend/common/apis/client";

import type {
  Cart,
  CartItemAppendRequest,
  CertificateIssueRequest,
  CustomerInfo,
  EmailSignInRequest,
  EmptyObject,
  OneItemOrderRequest,
  OneItemRefundRequest,
  Order,
  OrderProductPatchRequest,
  Patron,
  Product,
  ProductListQueryParams,
  UserSignedInStatus,
} from "@frontend/shop/schemas";

export { BackendAPIClient, BackendAPIClientError, formatBackendErrorMessage } from "@frontend/common/apis/client";
export { signInWithSNS } from "@frontend/common/apis";

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
export const retrieveCart = (client: BackendAPIClient) => () => client.get<Cart | EmptyObject>("v1/shop/orders/cart/");

/**
 * 장바구니에 상품을 추가합니다.
 * @returns 현재 장바구니 상태
 */
export const appendItemToCart = (client: BackendAPIClient) => (data: CartItemAppendRequest) =>
  client.post<Cart, CartItemAppendRequest>("v1/shop/orders/cart/products/", data);

/**
 * 장바구니에서 특정 상품을 제거합니다.
 * @returns 현재 장바구니 상태
 */
export const removeItemFromCart = (client: BackendAPIClient) => (data: { cartProductId: string }) =>
  client.delete<Cart>(`v1/shop/orders/cart/products/${data.cartProductId}/`);

/**
 * 단일 상품 즉시 결제를 PortOne에 등록합니다.
 * @returns PortOne에 등록된 주문 정보
 */
export const prepareOneItemOrder = (client: BackendAPIClient) => (data: OneItemOrderRequest) =>
  client.post<Cart, OneItemOrderRequest>("v1/shop/orders/single/", data);

/**
 * 고객의 장바구니에 담긴 전체 상품 결제를 PortOne에 등록합니다.
 * @returns PortOne에 등록된 주문 정보
 */
export const prepareCartOrder = (client: BackendAPIClient) => (data: CustomerInfo) => client.post<Cart, CustomerInfo>("v1/shop/orders/", data);

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
 * 결제 완료된 주문 상품의 옵션 답변 및/또는 티켓 참가자 정보를 수정합니다. 백엔드는 본문 없이 204를 반환합니다.
 */
export const patchOrderProduct = (client: BackendAPIClient) => async (data: OrderProductPatchRequest) => {
  const body: Pick<OrderProductPatchRequest, "ticket_info" | "options"> = {};
  if (data.ticket_info !== undefined) body.ticket_info = data.ticket_info;
  if (data.options !== undefined) body.options = data.options;
  return client.patch<void, typeof body>(`v1/shop/orders/${data.order_id}/products/${data.order_product_relation_id}/`, body);
};

/**
 * 주문 상품(used 상태의 티켓)에 대한 참가확인서를 발급(이미 있으면 재사용)하고 다운로드 URL을 반환합니다.
 */
export const issueCertificate = (client: BackendAPIClient) => (data: CertificateIssueRequest) =>
  client.post<{ download_url: string }, EmptyObject>(`v1/shop/orders/${data.order_id}/products/${data.order_product_relation_id}/certificate/`, {});

/**
 * 후원자 목록을 가져옵니다.
 */
export const listPatrons = (client: BackendAPIClient, year: number) => () => client.get<Patron[]>("v1/shop/patron/", { params: { year } });

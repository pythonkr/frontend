import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useContext } from "react";

import { useBackendContext } from "@frontend/common/hooks/useAPI";
import {
  appendItemToCart,
  BackendAPIClient,
  listOrders,
  listPatrons,
  listProducts,
  patchOrderOptions,
  prepareCartOrder,
  prepareOneItemOrder,
  refundAllItemsInOrder,
  refundOneItemFromOrder,
  removeItemFromCart,
  retrieveCart,
  retrieveUserInfo,
  signInWithEmail,
  signInWithSNS,
  signOut,
} from "@frontend/shop/apis";
import { context as shopContext } from "@frontend/shop/contexts";
import type { ProductListQueryParams } from "@frontend/shop/schemas";

const QUERY_KEYS = {
  BASE: ["query", "shop"],
  USER: ["query", "shop", "user"],
  PRODUCT_LIST: ["query", "shop", "products"],
  CART_INFO: ["query", "shop", "cart"],
  ORDER_LIST: ["query", "shop", "orders"],
  PATRONS: ["query", "shop", "patrons"],
};

const MUTATION_KEYS = {
  USER_SIGN_IN_EMAIL: ["mutation", "shop", "user", "sign_in", "email"],
  USER_SIGN_IN_SNS: ["mutation", "shop", "user", "sign_in", "sns"],
  USER_SIGN_OUT: ["mutation", "shop", "user", "sign_out"],
  CART_ITEM_APPEND: ["mutation", "shop", "cart", "item", "append"],
  CART_ITEM_REMOVE: ["mutation", "shop", "cart", "item", "remove"],
  CART_ORDER_START: ["mutation", "shop", "cart_order", "start"],
  ONE_ITEM_ORDER_START: ["mutation", "shop", "one_item_order", "start"],
  ALL_ORDER_REFUND: ["mutation", "shop", "all_order_refund"],
  ONE_ITEM_REFUND: ["mutation", "shop", "one_item_refund"],
};

export const useShopContext = () => {
  const context = useContext(shopContext);
  if (!context) {
    throw new Error("useShopContext must be used within a ShopProvider");
  }
  return context;
};

export const useShopClient = () => {
  const { backendApiDomain, backendApiTimeout, backendApiCSRFCookieName, language } = useBackendContext();
  return new BackendAPIClient(backendApiDomain, backendApiTimeout, backendApiCSRFCookieName, true, language);
};

export const useUserStatus = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.USER, client.language],
    queryFn: retrieveUserInfo(client),
    retry: 3,
  });

export const useSignInWithEmailMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: MUTATION_KEYS.USER_SIGN_IN_EMAIL,
    mutationFn: signInWithEmail(client),
    meta: { invalidates: [QUERY_KEYS.BASE] },
  });

export const useSignInWithSNSMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: MUTATION_KEYS.USER_SIGN_IN_SNS,
    mutationFn: signInWithSNS(client),
    meta: { invalidates: [QUERY_KEYS.BASE] },
  });

export const useSignOutMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: MUTATION_KEYS.USER_SIGN_OUT,
    mutationFn: signOut(client),
    retry: 0,
    meta: { invalidates: [QUERY_KEYS.BASE] },
  });

export const useProducts = (client: BackendAPIClient, qs?: ProductListQueryParams) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PRODUCT_LIST, qs ? JSON.stringify(qs) : "", client.language],
    queryFn: () => listProducts(client)(qs),
  });

export const useCart = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.CART_INFO, client.language],
    queryFn: retrieveCart(client),
  });

export const useAddItemToCartMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: MUTATION_KEYS.CART_ITEM_APPEND,
    mutationFn: appendItemToCart(client),
    meta: { invalidates: [QUERY_KEYS.CART_INFO] },
  });

export const useRemoveItemFromCartMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: MUTATION_KEYS.CART_ITEM_REMOVE,
    mutationFn: removeItemFromCart(client),
    meta: { invalidates: [QUERY_KEYS.CART_INFO] },
  });

export const usePrepareOneItemOrderMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: MUTATION_KEYS.ONE_ITEM_ORDER_START,
    mutationFn: prepareOneItemOrder(client),
    meta: { invalidates: [QUERY_KEYS.CART_INFO, QUERY_KEYS.ORDER_LIST] },
  });

export const usePrepareCartOrderMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: MUTATION_KEYS.CART_ORDER_START,
    mutationFn: prepareCartOrder(client),
    meta: { invalidates: [QUERY_KEYS.CART_INFO, QUERY_KEYS.ORDER_LIST] },
  });

export const useOrders = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.ORDER_LIST, client.language],
    queryFn: listOrders(client),
  });

export const useOneItemRefundMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: MUTATION_KEYS.ONE_ITEM_REFUND,
    mutationFn: refundOneItemFromOrder(client),
    meta: { invalidates: [QUERY_KEYS.ORDER_LIST] },
  });

export const useOrderRefundMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: MUTATION_KEYS.ALL_ORDER_REFUND,
    mutationFn: refundAllItemsInOrder(client),
    meta: { invalidates: [QUERY_KEYS.ORDER_LIST] },
  });

export const useOptionsOfOneItemInOrderPatchMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: MUTATION_KEYS.CART_ITEM_APPEND,
    mutationFn: patchOrderOptions(client),
    meta: { invalidates: [QUERY_KEYS.ORDER_LIST] },
  });

export const usePatrons = (client: BackendAPIClient, year: number) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PATRONS, year],
    queryFn: listPatrons(client, year),
  });

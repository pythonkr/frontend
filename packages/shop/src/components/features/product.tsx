import * as React from "react";
import * as R from "remeda";

import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  ButtonProps,
  CircularProgress,
  Divider,
  List,
  Stack,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { useQueryClient } from "@tanstack/react-query";

import * as Common from "@frontend/common";
import ShopHooks from '../../hooks';
import ShopSchemas from '../../schemas';
import ShopUtils from '../../utils';
import CommonComponents from '../common';

const getCartAppendRequestPayload = (
  product: ShopSchemas.Product,
  formRef: React.RefObject<HTMLFormElement | null>
): ShopSchemas.CartItemAppendRequest => {
  if (!Common.Utils.isFormValid(formRef.current))
    throw new Error("Form is not valid");

  const options = Object.entries(
    Common.Utils.getFormValue<{ [key: string]: string }>({
      form: formRef.current,
    })
  ).map(([product_option_group, value]) => {
    const optionGroup = product.option_groups.find(
      (group) => group.id === product_option_group
    );
    if (!optionGroup)
      throw new Error(`Option group ${product_option_group} not found`);

    const product_option = optionGroup.is_custom_response ? null : value;
    const custom_response = optionGroup.is_custom_response ? value : null;
    return { product_option_group, product_option, custom_response };
  });
  return { product: product.id, options };
};

const getProductNotPurchasableReason = (
  product: ShopSchemas.Product
): string | null => {
  // 상품이 구매 가능 기간 내에 있고, 상품이 매진되지 않았으며, 매진된 상품 옵션 재고가 없으면 true
  const now = new Date();
  const orderableStartsAt = new Date(product.orderable_starts_at);
  const orderableEndsAt = new Date(product.orderable_ends_at);
  if (orderableStartsAt > now)
    return `아직 구매할 수 없어요!\n(${orderableStartsAt.toLocaleString()}부터 구매하실 수 있어요.)`;
  if (orderableEndsAt < now) return "판매가 종료됐어요!";

  if (R.isNumber(product.leftover_stock) && product.leftover_stock <= 0)
    return "상품이 품절되었어요!";
  if (
    product.option_groups.some(
      (og) =>
        !R.isEmpty(og.options) &&
        og.options.every(
          (o) => R.isNumber(o.leftover_stock) && o.leftover_stock <= 0
        )
    )
  )
    return "선택 가능한 상품 옵션이 모두 품절되어 구매할 수 없어요!";

  return null;
};

const NotPurchasable: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Typography
      variant="body1"
      color="error"
      sx={{ width: "100%", textAlign: "center", mt: "2rem", mb: "1rem" }}
    >
      {children}
    </Typography>
  );
};

const ProductItem: React.FC<{
  product: ShopSchemas.Product;
  onPaymentCompleted?: () => void;
}> = ({ product, onPaymentCompleted }) => {
  const optionFormRef = React.useRef<HTMLFormElement>(null);

  const queryClient = useQueryClient();
  const oneItemOrderStartMutation = ShopHooks.usePrepareOneItemOrderMutation();
  const addItemToCartMutation = ShopHooks.useAddItemToCartMutation();

  const addItemToCart = () =>
    addItemToCartMutation.mutate(
      getCartAppendRequestPayload(product, optionFormRef)
    );
  const oneItemOrderStart = () =>
    oneItemOrderStartMutation.mutate(
      getCartAppendRequestPayload(product, optionFormRef),
      {
        onSuccess: (order: ShopSchemas.Order) => {
          ShopUtils.startPortOnePurchase(
            order,
            () => {
              queryClient.invalidateQueries();
              queryClient.resetQueries();
              onPaymentCompleted?.();
            },
            (response) => alert("결제를 실패했습니다!\n" + response.error_msg),
            () => {}
          );
        },
        onError: (error) =>
          alert(
            error.message ||
              "결제 준비 중 문제가 발생했습니다,\n잠시 후 다시 시도해주세요."
          ),
      }
    );

  const formOnSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const disabled =
    oneItemOrderStartMutation.isPending || addItemToCartMutation.isPending;

  const notPurchasableReason = getProductNotPurchasableReason(product);
  const actionButtonProps: ButtonProps = {
    variant: "contained",
    color: "secondary",
    disabled,
  };

  return (
    <Accordion sx={{ width: "100%" }}>
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ m: "0" }}>
        <Typography variant="h6">{product.name}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: "0", pb: "1rem", px: "2rem" }}>
        <Common.Components.MDXRenderer text={product.description || ""} />
        <br />
        <Divider />
        <CommonComponents.SignInGuard
          fallback={
            <NotPurchasable>
              로그인 후 장바구니에 담거나 구매할 수 있어요.
            </NotPurchasable>
          }
        >
          {R.isNullish(notPurchasableReason) ? (
            <>
              <br />
              <form ref={optionFormRef} onSubmit={formOnSubmit}>
                <Stack spacing={2}>
                  {product.option_groups.map((group) => (
                    <CommonComponents.OptionGroupInput
                      key={group.id}
                      optionGroup={group}
                      options={group.options}
                      defaultValue={group?.options[0]?.id || ""}
                      disabled={disabled}
                    />
                  ))}
                </Stack>
              </form>
              <br />
              <Divider />
              <br />
              <Typography variant="h6" sx={{ textAlign: "right" }}>
                결제 금액:{" "}
                <CommonComponents.PriceDisplay price={product.price} />
              </Typography>
            </>
          ) : (
            <NotPurchasable>{notPurchasableReason}</NotPurchasable>
          )}
        </CommonComponents.SignInGuard>
      </AccordionDetails>
      {R.isNullish(notPurchasableReason) && (
        <AccordionActions sx={{ pt: "0", pb: "1rem", px: "2rem" }}>
          <Button {...actionButtonProps} onClick={addItemToCart}>
            장바구니 담기
          </Button>
          <Button {...actionButtonProps} onClick={oneItemOrderStart}>
            즉시 구매
          </Button>
        </AccordionActions>
      )}
    </Accordion>
  );
};

export const ProductList: React.FC = () => {
  const WrappedProductList: React.FC = () => {
    const { data } = ShopHooks.useProducts();
    return (
      <List>
        {data.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </List>
    );
  };

  return <ErrorBoundary fallback={<div>상품 목록을 불러오는 중 문제가 발생했습니다.</div>}>
    <Suspense fallback={<CircularProgress />}>
      <WrappedProductList />
    </Suspense>
  </ErrorBoundary>;
};

import { OneDetailsOpener, PrimaryStyledDetails } from "@frontend/common/components/mdx_components";
import { AccordionProps, Backdrop, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { FC, ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { isArray } from "remeda";

import { formatBackendErrorMessage } from "@frontend/shop/apis";
import {
  CustomerInfoFormDialog,
  OrderProductRelationOptionInput,
  PriceDisplay,
  SignInGuard,
  TicketInfoDisplay,
} from "@frontend/shop/components/common";
import { useCart, usePrepareCartOrderMutation, useRemoveItemFromCartMutation, useShopClient, useShopContext } from "@frontend/shop/hooks";
import type { Cart, CustomerInfo, OrderProductItem } from "@frontend/shop/schemas";
import { startPortOnePurchase } from "@frontend/shop/utils";

const CartItem: FC<
  Omit<AccordionProps, "children"> & {
    language: "ko" | "en";
    cartProdRel: OrderProductItem;
    removeItemFromCartFunc: (cartProductId: string) => void;
    disabled?: boolean;
  }
> = ({ language, cartProdRel, disabled, removeItemFromCartFunc, ...props }) => {
  const { control } = useForm<Record<string, unknown>>();
  const cannotModifyOptionsStr =
    language === "ko"
      ? "상품 옵션을 수정하려면 장바구니에서 상품을 삭제한 후 다시 담아주세요."
      : "To modify product options, please remove the item from the cart and add it again.";
  const productPriceStr = language === "ko" ? "상품 가격" : "Product Price";
  const removeFromCartStr = language === "ko" ? "장바구니에서 상품 삭제" : "Remove from Cart";

  return (
    <PrimaryStyledDetails
      {...props}
      summary={cartProdRel.product.name}
      actions={[
        <Button
          variant="contained"
          color="secondary"
          onClick={() => removeItemFromCartFunc(cartProdRel.id)}
          disabled={disabled}
          children={removeFromCartStr}
        />,
      ]}
    >
      {cartProdRel.ticket_info && <TicketInfoDisplay language={language} ticketInfo={cartProdRel.ticket_info} />}
      <Stack spacing={2} sx={{ width: "100%" }}>
        {cartProdRel.options.map((optionRel) => (
          <OrderProductRelationOptionInput
            key={optionRel.product_option_group.id + (optionRel.product_option?.id || "")}
            optionRel={optionRel}
            disabled
            disabledReason={cannotModifyOptionsStr}
            control={control}
          />
        ))}
      </Stack>
      <br />
      <Divider />
      <br />
      <Typography variant="h6" sx={{ textAlign: "end" }}>
        {productPriceStr}: <PriceDisplay price={cartProdRel.price + cartProdRel.donation_price} />
      </Typography>
    </PrimaryStyledDetails>
  );
};

type CartStatusStateType = {
  openDialog: boolean;
  openBackdrop: boolean;
};

/**
 * 로그인 사용자의 장바구니 상태를 보여주는 컴포넌트. 담긴 상품 목록·총 결제 금액·결제 버튼을 렌더하고,
 * 상품 삭제와 (고객 정보 입력 후) 결제 진행까지 처리한다. 비로그인 시에는 로그인 안내를 보여준다.
 * @example <Shop__Feature__CartStatus />
 */
export const CartStatus: FC = Suspense.with({ fallback: <CircularProgress /> }, () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language, shopImpAccountId } = useShopContext();
  const shopAPIClient = useShopClient();
  const cartOrderStartMutation = usePrepareCartOrderMutation(shopAPIClient);
  const removeItemFromCartMutation = useRemoveItemFromCartMutation(shopAPIClient);
  const [state, setState] = useState<CartStatusStateType>({
    openDialog: false,
    openBackdrop: false,
  });

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const cartIsEmptyStr = language === "ko" ? "장바구니가 비어있어요!" : "Your cart is empty!";
  const totalPriceStr = language === "ko" ? "총 결제 금액" : "Total Payment Amount";
  const orderCartStr = language === "ko" ? "장바구니에 담긴 상품 결제" : "Pay for Items in Cart";
  const succeededToRemoveItemFromCartStr = language === "ko" ? "장바구니에서 상품을 삭제했습니다." : "Item has been removed from the cart.";
  const errorWhileLoadingCartStr =
    language === "ko" ? "장바구니 정보를 불러오는 중 문제가 발생했습니다." : "An error occurred while loading the cart information.";
  const errorWhilePreparingOrderStr =
    language === "ko"
      ? "장바구니 결제 준비 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요."
      : "An error occurred while preparing the cart order.\nPlease try again later.";
  const failedToOrderStr =
    language === "ko"
      ? "장바구니 결제에 실패했습니다.\n잠시 후 다시 시도해주세요.\n"
      : "Failed to complete the cart order.\nPlease try again later.\n";

  const removeItemFromCart = (cartProductId: string) =>
    removeItemFromCartMutation.mutate(
      { cartProductId },
      {
        onSuccess: () => addSnackbar(succeededToRemoveItemFromCartStr, "success"),
        onError: (error) => addSnackbar(formatBackendErrorMessage(error, errorWhilePreparingOrderStr), "error"),
      }
    );

  const openDialog = () => setState((ps) => ({ ...ps, openDialog: true }));
  const closeDialog = () => setState((ps) => ({ ...ps, openDialog: false }));
  const openBackdrop = () => setState((ps) => ({ ...ps, openBackdrop: true }));
  const closeBackdrop = () => setState((ps) => ({ ...ps, openBackdrop: false }));

  const onFormSubmit = (formData: CustomerInfo) => {
    closeDialog();
    openBackdrop();
    cartOrderStartMutation.mutate(formData, {
      onSuccess: (order: Cart) => {
        startPortOnePurchase(
          shopImpAccountId,
          order,
          () => {
            queryClient.invalidateQueries();
            queryClient.resetQueries();
            navigate("/store/thank-you-for-your-purchase");
          },
          (response) => alert(failedToOrderStr + response.error_msg),
          closeBackdrop
        );
      },
      onError: (error) => {
        alert(formatBackendErrorMessage(error, errorWhilePreparingOrderStr));
        closeBackdrop();
      },
    });
  };

  const disabled = removeItemFromCartMutation.isPending || cartOrderStartMutation.isPending;

  const WrappedShopCartList: FC = () => {
    const { data } = useCart(shopAPIClient);

    return !isArray(data.products) || data.products.length === 0 ? (
      <Typography variant="body1" color="error">
        {cartIsEmptyStr}
      </Typography>
    ) : (
      <>
        <Backdrop sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })} open={state.openBackdrop} onClick={() => {}} />
        <CustomerInfoFormDialog open={state.openDialog} closeFunc={closeDialog} onSubmit={onFormSubmit} defaultValue={data.customer_info} />
        <Stack spacing={2}>
          <OneDetailsOpener>
            {data.products.map((prodRel) => (
              <CartItem language={language} key={prodRel.id} cartProdRel={prodRel} disabled={disabled} removeItemFromCartFunc={removeItemFromCart} />
            ))}
          </OneDetailsOpener>
        </Stack>
        <br />
        <Divider />
        <Typography variant="h6" sx={{ textAlign: "end" }}>
          {totalPriceStr}: <PriceDisplay price={data.first_paid_price} />
        </Typography>
        <Button variant="contained" color="secondary" onClick={openDialog} disabled={disabled}>
          {orderCartStr}
        </Button>
      </>
    );
  };

  return (
    <SignInGuard>
      <ErrorBoundary fallback={errorWhileLoadingCartStr}>
        <Suspense fallback={<CircularProgress />}>
          <WrappedShopCartList />
        </Suspense>
      </ErrorBoundary>
    </SignInGuard>
  );
});

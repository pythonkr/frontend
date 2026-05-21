import {
  AccordionProps,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { FC, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { isNullish } from "remeda";

import { OneDetailsOpener, PrimaryStyledDetails } from "@frontend/common/components/mdx_components";
import { useBackendContext } from "@frontend/common/hooks/useAPI";
import { formatBackendErrorMessage } from "@frontend/shop/apis";
import { OrderProductRelationOptionInput, PriceDisplay, SignInGuard } from "@frontend/shop/components/common";
import {
  useOneItemRefundMutation,
  useOptionsOfOneItemInOrderPatchMutation,
  useOrderRefundMutation,
  useOrders,
  useShopClient,
  useShopContext,
} from "@frontend/shop/hooks";
import type { Order, OrderOptionsPatchRequest, OrderProductItem, PaymentHistoryStatus } from "@frontend/shop/schemas";
import { isOrderProductOptionModifiable } from "@frontend/shop/utils";

const PaymentHistoryStatusKo: {
  [k in PaymentHistoryStatus]: string;
} = {
  pending: "결제 대기중",
  completed: "결제 완료",
  partial_refunded: "부분 환불됨",
  refunded: "환불됨",
};

const PaymentHistoryStatusEn: {
  [k in PaymentHistoryStatus]: string;
} = {
  pending: "Pending",
  completed: "Completed",
  partial_refunded: "Partially refunded",
  refunded: "Refunded",
};

type OrderProductRelationItemProps = Omit<AccordionProps, "children"> & {
  language: "ko" | "en";
  order: Order;
  prodRel: OrderProductItem;
  isPending: boolean;
  oneItemRefundMutation: ReturnType<typeof useOneItemRefundMutation>;
  optionsOfOneItemInOrderPatchMutation: ReturnType<typeof useOptionsOfOneItemInOrderPatchMutation>;
};

const OrderProductRelationItem: FC<OrderProductRelationItemProps> = ({
  language,
  order,
  prodRel,
  isPending,
  oneItemRefundMutation,
  optionsOfOneItemInOrderPatchMutation,
  ...props
}) => {
  const { control, handleSubmit, getValues } = useForm<Record<string, string>>();
  const currentCustomOptionValues: { [k: string]: string } = prodRel.options
    .filter((optionRel) => isOrderProductOptionModifiable(optionRel))
    .reduce(
      (acc, optionRel) => ({
        ...acc,
        [optionRel.id]: optionRel.custom_response,
      }),
      {}
    );

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const hasPatchableOption = Object.entries(currentCustomOptionValues).length > 0;
  const patchOptionBtnDisabled = isPending || !hasPatchableOption || order.current_status === "refunded";

  const refundOneProductStr = language === "ko" ? "단일 상품 환불" : "Refund one item";
  const refundedStr = language === "ko" ? "환불됨" : "Refunded";
  const modifyOptionStr = language === "ko" ? "옵션 수정" : "Modify options";
  const succeededToRefundOrderStr = language === "ko" ? "주문을 환불했습니다!" : "Successfully refunded the order!";
  const failedToRefundOrderStr =
    language === "ko"
      ? "주문에 포함된 상품을 환불하는 중 문제가 발생했습니다,\n잠시 후 다시 시도해주세요."
      : "An error occurred while refunding the order,\nplease try again later.";
  const succeededToPatchOptionsStr = language === "ko" ? "옵션이 수정되었습니다." : "Options have been modified successfully.";
  const failedToPatchOptionsStr =
    language === "ko"
      ? "옵션 수정 중 문제가 발생했습니다,\n잠시 후 다시 시도해주세요."
      : "An error occurred while modifying the options,\nplease try again later.";

  const refundBtnDisabled = isPending || !isNullish(prodRel.not_refundable_reason);
  const refundBtnText = isNullish(prodRel.not_refundable_reason)
    ? refundOneProductStr
    : prodRel.status === "refunded"
      ? refundedStr
      : prodRel.not_refundable_reason;

  const scanCodeDisabled = isPending || prodRel.status === "refunded";
  const scanCodeBtnText = language === "ko" ? "등록 QR 코드" : "Registeration QR Code";

  const refundOneItem = () =>
    oneItemRefundMutation.mutate(
      { order_id: order.id, order_product_relation_id: prodRel.id },
      {
        onSuccess: () => addSnackbar(succeededToRefundOrderStr, "success"),
        onError: (error) => addSnackbar(formatBackendErrorMessage(error, failedToRefundOrderStr), "error"),
      }
    );
  const patchOneItemOptions = () => {
    const formValues = getValues();
    const modifiedCustomOptionValues: OrderOptionsPatchRequest["options"] = Object.entries(formValues)
      .map(([key, value]) => {
        // 여기서 key는 order_product_option_relation의 id가 아니라 product_option_group의 id이므로, order_product_option_relation의 id로 변경해야 함
        const optionRel = prodRel.options.find((option) => option.product_option_group.id === key);
        if (!optionRel) throw new Error(`Option relation for group ${key} not found in product relation ${prodRel.id}`);
        return [optionRel.id, value];
      })
      .filter(([key, value]) => currentCustomOptionValues[key] !== value)
      .map(([key, value]) => ({
        order_product_option_relation: key,
        custom_response: value,
      }));

    optionsOfOneItemInOrderPatchMutation.mutate(
      {
        order_id: order.id,
        order_product_relation_id: prodRel.id,
        options: modifiedCustomOptionValues,
      },
      {
        onSuccess: () => addSnackbar(succeededToPatchOptionsStr, "success"),
        onError: (error) => addSnackbar(formatBackendErrorMessage(error, failedToPatchOptionsStr), "error"),
      }
    );
  };

  const actionButtons = (
    <Stack direction="column" flexGrow={1} spacing={2}>
      {prodRel.scancode_url && (
        <a href={prodRel.scancode_url} target="_blank" rel="noopener noreferrer">
          <Button variant="contained" fullWidth children={scanCodeBtnText} disabled={scanCodeDisabled} />
        </a>
      )}
      <Stack direction="row" flexGrow={1} spacing={2}>
        <Button variant="contained" fullWidth onClick={patchOneItemOptions} disabled={patchOptionBtnDisabled}>
          {modifyOptionStr}
        </Button>
        <Button variant="contained" fullWidth onClick={refundOneItem} disabled={refundBtnDisabled}>
          {refundBtnText}
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <PrimaryStyledDetails {...props} key={prodRel.id} summary={<Typography variant="h6">{prodRel.product.name}</Typography>} actions={actionButtons}>
      <form onSubmit={handleSubmit(() => {})}>
        <Stack spacing={2} sx={{ width: "100%" }}>
          {prodRel.options.map((optionRel) => (
            <OrderProductRelationOptionInput
              key={optionRel.product_option_group.id + (optionRel.product_option?.id || "")}
              optionRel={optionRel}
              disabled={isPending}
              control={control}
            />
          ))}
        </Stack>
      </form>
    </PrimaryStyledDetails>
  );
};

type OrderItemProps = Omit<AccordionProps, "children"> & { order: Order; disabled?: boolean };

const OrderItem: FC<OrderItemProps> = ({ order, disabled, ...props }) => {
  const { language } = useShopContext();
  const { backendApiDomain } = useBackendContext();
  const shopAPIClient = useShopClient();
  const orderRefundMutation = useOrderRefundMutation(shopAPIClient);
  const oneItemRefundMutation = useOneItemRefundMutation(shopAPIClient);
  const optionsOfOneItemInOrderPatchMutation = useOptionsOfOneItemInOrderPatchMutation(shopAPIClient);

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const PaymentHistoryStatus = language === "ko" ? PaymentHistoryStatusKo : PaymentHistoryStatusEn;
  const refundFullOrderStr = language === "ko" ? "주문 전체 환불" : "Refund full order";
  const orderFullyRefundedStr = language === "ko" ? "주문 전체 환불됨" : "Order fully refunded";
  const receiptStr = language === "ko" ? "영수증" : "Receipt";
  const orderedPriceStr = language === "ko" ? "주문 결제 금액" : "Ordered Price";
  const statusStr = language === "ko" ? "상태" : "Status";
  const productsInOrderStr = language === "ko" ? "주문 상품 목록" : "Products in Order";
  const succeededToRefundFullOrderStr = language === "ko" ? "주문을 환불했습니다!" : "Successfully refunded the order!";
  const failedToRefundFullOrderStr =
    language === "ko"
      ? "주문 환불 중 문제가 발생했습니다,\n잠시 후 다시 시도해주세요."
      : "An error occurred while refunding the order,\nplease try again later.";

  const refundOrder = () =>
    orderRefundMutation.mutate(
      { order_id: order.id },
      {
        onSuccess: () => addSnackbar(succeededToRefundFullOrderStr, "success"),
        onError: (error) => addSnackbar(formatBackendErrorMessage(error, failedToRefundFullOrderStr), "error"),
      }
    );
  const openReceipt = () => window.open(`${backendApiDomain}/v1/shop/orders/${order.id}/receipt/`, "_blank");

  const isPending = disabled || orderRefundMutation.isPending || oneItemRefundMutation.isPending || optionsOfOneItemInOrderPatchMutation.isPending;
  const refundBtnDisabled = isPending || !isNullish(order.not_fully_refundable_reason);
  const receipyBtnDisabled = isPending || order.current_status === "pending";
  const btnText = isNullish(order.not_fully_refundable_reason)
    ? refundFullOrderStr
    : order.current_status === "refunded"
      ? orderFullyRefundedStr
      : order.not_fully_refundable_reason;
  const orderInfoStr = language === "ko" ? "주문 정보" : "Order Information";
  const orderCustomerInfoStr = language === "ko" ? "주문 고객 정보" : "Order Customer Information";
  const customerNameStr = language === "ko" ? "고객명" : "Customer Name";
  const customerOrganizationStr = language === "ko" ? "고객 소속" : "Customer Organization";
  const customerEmailStr = language === "ko" ? "고객 이메일" : "Customer Email";
  const customerPhoneStr = language === "ko" ? "고객 연락처" : "Customer Phone";

  const actionButtons = (
    <>
      <Button variant="contained" fullWidth onClick={openReceipt} disabled={receipyBtnDisabled} children={receiptStr} />
      <Button variant="contained" fullWidth onClick={refundOrder} disabled={refundBtnDisabled} children={btnText} />
    </>
  );

  return (
    <PrimaryStyledDetails {...props} summary={order.name} actions={actionButtons}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: "30%" }} />
            <TableCell align="left" sx={{ width: "70%" }} />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold" }} children={orderInfoStr} />
          </TableRow>
          <TableRow>
            <TableCell children={orderedPriceStr} />
            <TableCell children={<PriceDisplay price={order.first_paid_price} />} />
          </TableRow>
          <TableRow>
            <TableCell children={statusStr} />
            <TableCell children={PaymentHistoryStatus[order.current_status]} />
          </TableRow>
          {order.customer_info && (
            <>
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold" }} children={orderCustomerInfoStr} />
              </TableRow>
              <TableRow>
                <TableCell children={customerNameStr} />
                <TableCell children={order.customer_info.name} />
              </TableRow>
              <TableRow>
                <TableCell children={customerOrganizationStr} />
                <TableCell children={order.customer_info.organization || "N/A"} />
              </TableRow>
              <TableRow>
                <TableCell children={customerEmailStr} />
                <TableCell children={order.customer_info.email} />
              </TableRow>
              <TableRow>
                <TableCell children={customerPhoneStr} />
                <TableCell children={order.customer_info.phone} />
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
      <br />
      <Typography variant="h6">{productsInOrderStr}</Typography>
      <br />
      <Stack spacing={2}>
        <OneDetailsOpener>
          {order.products.map((prodRel) => (
            <OrderProductRelationItem
              key={prodRel.id}
              language={language}
              order={order}
              prodRel={prodRel}
              isPending={isPending}
              oneItemRefundMutation={oneItemRefundMutation}
              optionsOfOneItemInOrderPatchMutation={optionsOfOneItemInOrderPatchMutation}
            />
          ))}
        </OneDetailsOpener>
      </Stack>
      <br />
      <Divider />
    </PrimaryStyledDetails>
  );
};

const WrappedOrderList: FC = () => {
  const shopAPIClient = useShopClient();
  const { data } = useOrders(shopAPIClient);

  return (
    <OneDetailsOpener>
      {data.map((item) => (
        <OrderItem key={item.id} order={item} />
      ))}
    </OneDetailsOpener>
  );
};

export const OrderList: FC = () => (
  <SignInGuard>
    <ErrorBoundary fallback={<div>주문 내역을 불러오는 중 문제가 발생했습니다.</div>}>
      <Suspense fallback={<CircularProgress />}>
        <Stack spacing={2}>
          <WrappedOrderList />
        </Stack>
      </Suspense>
    </ErrorBoundary>
  </SignInGuard>
);

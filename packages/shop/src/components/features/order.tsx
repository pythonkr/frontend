import * as React from "react";
import * as R from "remeda";

import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  Divider,
  List,
  Stack,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";

import * as Common from "@frontend/common";
import ShopHooks from '../../hooks';
import ShopSchemas from '../../schemas';
import ShopUtils from '../../utils';
import CommonComponents from '../common';

const PaymentHistoryStatusTranslated: {
  [k in ShopSchemas.PaymentHistoryStatus]: string;
} = {
  pending: "결제 대기중",
  completed: "결제 완료",
  partial_refunded: "부분 환불됨",
  refunded: "환불됨",
};

const OrderItem: React.FC<{
  order: ShopSchemas.Order;
  disabled?: boolean;
}> = ({ order, disabled }) => {
  const orderRefundMutation = ShopHooks.useOrderRefundMutation();
  const oneItemRefundMutation = ShopHooks.useOneItemRefundMutation();
  const optionsOfOneItemInOrderPatchMutation = ShopHooks.useOptionsOfOneItemInOrderPatchMutation();

  const refundOrder = () => orderRefundMutation.mutate({ order_id: order.id });
  const openReceipt = () => window.open(ShopUtils.getReceiptUrlFromOrder(order), "_blank");

  const isPending =
    disabled ||
    orderRefundMutation.isPending ||
    oneItemRefundMutation.isPending ||
    optionsOfOneItemInOrderPatchMutation.isPending;
  const btnDisabled =
    isPending || !R.isNullish(order.not_fully_refundable_reason);
  const btnText = R.isNullish(order.not_fully_refundable_reason)
    ? "주문 전체 환불"
    : order.current_status === "refunded"
      ? "주문 전체 환불됨"
      : order.not_fully_refundable_reason;

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">{order.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Divider />
        <br />
        <Typography variant="body1">
          주문 결제 금액 :{" "}
          <CommonComponents.PriceDisplay price={order.current_paid_price} />
        </Typography>
        <Typography variant="body1">
          상태: {PaymentHistoryStatusTranslated[order.current_status]}
        </Typography>
        <br />
        <Divider />
        <br />
        <Typography variant="body1">주문 상품 목록</Typography>
        <br />
        {order.products.map((prodRels) => {
          const formRef = React.useRef<HTMLFormElement>(null);
          const currentCustomOptionValues: { [k: string]: string } =
            prodRels.options
              .filter((optionRel) =>
                ShopUtils.isOrderProductOptionModifiable(optionRel)
              )
              .reduce(
                (acc, optionRel) => ({
                  ...acc,
                  [optionRel.product_option_group.id]:
                    optionRel.custom_response,
                }),
                {}
              );

          const hasPatchableOption =
            Object.entries(currentCustomOptionValues).length > 0;
          const patchOptionBtnDisabled = isPending || !hasPatchableOption;

          const refundBtnDisabled =
            isPending || !R.isNullish(prodRels.not_refundable_reason);
          const refundBtnText = R.isNullish(prodRels.not_refundable_reason)
            ? "단일 상품 환불"
            : prodRels.status === "refunded"
              ? "환불됨"
              : prodRels.not_refundable_reason;

          const refundOneItem = () =>
            oneItemRefundMutation.mutate({
              order_id: order.id,
              order_product_relation_id: prodRels.id,
            });
          const patchOneItemOptions = () => {
            if (!Common.Utils.isFormValid(formRef.current))
              throw new Error("Form is not valid");

            const modifiedCustomOptionValues: ShopSchemas.OrderOptionsPatchRequest["options"] =
              Object.entries(
                Common.Utils.getFormValue<{ [key: string]: string }>({
                  form: formRef.current,
                })
              )
                .filter(
                  ([key, value]) => currentCustomOptionValues[key] !== value
                )
                .map(([key, value]) => ({
                  order_product_option_relation: key,
                  custom_response: value,
                }));

            optionsOfOneItemInOrderPatchMutation.mutate({
              order_id: order.id,
              order_product_relation_id: prodRels.id,
              options: modifiedCustomOptionValues,
            });
          };

          return (
            <Accordion key={prodRels.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                {prodRels.product.name}
              </AccordionSummary>
              <AccordionDetails>
                <form
                  ref={formRef}
                  onSubmit={(e) => {
                    e.preventDefault();
                    patchOneItemOptions();
                  }}
                >
                  <Stack spacing={2} sx={{ width: "100%" }}>
                    {prodRels.options.map((optionRel) => (
                      <CommonComponents.OrderProductRelationOptionInput
                        key={
                          optionRel.product_option_group.id +
                          (optionRel.product_option?.id || "")
                        }
                        optionRel={optionRel}
                        disabled={isPending}
                      />
                    ))}
                  </Stack>
                </form>
              </AccordionDetails>
              <AccordionActions>
                <Button
                  variant="contained"
                  sx={{ width: "100%" }}
                  onClick={patchOneItemOptions}
                  disabled={patchOptionBtnDisabled}
                >
                  옵션 수정
                </Button>
                <Button
                  variant="contained"
                  sx={{ width: "100%" }}
                  onClick={refundOneItem}
                  disabled={refundBtnDisabled}
                >
                  {refundBtnText}
                </Button>
              </AccordionActions>
            </Accordion>
          );
        })}
        <br />
        <Divider />
      </AccordionDetails>
      <AccordionActions>
        <Button
          variant="contained"
          sx={{ width: "100%" }}
          onClick={openReceipt}
          disabled={btnDisabled}
        >
          영수증
        </Button>
        <Button
          variant="contained"
          sx={{ width: "100%" }}
          onClick={refundOrder}
          disabled={btnDisabled}
        >
          {btnText}
        </Button>
      </AccordionActions>
    </Accordion>
  );
};

export const OrderList: React.FC = () => {
  const WrappedOrderList: React.FC = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = ShopHooks.useOrders();

    return (
      <List>
        {data.map((item) => (
          <OrderItem key={item.id} order={item} />
        ))}
      </List>
    );
  };

  return <CommonComponents.SignInGuard>
    <ErrorBoundary fallback={<div>주문 내역을 불러오는 중 문제가 발생했습니다.</div>}>
      <Suspense fallback={<CircularProgress />}>
        <WrappedOrderList />
      </Suspense>
    </ErrorBoundary>
  </CommonComponents.SignInGuard>;
};

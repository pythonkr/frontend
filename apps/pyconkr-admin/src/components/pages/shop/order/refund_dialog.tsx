import { useBackendAdminClient } from "@frontend/common/hooks/useAdminAPI";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { FC, ReactNode } from "react";

import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

import { OrderAdmin, SimpleOrderProductRelation } from "./types";

const formatPrice = (price: number) => `₩${price.toLocaleString()}`;

type RefundDialogProps = {
  open: boolean;
  onClose: () => void;
  order: OrderAdmin;
};

type RefundVariant = { kind: "order" } | { kind: "product"; relation: SimpleOrderProductRelation };

type RefundView = {
  title: string;
  subjectLabel: string;
  subjectName: string;
  priceNode: ReactNode;
  warning: ReactNode;
  url: string;
  successMessage: string;
};

const buildView = (target: { order: OrderAdmin } & RefundVariant): RefundView => {
  const { order } = target;
  if (target.kind === "order") {
    const name = order.name_ko || order.str_repr;
    return {
      title: "전액 환불",
      subjectLabel: "주문",
      subjectName: name,
      priceNode: (
        <>
          현재 결제액: <strong>{formatPrice(order.current_paid_price)}</strong>
        </>
      ),
      warning: (
        <>
          <strong>전액 환불</strong>만 지원됩니다. 환불 가능한 상태의 모든 상품이 환불 처리되며, 이 작업은 되돌릴 수 없습니다.
        </>
      ),
      url: `v1/admin-api/shop/order/${order.id}/refund/`,
      successMessage: `주문 '${name}'의 전액 환불(${formatPrice(order.current_paid_price)})이 처리되었습니다.`,
    };
  }

  const { relation } = target;
  const name = relation.product.name_ko || relation.product.name_en;
  const refundPrice = relation.price + relation.donation_price;
  return {
    title: "상품 부분 환불",
    subjectLabel: "상품",
    subjectName: name,
    priceNode: (
      <>
        환불 금액: <strong>{formatPrice(refundPrice)}</strong>
        {relation.donation_price > 0 && (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            (상품 {formatPrice(relation.price)} + 기부 {formatPrice(relation.donation_price)})
          </Typography>
        )}
      </>
    ),
    warning: "이 상품만 환불 처리됩니다. 이 작업은 되돌릴 수 없습니다.",
    url: `v1/admin-api/shop/order/${order.id}/products/${relation.id}/refund/`,
    successMessage: `상품 '${name}'의 환불(${formatPrice(refundPrice)})이 처리되었습니다.`,
  };
};

export const RefundDialog: FC<RefundDialogProps & RefundVariant> = ({ open, onClose, ...target }) => {
  const client = useBackendAdminClient();
  const view = buildView(target);

  const refundMutation = useMutation({
    mutationFn: async () => {
      return client.post<void, Record<string, never>>(view.url, {});
    },
    onSuccess: () => {
      addSnackbar(view.successMessage, "success");
      onClose();
    },
    onError: addErrorSnackbar,
  });

  const disabled = refundMutation.isPending;

  const onSubmit = () => {
    refundMutation.mutate();
  };

  return (
    <Dialog open={open} onClose={disabled ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{view.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2">
            {view.subjectLabel}: <strong>{view.subjectName}</strong>
          </Typography>
          <Typography variant="body2">{view.priceNode}</Typography>
          <Alert severity="warning">{view.warning}</Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={disabled}>
          취소
        </Button>
        <Button variant="contained" color="error" onClick={onSubmit} disabled={disabled}>
          환불 처리
        </Button>
      </DialogActions>
    </Dialog>
  );
};

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { FC, useState } from "react";

import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";
import { useBackendAdminClient } from "@frontend/common/hooks/useAdminAPI";

import { OrderAdmin } from "./types";

type RefundDialogProps = {
  open: boolean;
  onClose: () => void;
  order: OrderAdmin;
};

const formatPrice = (price: number) => `₩${price.toLocaleString()}`;

export const RefundDialog: FC<RefundDialogProps> = ({ open, onClose, order }) => {
  const client = useBackendAdminClient();
  const [totp, setTotp] = useState("");
  const [touched, setTouched] = useState(false);

  // open 변경 시 폼 초기화 (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setTotp("");
      setTouched(false);
    }
  }

  const refundMutation = useMutation({
    mutationFn: async (totpCode: string) => {
      return client.post<void, Record<string, string>>(`v1/admin-api/shop/orders/${order.id}/refund/?totp=${encodeURIComponent(totpCode)}`, {
        totp: totpCode,
      });
    },
    onSuccess: () => {
      addSnackbar(`주문 '${order.name_ko || order.str_repr}'의 전액 환불(${formatPrice(order.current_paid_price)})이 처리되었습니다.`, "success");
      onClose();
    },
    onError: addErrorSnackbar,
  });

  const totpInvalid = touched && totp.trim().length === 0;
  const disabled = refundMutation.isPending;

  const onSubmit = () => {
    setTouched(true);
    if (totp.trim().length === 0) return;
    refundMutation.mutate(totp.trim());
  };

  return (
    <Dialog open={open} onClose={disabled ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>환불 처리</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2">
            주문: <strong>{order.name_ko || order.str_repr}</strong>
          </Typography>
          <Typography variant="body2">
            현재 결제액: <strong>{formatPrice(order.current_paid_price)}</strong>
          </Typography>

          <Alert severity="warning">
            <strong>전액 환불</strong>만 지원됩니다. 환불 가능한 상태의 모든 상품이 환불 처리되며, 이 작업은 되돌릴 수 없습니다.
          </Alert>

          <TextField
            label="TOTP 인증 코드"
            required
            autoFocus
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
            error={totpInvalid}
            helperText={totpInvalid ? "TOTP 코드는 필수입니다." : "환불 권한자의 인증 앱에서 6자리 코드를 입력하세요."}
            fullWidth
            disabled={disabled}
            slotProps={{ htmlInput: { autoComplete: "one-time-code", inputMode: "numeric" } }}
          />
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

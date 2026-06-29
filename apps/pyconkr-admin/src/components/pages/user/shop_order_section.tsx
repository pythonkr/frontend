import { useBackendAdminClient, useListPaginatedQuery } from "@frontend/common/hooks/useAdminAPI";
import { Alert, Chip, CircularProgress, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC } from "react";
import { Link } from "react-router-dom";

import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { PAYMENT_STATUS_LABEL } from "@apps/pyconkr-admin/components/pages/shop/_common/status_labels";
import { PaymentStatus } from "@apps/pyconkr-admin/components/pages/shop/order/types";

type OrderListRow = {
  id: string;
  str_repr: string;
  name_ko: string;
  current_status: PaymentStatus;
  current_paid_price: number;
  first_paid_at: string | null;
  created_at: string;
};

const formatPrice = (price: number) => `₩${price.toLocaleString()}`;

const InnerShopOrderSection: FC<{ userId: string }> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, ({ userId }) => {
    const client = useBackendAdminClient();
    const ordersQuery = useListPaginatedQuery<OrderListRow>(client, "shop", "order", { user_id: userId });
    const orders = ordersQuery.data?.results ?? [];

    return (
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Divider />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">스토어 주문 내역 ({orders.length})</Typography>
        </Stack>
        <Alert severity="info" variant="outlined">
          이 사용자의 모든 스토어 주문입니다. 환불·알림 등 액션은 주문 상세 페이지에서 수행할 수 있습니다.
        </Alert>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "15%" }}>주문 ID</TableCell>
              <TableCell>이름</TableCell>
              <TableCell>상태</TableCell>
              <TableCell align="right">결제액</TableCell>
              <TableCell>결제일</TableCell>
              <TableCell>생성일</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: "text.secondary" }}>
                  주문 내역이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => {
              const status = PAYMENT_STATUS_LABEL[order.current_status] ?? { label: order.current_status, color: "default" as const };
              return (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Link to={`/shop/order/${order.id}`}>
                      <code>{order.id.slice(0, 8)}</code>
                    </Link>
                  </TableCell>
                  <TableCell>{order.name_ko || order.str_repr}</TableCell>
                  <TableCell>
                    <Chip label={status.label} size="small" color={status.color} />
                  </TableCell>
                  <TableCell align="right">{formatPrice(order.current_paid_price)}</TableCell>
                  <TableCell>{order.first_paid_at ? new Date(order.first_paid_at).toLocaleString() : "—"}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Stack>
    );
  })
);

export const ShopOrderSection: FC<{ userId: string }> = (props) => <InnerShopOrderSection {...props} />;

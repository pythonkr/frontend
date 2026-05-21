import { CurrencyExchange, NotificationsActive, Save } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { ORDER_PRODUCT_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@apps/pyconkr-admin/components/pages/shop/_common/status_labels";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";
import { useBackendAdminClient, useRetrieveQuery, useUpdateMutation } from "@frontend/common/hooks/useAdminAPI";

import { RefundDialog } from "./refund_dialog";
import { OrderAdmin, SimpleCustomerInfo, SimpleOrderProductRelation } from "./types";

const formatPrice = (price: number) => `₩${price.toLocaleString()}`;

// ----------------- Customer Info Tab (editable) -----------------
const CustomerInfoTab: FC<{ order: OrderAdmin }> = ({ order }) => {
  const client = useBackendAdminClient();
  const updateMutation = useUpdateMutation<{ customer_info: SimpleCustomerInfo }>(client, "shop", "orders", order.id);

  const [name, setName] = useState(order.customer_info?.name ?? "");
  const [phone, setPhone] = useState(order.customer_info?.phone ?? "");
  const [email, setEmail] = useState(order.customer_info?.email ?? "");
  const [organization, setOrganization] = useState(order.customer_info?.organization ?? "");

  // order.customer_info 변경 시 폼 동기화 (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  const [prevCustomerInfo, setPrevCustomerInfo] = useState(order.customer_info);
  if (prevCustomerInfo !== order.customer_info) {
    setPrevCustomerInfo(order.customer_info);
    setName(order.customer_info?.name ?? "");
    setPhone(order.customer_info?.phone ?? "");
    setEmail(order.customer_info?.email ?? "");
    setOrganization(order.customer_info?.organization ?? "");
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      addSnackbar("이름, 연락처, 이메일은 필수입니다.", "error");
      return;
    }
    updateMutation.mutate({ customer_info: { name, phone, email, organization: organization || null } } as { customer_info: SimpleCustomerInfo }, {
      onSuccess: () => addSnackbar("고객 정보를 수정했습니다.", "success"),
      onError: addErrorSnackbar,
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2}>
        {!order.customer_info && (
          <Alert severity="info" variant="outlined">
            아직 고객 정보가 입력되지 않았습니다. 저장하면 신규 생성됩니다.
          </Alert>
        )}
        <TextField label="이름" required value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        <TextField
          label="연락처"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          helperText="예: 010-1234-5678 또는 +821012345678"
        />
        <TextField label="이메일" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
        <TextField label="소속" value={organization} onChange={(e) => setOrganization(e.target.value)} fullWidth />
        <Stack direction="row" justifyContent="flex-end">
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={updateMutation.isPending}>
            고객 정보 저장
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

const OrderProductRow: FC<{ relation: SimpleOrderProductRelation }> = ({ relation }) => {
  const status = ORDER_PRODUCT_STATUS_LABEL[relation.status];
  return (
    <>
      <TableRow hover>
        <TableCell>
          <code>{relation.id.slice(0, 8)}</code>
        </TableCell>
        <TableCell>{relation.product.name_ko || relation.product.name_en}</TableCell>
        <TableCell>
          <Chip label={status.label} size="small" color={status.color} />
        </TableCell>
        <TableCell align="right">{formatPrice(relation.price)}</TableCell>
        <TableCell align="right">{relation.donation_price > 0 ? formatPrice(relation.donation_price) : "—"}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} sx={{ bgcolor: "action.hover", py: 1, pl: 4 }}>
          {relation.options.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              옵션 없음
            </Typography>
          ) : (
            <Table size="small" sx={{ width: "auto" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 140 }}>옵션 그룹</TableCell>
                  <TableCell sx={{ minWidth: 240 }}>옵션 / 입력</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relation.options.map((opt) => (
                  <TableRow key={opt.id}>
                    <TableCell>{opt.option_group_name_ko || opt.option_group_name_en}</TableCell>
                    <TableCell>
                      {opt.option_name_ko || opt.option_name_en ? (
                        opt.option_name_ko || opt.option_name_en
                      ) : (
                        <Typography component="span" variant="body2" color="text.secondary">
                          사용자 입력: {opt.custom_response || "(없음)"}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableCell>
      </TableRow>
    </>
  );
};

const OrderProductsTab: FC<{ order: OrderAdmin }> = ({ order }) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>주문 상품 ID</TableCell>
        <TableCell>상품명</TableCell>
        <TableCell>상태</TableCell>
        <TableCell align="right">가격</TableCell>
        <TableCell align="right">기부</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {order.products.length === 0 && (
        <TableRow>
          <TableCell colSpan={5} align="center" sx={{ color: "text.secondary" }}>
            주문 상품이 없습니다.
          </TableCell>
        </TableRow>
      )}
      {order.products.map((p) => (
        <OrderProductRow key={p.id} relation={p} />
      ))}
    </TableBody>
  </Table>
);

const PaymentHistoryTab: FC<{ order: OrderAdmin; onRefund: () => void }> = ({ order, onRefund }) => {
  const histories = [...order.payment_histories].sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  const canRefund = order.current_paid_price > 0 && (order.current_status === "completed" || order.current_status === "partial_refunded");

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          PortOne imp_id 기준 결제 이력입니다.
        </Typography>
        <Button variant="outlined" color="error" startIcon={<CurrencyExchange />} onClick={onRefund} disabled={!canRefund}>
          환불 처리
        </Button>
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>일시</TableCell>
            <TableCell>imp_id</TableCell>
            <TableCell>상태</TableCell>
            <TableCell align="right">금액</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {histories.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ color: "text.secondary" }}>
                결제 이력이 없습니다.
              </TableCell>
            </TableRow>
          )}
          {histories.map((h, idx) => {
            const status = PAYMENT_STATUS_LABEL[h.status] ?? { label: h.status, color: "default" as const };
            const isLatest = idx === histories.length - 1;
            return (
              <TableRow key={h.id} hover sx={isLatest ? { "& td": { fontWeight: 600 } } : undefined}>
                <TableCell>{new Date(h.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <code>{h.imp_id}</code>
                </TableCell>
                <TableCell>
                  <Chip label={status.label} size="small" color={status.color} />
                </TableCell>
                <TableCell align="right">{formatPrice(h.price)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Stack>
  );
};

const InnerOrderEditor: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const client = useBackendAdminClient();
    const [tab, setTab] = useState(0);
    const [refundOpen, setRefundOpen] = useState(false);

    const orderQuery = useRetrieveQuery<OrderAdmin>(client, "shop", "orders", id ?? "");
    const order = orderQuery.data;

    if (!order) {
      return (
        <Stack sx={{ flexGrow: 1, width: "100%" }} spacing={2}>
          <Typography variant="h5">SHOP &gt; ORDERS</Typography>
          <Alert severity="error">해당 ID의 주문을 찾을 수 없습니다.</Alert>
          <Button variant="outlined" onClick={() => navigate("/shop/orders")} sx={{ alignSelf: "flex-start" }}>
            목록으로
          </Button>
        </Stack>
      );
    }

    const status = PAYMENT_STATUS_LABEL[order.current_status] ?? { label: order.current_status, color: "default" as const };
    const canRefund = order.current_paid_price > 0 && (order.current_status === "completed" || order.current_status === "partial_refunded");

    const onNotify = () => {
      navigate({
        pathname: "/notification/notification/create",
        search: `?order_id=${order.id}`,
      });
    };

    return (
      <Stack sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }} spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Stack spacing={1}>
            <Typography variant="h5">
              SHOP &gt; ORDERS &gt; 상세: <code>{order.id.slice(0, 8)}</code>
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={status.label} color={status.color} />
              <Typography variant="body1">
                <strong>{formatPrice(order.current_paid_price)}</strong>
                {order.first_paid_price !== order.current_paid_price && (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    (최초 결제: {formatPrice(order.first_paid_price)})
                  </Typography>
                )}
              </Typography>
              {order.user && (
                <Typography variant="body2" color="text.secondary">
                  · {order.user.email}
                </Typography>
              )}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<NotificationsActive />} onClick={onNotify}>
              알림 발송
            </Button>
            <Button variant="contained" color="error" startIcon={<CurrencyExchange />} onClick={() => setRefundOpen(true)} disabled={!canRefund}>
              환불
            </Button>
          </Stack>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "30%" }}>필드</TableCell>
              <TableCell>값</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>
                <code>{order.id}</code>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>주문일</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>최초 결제일</TableCell>
              <TableCell>{order.first_paid_at ? new Date(order.first_paid_at).toLocaleString() : "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>최근 imp_id</TableCell>
              <TableCell>
                <code>{order.latest_imp_id || "—"}</code>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>마지막 수정</TableCell>
              <TableCell>{new Date(order.updated_at).toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Divider />

        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="고객 정보" />
          <Tab label="상품" />
          <Tab label="결제 이력" />
        </Tabs>

        <Box>
          {tab === 0 && <CustomerInfoTab order={order} />}
          {tab === 1 && <OrderProductsTab order={order} />}
          {tab === 2 && <PaymentHistoryTab order={order} onRefund={() => setRefundOpen(true)} />}
        </Box>

        <RefundDialog open={refundOpen} onClose={() => setRefundOpen(false)} order={order} />
      </Stack>
    );
  })
);

export const ShopOrderEditorPage: FC = () => (
  <BackendAdminSignInGuard>
    <InnerOrderEditor />
  </BackendAdminSignInGuard>
);

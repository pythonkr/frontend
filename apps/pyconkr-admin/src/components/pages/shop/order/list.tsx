import {
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AdminFilterFieldset } from "@apps/pyconkr-admin/components/elements/admin_filter_fieldset";
import { AdminPagination } from "@apps/pyconkr-admin/components/elements/admin_pagination";
import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { PAYMENT_STATUS_LABEL } from "@apps/pyconkr-admin/components/pages/shop/_common/status_labels";
import { CategoryGroupAdminWithCategories } from "@apps/pyconkr-admin/components/pages/shop/product/types";
import { useBackendAdminClient, useListPaginatedQuery, useListQuery } from "@frontend/common/hooks/useAdminAPI";

import { OrderAdmin, PaymentStatus } from "./types";

const formatPrice = (price: number) => `₩${price.toLocaleString()}`;

const DEFAULT_PAGE_SIZE = 50;

type StatusFilter = "all" | PaymentStatus;

const InnerOrderList: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const client = useBackendAdminClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const nameQuery = searchParams.get("name") ?? "";
    const emailQuery = searchParams.get("email") ?? "";
    const impIdQuery = searchParams.get("imp_id") ?? "";
    const statusQuery = (searchParams.get("status") ?? "all") as StatusFilter;
    const categoryGroupQuery = searchParams.get("category_group_id") ?? "";
    const categoryQuery = searchParams.get("category_id") ?? "";
    const paidAfter = searchParams.get("first_paid_at_after") ?? "";
    const paidBefore = searchParams.get("first_paid_at_before") ?? "";
    const statusChangedAfter = searchParams.get("status_changed_at_after") ?? "";
    const statusChangedBefore = searchParams.get("status_changed_at_before") ?? "";
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("page_size") ?? DEFAULT_PAGE_SIZE);

    const apiParams: Record<string, string> = { page: String(page), page_size: String(pageSize) };
    if (nameQuery.trim()) apiParams.name = nameQuery.trim();
    if (emailQuery.trim()) apiParams.email = emailQuery.trim();
    if (impIdQuery.trim()) apiParams.imp_id = impIdQuery.trim();
    if (statusQuery !== "all") apiParams.status = statusQuery;
    if (categoryGroupQuery) apiParams.category_group_id = categoryGroupQuery;
    if (categoryQuery) apiParams.category_id = categoryQuery;
    if (paidAfter) apiParams.first_paid_at_after = paidAfter;
    if (paidBefore) apiParams.first_paid_at_before = paidBefore;
    if (statusChangedAfter) apiParams.status_changed_at_after = statusChangedAfter;
    if (statusChangedBefore) apiParams.status_changed_at_before = statusChangedBefore;

    const ordersQuery = useListPaginatedQuery<OrderAdmin>(client, "shop", "orders", apiParams);
    const groupsQuery = useListQuery<CategoryGroupAdminWithCategories>(client, "shop", "category-groups", {});
    const { count = 0, results: orders = [] } = ordersQuery.data ?? {};
    const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);

    const updateFilterParam = (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      setSearchParams(next, { replace: true });
    };

    const setCategoryGroup = (value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set("category_group_id", value);
      else next.delete("category_group_id");
      next.delete("category_id"); // 그룹 바꾸면 카테고리 선택 초기화
      next.delete("page");
      setSearchParams(next, { replace: true });
    };

    const setPage = (p: number) => {
      const next = new URLSearchParams(searchParams);
      if (p <= 1) next.delete("page");
      else next.set("page", String(p));
      setSearchParams(next, { replace: true });
    };

    const setPageSize = (size: number) => {
      const next = new URLSearchParams(searchParams);
      next.set("page_size", String(size));
      next.delete("page");
      setSearchParams(next, { replace: true });
    };

    return (
      <Stack sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }} spacing={2}>
        <Typography variant="h5">SHOP &gt; ORDERS &gt; 목록</Typography>

        <Stack direction="row" flexWrap="wrap" sx={{ gap: 2, alignItems: "flex-start" }}>
          <AdminFilterFieldset label="결제일 범위">
            <TextField
              size="small"
              label="시작"
              type="datetime-local"
              value={paidAfter?.slice(0, 16) ?? ""}
              onChange={(e) => updateFilterParam("first_paid_at_after", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              size="small"
              label="종료"
              type="datetime-local"
              value={paidBefore?.slice(0, 16) ?? ""}
              onChange={(e) => updateFilterParam("first_paid_at_before", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 220 }}
            />
          </AdminFilterFieldset>

          <AdminFilterFieldset label="상태 변경일 범위">
            <TextField
              size="small"
              label="시작"
              type="datetime-local"
              value={statusChangedAfter?.slice(0, 16) ?? ""}
              onChange={(e) => updateFilterParam("status_changed_at_after", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              size="small"
              label="종료"
              type="datetime-local"
              value={statusChangedBefore?.slice(0, 16) ?? ""}
              onChange={(e) => updateFilterParam("status_changed_at_before", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 220 }}
            />
          </AdminFilterFieldset>

          <AdminFilterFieldset label="분류">
            <Select
              size="small"
              value={statusQuery}
              onChange={(e) => updateFilterParam("status", e.target.value === "all" ? "" : (e.target.value as string))}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">전체 상태</MenuItem>
              <MenuItem value="pending">대기</MenuItem>
              <MenuItem value="completed">완료</MenuItem>
              <MenuItem value="partial_refunded">부분환불</MenuItem>
              <MenuItem value="refunded">환불</MenuItem>
            </Select>
            <Select size="small" value={categoryGroupQuery} onChange={(e) => setCategoryGroup(e.target.value)} displayEmpty sx={{ minWidth: 200 }}>
              <MenuItem value="">전체 카테고리 그룹</MenuItem>
              {groups.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              value={categoryQuery}
              onChange={(e) => updateFilterParam("category_id", e.target.value)}
              displayEmpty
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">전체 카테고리</MenuItem>
              {(categoryGroupQuery ? groups.filter((g) => g.id === categoryGroupQuery) : groups).flatMap((group) => [
                <MenuItem key={`group-${group.id}`} disabled sx={{ fontWeight: 600, opacity: "0.8 !important" }}>
                  {group.name}
                </MenuItem>,
                ...(group.categories ?? []).map((c) => (
                  <MenuItem key={c.id} value={c.id} sx={{ pl: 4 }}>
                    {c.name}
                  </MenuItem>
                )),
              ])}
            </Select>
          </AdminFilterFieldset>

          <AdminFilterFieldset label="검색">
            <TextField
              size="small"
              label="이름 (사용자/고객)"
              value={nameQuery}
              onChange={(e) => updateFilterParam("name", e.target.value)}
              sx={{ minWidth: 220 }}
            />
            <TextField
              size="small"
              label="이메일"
              value={emailQuery}
              onChange={(e) => updateFilterParam("email", e.target.value)}
              sx={{ minWidth: 220 }}
            />
            <TextField
              size="small"
              label="PortOne imp_id"
              value={impIdQuery}
              onChange={(e) => updateFilterParam("imp_id", e.target.value)}
              sx={{ minWidth: 200 }}
            />
          </AdminFilterFieldset>
        </Stack>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "12%" }}>주문 ID</TableCell>
              <TableCell>사용자</TableCell>
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
                <TableCell colSpan={7} align="center" sx={{ color: "text.secondary" }}>
                  조건에 맞는 주문이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => {
              const status = PAYMENT_STATUS_LABEL[order.current_status] ?? { label: order.current_status, color: "default" as const };
              return (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Link to={`/shop/orders/${order.id}`}>
                      <code>{order.id.slice(0, 8)}</code>
                    </Link>
                  </TableCell>
                  <TableCell>{order.user?.email ?? "—"}</TableCell>
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

        <AdminPagination count={count} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </Stack>
    );
  })
);

export const ShopOrderListPage: FC = () => (
  <BackendAdminSignInGuard>
    <InnerOrderList />
  </BackendAdminSignInGuard>
);

import { useBackendAdminClient, useListPaginatedQuery, useListQuery } from "@frontend/common/hooks/useAdminAPI";
import { RestartAlt } from "@mui/icons-material";
import {
  Button,
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
import { FC, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AdminFilterFieldset } from "@apps/pyconkr-admin/components/elements/admin_filter_fieldset";
import { AdminPagination } from "@apps/pyconkr-admin/components/elements/admin_pagination";
import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { PAYMENT_STATUS_LABEL } from "@apps/pyconkr-admin/components/pages/shop/_common/status_labels";
import { CategoryGroupAdminWithCategories } from "@apps/pyconkr-admin/components/pages/shop/product/types";

import { OrderAdmin, PaymentStatus } from "./types";

const formatPrice = (price: number) => `₩${price.toLocaleString()}`;

const DEFAULT_PAGE_SIZE = 50;

type StatusFilter = "all" | PaymentStatus;

type FilterState = {
  name: string;
  email: string;
  imp_id: string;
  status: StatusFilter;
  category_group_id: string;
  category_id: string;
  first_paid_at_after: string;
  first_paid_at_before: string;
  status_changed_at_after: string;
  status_changed_at_before: string;
};

const FILTER_KEYS: (keyof FilterState)[] = [
  "name",
  "email",
  "imp_id",
  "status",
  "category_group_id",
  "category_id",
  "first_paid_at_after",
  "first_paid_at_before",
  "status_changed_at_after",
  "status_changed_at_before",
];

const readFilters = (params: URLSearchParams): FilterState => ({
  name: params.get("name") ?? "",
  email: params.get("email") ?? "",
  imp_id: params.get("imp_id") ?? "",
  status: (params.get("status") ?? "all") as StatusFilter,
  category_group_id: params.get("category_group_id") ?? "",
  category_id: params.get("category_id") ?? "",
  first_paid_at_after: params.get("first_paid_at_after") ?? "",
  first_paid_at_before: params.get("first_paid_at_before") ?? "",
  status_changed_at_after: params.get("status_changed_at_after") ?? "",
  status_changed_at_before: params.get("status_changed_at_before") ?? "",
});

const InnerOrderList: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const client = useBackendAdminClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("page_size") ?? DEFAULT_PAGE_SIZE);

    // apiParams derives from the URL (the "applied" state); local filter inputs only update the URL on Apply.
    const apiParams: Record<string, string> = { page: String(page), page_size: String(pageSize) };
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (!value) continue;
      if (key === "status" && value === "all") continue;
      if (key === "name" || key === "email" || key === "imp_id") {
        const trimmed = value.trim();
        if (trimmed) apiParams[key] = trimmed;
      } else {
        apiParams[key] = value;
      }
    }

    const [filters, setFilters] = useState<FilterState>(() => readFilters(searchParams));

    // Re-sync local form state when the URL changes externally (browser back/forward, pagination).
    useEffect(() => {
      setFilters(readFilters(searchParams));
    }, [searchParams]);

    const ordersQuery = useListPaginatedQuery<OrderAdmin>(client, "shop", "order", apiParams);
    const groupsQuery = useListQuery<CategoryGroupAdminWithCategories>(client, "shop", "categorygroup", {});
    const { count = 0, results: orders = [] } = ordersQuery.data ?? {};
    const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);

    const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const setCategoryGroup = (value: string) => {
      setFilters((prev) => ({ ...prev, category_group_id: value, category_id: "" }));
    };

    const handleApply = () => {
      const next = new URLSearchParams(searchParams);
      for (const key of FILTER_KEYS) {
        const value = filters[key];
        if (value && !(key === "status" && value === "all")) next.set(key, value);
        else next.delete(key);
      }
      next.delete("page");
      setSearchParams(next, { replace: true });
    };

    const handleReset = () => {
      setFilters(readFilters(new URLSearchParams()));
      const next = new URLSearchParams(searchParams);
      for (const key of FILTER_KEYS) next.delete(key);
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
              value={filters.first_paid_at_after.slice(0, 16)}
              onChange={(e) => setFilter("first_paid_at_after", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              size="small"
              label="종료"
              type="datetime-local"
              value={filters.first_paid_at_before.slice(0, 16)}
              onChange={(e) => setFilter("first_paid_at_before", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 220 }}
            />
          </AdminFilterFieldset>

          <AdminFilterFieldset label="상태 변경일 범위">
            <TextField
              size="small"
              label="시작"
              type="datetime-local"
              value={filters.status_changed_at_after.slice(0, 16)}
              onChange={(e) => setFilter("status_changed_at_after", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              size="small"
              label="종료"
              type="datetime-local"
              value={filters.status_changed_at_before.slice(0, 16)}
              onChange={(e) => setFilter("status_changed_at_before", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 220 }}
            />
          </AdminFilterFieldset>

          <AdminFilterFieldset label="분류">
            <Select size="small" value={filters.status} onChange={(e) => setFilter("status", e.target.value as StatusFilter)} sx={{ minWidth: 140 }}>
              <MenuItem value="all">전체 상태</MenuItem>
              <MenuItem value="pending">대기</MenuItem>
              <MenuItem value="completed">완료</MenuItem>
              <MenuItem value="partial_refunded">부분환불</MenuItem>
              <MenuItem value="refunded">환불</MenuItem>
            </Select>
            <Select
              size="small"
              value={filters.category_group_id}
              onChange={(e) => setCategoryGroup(e.target.value)}
              displayEmpty
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">전체 카테고리 그룹</MenuItem>
              {groups.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              value={filters.category_id}
              onChange={(e) => setFilter("category_id", e.target.value)}
              displayEmpty
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">전체 카테고리</MenuItem>
              {(filters.category_group_id ? groups.filter((g) => g.id === filters.category_group_id) : groups).flatMap((group) => [
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
              value={filters.name}
              onChange={(e) => setFilter("name", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              sx={{ minWidth: 220 }}
            />
            <TextField
              size="small"
              label="이메일"
              value={filters.email}
              onChange={(e) => setFilter("email", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              sx={{ minWidth: 220 }}
            />
            <TextField
              size="small"
              label="PortOne imp_id"
              value={filters.imp_id}
              onChange={(e) => setFilter("imp_id", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              sx={{ minWidth: 200 }}
            />
          </AdminFilterFieldset>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={handleApply} size="small">
            검색
          </Button>
          <Button variant="text" onClick={handleReset} size="small" startIcon={<RestartAlt />}>
            초기화
          </Button>
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
                    <Link to={`/shop/order/${order.id}`}>
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

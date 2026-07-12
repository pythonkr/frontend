import { useBackendAdminClient, useListPaginatedQuery } from "@frontend/common/hooks/useAdminAPI";
import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Button,
  Chip,
  CircularProgress,
  IconButton,
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
import { useMutation } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { ListPagination } from "@apps/pyconkr-admin/components/elements/list_pagination";
import { usePaginationParams } from "@apps/pyconkr-admin/components/elements/pagination";
import { PRODUCT_STATUS_LABEL } from "@apps/pyconkr-admin/components/pages/shop/_common/status_labels";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

import { CategoryGroupAdminWithCategories, ProductAdmin, ProductCurrentStatus } from "./types";

const formatPrice = (price: number) => `₩${price.toLocaleString()}`;
const formatLeftoverStock = (leftover: number | null | undefined) => {
  if (leftover === null || leftover === undefined) return "무한대";
  return leftover.toLocaleString();
};

type StatusFilter = "all" | ProductCurrentStatus;

const InnerProductList: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const client = useBackendAdminClient();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const nameQuery = searchParams.get("name") ?? "";
    const categoryGroupQuery = searchParams.get("category_group") ?? "";
    const categoryQuery = searchParams.get("category") ?? "";
    const statusQuery = (searchParams.get("status") ?? "all") as StatusFilter;

    const { page, pageSize } = usePaginationParams();

    const apiParams: Record<string, string> = {};
    if (nameQuery.trim()) apiParams.name = nameQuery.trim();
    if (categoryGroupQuery) apiParams.category_group = categoryGroupQuery;
    if (categoryQuery) apiParams.category = categoryQuery;
    if (statusQuery !== "all") apiParams.status = statusQuery;
    apiParams.page = String(page);
    apiParams.page_size = String(pageSize);

    const productsQuery = useListPaginatedQuery<ProductAdmin>(client, "shop", "product", apiParams);
    // 카테고리 매핑·필터에 전체 그룹이 필요하므로 그룹은 한 번에 받는다.
    const groupsQuery = useListPaginatedQuery<CategoryGroupAdminWithCategories>(client, "shop", "categorygroup", { page_size: "200" });

    const products = productsQuery.data.results;
    const totalCount = productsQuery.data.count;
    const groups = useMemo(() => groupsQuery.data.results, [groupsQuery.data]);

    const categoryToGroup: Record<string, { groupId: string; groupName: string; categoryName: string }> = useMemo(() => {
      const map: Record<string, { groupId: string; groupName: string; categoryName: string }> = {};
      for (const g of groups) {
        for (const c of g.categories ?? []) {
          map[c.id] = { groupId: g.id, groupName: g.name, categoryName: c.name };
        }
      }
      return map;
    }, [groups]);

    const updateParam = (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page"); // 필터가 바뀌면 1페이지로
      setSearchParams(next, { replace: true });
    };

    const deleteMutation = useMutation({
      mutationFn: async (id: string) => client.delete<void>(`v1/admin-api/shop/product/${id}/`),
      onSuccess: () => addSnackbar("상품을 삭제했습니다.", "success"),
      onError: addErrorSnackbar,
    });

    const handleDelete = (id: string, name: string) => {
      if (window.confirm(`'${name}' 상품을 삭제하시겠습니까?`)) {
        deleteMutation.mutate(id);
      }
    };

    return (
      <Stack sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }} spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">SHOP &gt; PRODUCTS &gt; 목록</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/shop/product/create")}>
            새 상품 추가
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          <TextField size="small" label="이름 검색" value={nameQuery} onChange={(e) => updateParam("name", e.target.value)} sx={{ minWidth: 240 }} />
          <Select
            size="small"
            value={categoryGroupQuery}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value) next.set("category_group", e.target.value);
              else next.delete("category_group");
              next.delete("category"); // 그룹 바꾸면 카테고리 선택 초기화
              next.delete("page"); // 필터가 바뀌면 1페이지로
              setSearchParams(next, { replace: true });
            }}
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
          <Select size="small" value={categoryQuery} onChange={(e) => updateParam("category", e.target.value)} displayEmpty sx={{ minWidth: 200 }}>
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
          <Select
            size="small"
            value={statusQuery}
            onChange={(e) => updateParam("status", e.target.value === "all" ? "" : e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">전체 상태</MenuItem>
            <MenuItem value="active">노출 중</MenuItem>
            <MenuItem value="out_of_visible_period">노출 기간 아님</MenuItem>
            <MenuItem value="out_of_orderable_period">판매 기간 아님</MenuItem>
          </Select>
          <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
            {totalCount} 건
          </Typography>
        </Stack>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "30%" }}>이름</TableCell>
              <TableCell>카테고리</TableCell>
              <TableCell align="right">가격</TableCell>
              <TableCell align="right">판매 가능 재고</TableCell>
              <TableCell>상태</TableCell>
              <TableCell sx={{ width: 120 }}>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: "text.secondary" }}>
                  조건에 맞는 상품이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => {
              const cat = categoryToGroup[product.category];
              const status = PRODUCT_STATUS_LABEL[product.current_status] ?? { label: product.current_status, color: "default" as const };
              return (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Link to={`/shop/product/${product.id}`}>{product.name_ko || product.str_repr}</Link>
                  </TableCell>
                  <TableCell>{cat ? `${cat.groupName} > ${cat.categoryName}` : "—"}</TableCell>
                  <TableCell align="right">{formatPrice(product.price)}</TableCell>
                  <TableCell align="right">{formatLeftoverStock(product.leftover_stock)}</TableCell>
                  <TableCell>
                    <Chip label={status.label} size="small" color={status.color} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => navigate(`/shop/product/${product.id}`)} aria-label="수정">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(product.id, product.name_ko || product.str_repr)}
                      aria-label="삭제"
                      disabled={deleteMutation.isPending}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <ListPagination totalCount={totalCount} />
      </Stack>
    );
  })
);

export const ShopProductListPage: FC = () => (
  <BackendAdminSignInGuard>
    <InnerProductList />
  </BackendAdminSignInGuard>
);

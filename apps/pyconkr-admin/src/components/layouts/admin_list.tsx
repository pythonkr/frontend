import {
  useBackendAdminClient,
  useFieldSelectablesQuery,
  useListPaginatedQuery,
  useOpenApiSchemaQuery,
  useRemovePreparedMutation,
  useSelectablesQueries,
} from "@frontend/common/hooks/useAdminAPI";
import { ChoicesResponse } from "@frontend/common/schemas/backendAdminAPI";
import { extractQueryParameters } from "@frontend/common/utils";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Box, Button, CircularProgress, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, type ReactNode, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AdminListFilter } from "@apps/pyconkr-admin/components/elements/admin_list_filter";
import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { ListPagination } from "@apps/pyconkr-admin/components/elements/list_pagination";
import { PAGINATION_PARAM_KEYS, usePaginationParams } from "@apps/pyconkr-admin/components/elements/pagination";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

type ListRowType = {
  id: string;
  str_repr: string;
  created_at: string;
  updated_at: string;
};

export type AdminListColumn = {
  field: string;
  header: string;
  width?: string | number;
  align?: "left" | "right" | "center";
  render?: (row: Record<string, unknown>) => ReactNode;
};

export type FilterChoicesSource = {
  app: string;
  resource: string;
};

type AdminListProps = {
  app: string;
  resource: string;
  title?: string;
  hideCreatedAt?: boolean;
  hideUpdatedAt?: boolean;
  hideCreateNew?: boolean;
  columns?: AdminListColumn[];
  enableRowActions?: boolean;
  filterChoicesFrom?: Record<string, FilterChoicesSource>;
};

const InnerAdminList: FC<AdminListProps> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with(
    { fallback: <CircularProgress /> },
    ({ app, resource, title, hideCreatedAt, hideUpdatedAt, hideCreateNew, columns, enableRowActions, filterChoicesFrom }) => {
      const navigate = useNavigate();

      const [searchParams, setSearchParams] = useSearchParams();
      const backendAdminClient = useBackendAdminClient();

      const allParams: Record<string, string> = Object.fromEntries(searchParams.entries());
      const { page, pageSize } = usePaginationParams();
      // filterParams = user-facing filters only (page/page_size stripped); used for AdminListFilter UI state.
      const filterParams: Record<string, string> = Object.fromEntries(Object.entries(allParams).filter(([k]) => !PAGINATION_PARAM_KEYS.has(k)));
      // apiParams = filters + explicit pagination so non-paginated endpoints just ignore page/page_size.
      const apiParams: Record<string, string> = { ...filterParams, page: String(page), page_size: String(pageSize) };
      const listQuery = useListPaginatedQuery<ListRowType & Record<string, unknown>>(backendAdminClient, app, resource, apiParams);
      const { results: items, count: totalCount } = listQuery.data;

      const openApiSchemaQuery = useOpenApiSchemaQuery(backendAdminClient);
      const queryParameters = useMemo(
        () => extractQueryParameters(openApiSchemaQuery.data, app, resource).filter((p) => !PAGINATION_PARAM_KEYS.has(p.name)),
        [openApiSchemaQuery.data, app, resource]
      );

      const fieldChoices = useFieldSelectablesQuery(backendAdminClient, app, resource);

      const overrideEntries = useMemo(() => Object.entries(filterChoicesFrom ?? {}), [filterChoicesFrom]);
      const overrideQueries = useSelectablesQueries(
        backendAdminClient,
        overrideEntries.map(([, src]) => ({ app: src.app, resource: src.resource }))
      );
      const mergedChoices = useMemo<ChoicesResponse>(() => {
        const merged: ChoicesResponse = { ...fieldChoices };
        overrideEntries.forEach(([localField], i) => {
          const results = overrideQueries[i]?.data?.results;
          if (results) merged[localField] = results;
        });
        return merged;
      }, [fieldChoices, overrideEntries, overrideQueries]);

      const removeMutation = useRemovePreparedMutation(backendAdminClient, app, resource);

      // Filter changes reset to page 1; page_size is preserved if the user had set one explicitly.
      const handleFilterApply = (newParams: Record<string, string>) => {
        const merged: Record<string, string> = { ...newParams };
        if (allParams.page_size) merged.page_size = allParams.page_size;
        setSearchParams(merged, { replace: true });
      };

      const detailPath = (id: string) => `/${app}/${resource}/${id}`;
      const hasCustomColumns = !!(columns && columns.length > 0);

      const labelForRow = (item: ListRowType & Record<string, unknown>): string => {
        if (hasCustomColumns) {
          const firstField = columns![0].field;
          const value = item[firstField];
          if (typeof value === "string" && value.length > 0) return value;
        }
        return item.str_repr || item.id;
      };

      const handleDelete = (id: string, label: string) => {
        if (!window.confirm(`'${label}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
        removeMutation.mutate(id, {
          onSuccess: () => addSnackbar("삭제했습니다.", "success"),
          onError: addErrorSnackbar,
        });
      };

      return (
        <Stack sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }}>
          <Typography variant="h5">{title ?? `${app.toUpperCase()} > ${resource.toUpperCase()} > 목록`}</Typography>
          <br />
          <AdminListFilter parameters={queryParameters} values={filterParams} choices={mergedChoices} onApply={handleFilterApply} />
          <Box>
            {!hideCreateNew && (
              <Button variant="contained" onClick={() => navigate(`/${app}/${resource}/create`)} startIcon={<Add />}>
                새 객체 추가
              </Button>
            )}
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                {hasCustomColumns ? (
                  columns!.map((col) => (
                    <TableCell key={col.field} sx={{ width: col.width }} align={col.align}>
                      {col.header}
                    </TableCell>
                  ))
                ) : (
                  <>
                    <TableCell sx={{ width: "25%" }}>ID</TableCell>
                    <TableCell sx={{ width: "40%" }}>이름</TableCell>
                  </>
                )}
                {!hideCreatedAt && <TableCell sx={{ width: "17.5%" }}>생성 시간</TableCell>}
                {!hideUpdatedAt && <TableCell sx={{ width: "17.5%" }}>수정 시간</TableCell>}
                {enableRowActions && <TableCell sx={{ width: 120 }}>작업</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  {hasCustomColumns ? (
                    columns!.map((col, idx) => {
                      if (col.render) {
                        return (
                          <TableCell key={col.field} align={col.align}>
                            {col.render(item)}
                          </TableCell>
                        );
                      }
                      const value = (item as Record<string, unknown>)[col.field];
                      const displayValue = value === null || value === undefined ? "" : String(value);
                      return (
                        <TableCell key={col.field} align={col.align}>
                          {idx === 0 ? <Link to={detailPath(item.id)}>{displayValue}</Link> : displayValue}
                        </TableCell>
                      );
                    })
                  ) : (
                    <>
                      <TableCell>
                        <Link to={detailPath(item.id)}>{item.id}</Link>
                      </TableCell>
                      <TableCell>
                        <Link to={detailPath(item.id)}>{item.str_repr}</Link>
                      </TableCell>
                    </>
                  )}
                  {!hideCreatedAt && <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>}
                  {!hideUpdatedAt && <TableCell>{new Date(item.updated_at).toLocaleString()}</TableCell>}
                  {enableRowActions && (
                    <TableCell>
                      <IconButton size="small" onClick={() => navigate(detailPath(item.id))} aria-label="수정">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(item.id, labelForRow(item))}
                        disabled={removeMutation.isPending}
                        aria-label="삭제"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ListPagination totalCount={totalCount} />
        </Stack>
      );
    }
  )
);

export const AdminList: FC<AdminListProps> = (props) => (
  <BackendAdminSignInGuard>
    <InnerAdminList {...props} />
  </BackendAdminSignInGuard>
);

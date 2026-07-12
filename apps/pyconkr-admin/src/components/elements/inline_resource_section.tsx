import { BackendAPIClientError } from "@frontend/common/apis/client";
import {
  useBackendAdminClient,
  useCreateMutation,
  useListPaginatedQuery,
  useRemovePreparedMutation,
  useUpdatePreparedMutation,
} from "@frontend/common/hooks/useAdminAPI";
import { Add, ArrowDownward, ArrowUpward, Delete, Edit } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
import { FC, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

export type ResourceRow = {
  id: string;
  created_at: string;
  [key: string]: unknown;
};

type Align = "left" | "center" | "right";
type Width = string | number;

/**
 * Defines both a table column and a dialog form field for a resource attribute.
 *
 * - `translated` renders as two table columns (한국어/영어) and two form inputs.
 *   The _ko variant is always treated as required.
 * - `text` / `number` render as one column and one input.
 */
export type ColumnDef =
  | { name: string; label: string; type: "translated"; align?: Align; width?: Width }
  | {
      name: string;
      label: string;
      type: "text" | "number";
      align?: Align;
      width?: Width;
      defaultValue?: (existingCount: number) => string;
      helperText?: string;
      render?: (row: ResourceRow) => ReactNode;
    };

type FormValues = Record<string, string>;

const firstTranslatedName = (columns: ColumnDef[], row: ResourceRow | undefined): string => {
  if (!row) return "";
  const t = columns.find((c) => c.type === "translated");
  if (!t) return String(row.id ?? "");
  return (row[`${t.name}_ko`] as string) || (row[`${t.name}_en`] as string) || String(row.id ?? "");
};

const buildInitialValues = (columns: ColumnDef[], item: ResourceRow | undefined, existingCount: number): FormValues => {
  const values: FormValues = {};
  for (const c of columns) {
    if (c.type === "translated") {
      values[`${c.name}_ko`] = (item?.[`${c.name}_ko`] as string) ?? "";
      values[`${c.name}_en`] = (item?.[`${c.name}_en`] as string) ?? "";
    } else {
      const existing = item?.[c.name];
      values[c.name] = existing !== undefined && existing !== null ? String(existing) : (c.defaultValue?.(existingCount) ?? "");
    }
  }
  return values;
};

const buildPayload = (columns: ColumnDef[], values: FormValues, filter: { key: string; value: string }): Record<string, unknown> => {
  const payload: Record<string, unknown> = { [filter.key]: filter.value };
  for (const c of columns) {
    if (c.type === "translated") {
      payload[`${c.name}_ko`] = values[`${c.name}_ko`] ?? "";
      payload[`${c.name}_en`] = values[`${c.name}_en`] ?? "";
    } else if (c.type === "number") {
      payload[c.name] = Number(values[c.name]) || 0;
    } else {
      payload[c.name] = values[c.name] ?? "";
    }
  }
  return payload;
};

const extractFieldErrors = (err: unknown): { fieldErrors: Record<string, string>; hadFieldError: boolean } => {
  const fieldErrors: Record<string, string> = {};
  if (!(err instanceof BackendAPIClientError)) return { fieldErrors, hadFieldError: false };
  let hadFieldError = false;
  for (const e of err.detail.errors) {
    if (e.attr) {
      fieldErrors[e.attr] = e.detail;
      hadFieldError = true;
    }
  }
  return { fieldErrors, hadFieldError };
};

type ResourceDialogProps = {
  open: boolean;
  onClose: () => void;
  app: string;
  resource: string;
  label: string;
  filter: { key: string; value: string };
  columns: ColumnDef[];
  item?: ResourceRow;
  existingCount: number;
  dialogChildren?: (row: ResourceRow) => ReactNode;
};

const ResourceDialog: FC<ResourceDialogProps> = ({ open, onClose, app, resource, label, filter, columns, item, existingCount, dialogChildren }) => {
  const client = useBackendAdminClient();
  const createMutation = useCreateMutation<ResourceRow>(client, app, resource);
  const updateMutation = useUpdatePreparedMutation<ResourceRow & { id: string }>(client, app, resource);
  const [values, setValues] = useState<FormValues>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(buildInitialValues(columns, item, existingCount));
    setFieldErrors({});
    setDirty(false);
  }, [open, item, columns, existingCount]);

  const pending = createMutation.isPending || updateMutation.isPending;

  const setField = (key: string, value: string) => {
    setValues((p) => ({ ...p, [key]: value }));
    setDirty(true);
    setFieldErrors((p) => {
      if (!(key in p)) return p;
      const next = { ...p };
      delete next[key];
      return next;
    });
  };

  const handleClose = () => {
    if (pending) return;
    if (dirty && !window.confirm("변경사항이 있습니다. 닫으시겠습니까?")) return;
    onClose();
  };

  const onSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    for (const c of columns) {
      if (c.type === "translated" && !values[`${c.name}_ko`]?.trim()) {
        addSnackbar(`한국어 ${c.label}은(는) 필수입니다.`, "error");
        return;
      }
    }
    const payload = buildPayload(columns, values, filter);
    const handlers = {
      onSuccess: () => {
        addSnackbar(`${label}을(를) ${item ? "수정" : "생성"}했습니다.`, "success");
        onClose();
      },
      onError: (err: Error) => {
        const { fieldErrors: fe, hadFieldError } = extractFieldErrors(err);
        if (hadFieldError) setFieldErrors(fe);
        else addErrorSnackbar(err);
      },
    };
    if (item) updateMutation.mutate({ id: item.id, ...payload } as unknown as ResourceRow & { id: string }, handlers);
    else createMutation.mutate(payload as unknown as ResourceRow, handlers);
  };

  const itemName = firstTranslatedName(columns, item);
  const title = item ? `${label} 수정${itemName ? `: ${itemName}` : ""}` : `새 ${label} 추가`;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={dialogChildren && item ? "md" : "sm"}>
      <form onSubmit={onSubmit} noValidate>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {columns.map((c, idx) => {
              if (c.type === "translated") {
                const koKey = `${c.name}_ko`;
                const enKey = `${c.name}_en`;
                return (
                  <Stack key={c.name} direction="row" spacing={2}>
                    <TextField
                      label={`${c.label} (한국어)`}
                      required
                      value={values[koKey] ?? ""}
                      onChange={(e) => setField(koKey, e.target.value)}
                      fullWidth
                      autoFocus={idx === 0}
                      error={!!fieldErrors[koKey]}
                      helperText={fieldErrors[koKey]}
                    />
                    <TextField
                      label={`${c.label} (영어)`}
                      value={values[enKey] ?? ""}
                      onChange={(e) => setField(enKey, e.target.value)}
                      fullWidth
                      error={!!fieldErrors[enKey]}
                      helperText={fieldErrors[enKey]}
                    />
                  </Stack>
                );
              }
              return (
                <TextField
                  key={c.name}
                  label={c.label}
                  type={c.type}
                  value={values[c.name] ?? ""}
                  onChange={(e) => setField(c.name, e.target.value)}
                  fullWidth
                  helperText={fieldErrors[c.name] || c.helperText}
                  error={!!fieldErrors[c.name]}
                  autoFocus={idx === 0}
                />
              );
            })}
          </Stack>
          {item && dialogChildren?.(item)}
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={handleClose} disabled={pending}>
            취소
          </Button>
          <Button type="submit" variant="contained" disabled={pending}>
            {item ? "수정" : "추가"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export type InlineResourceSectionProps = {
  app: string;
  resource: string;
  /** Filter pinned to the list query; also sent as the FK value on create. */
  filter: { key: string; value: string };
  /** Singular noun shown in headers, buttons, snackbars (e.g. "티어"). */
  label: string;
  columns: ColumnDef[];
  /** Hides the "생성일" column. */
  hideCreatedAt?: boolean;
  /**
   * Enables ▲/▼ reorder buttons in the action column. The named numeric field
   * is used to sort rows and is swapped with the adjacent row via a 3-step
   * update (to avoid breaking the (parent, order) unique constraint).
   */
  orderField?: string;
  /** Rendered inside the edit dialog when an existing item is being edited. */
  dialogChildren?: (item: ResourceRow) => ReactNode;
};

const renderCellValue = (column: ColumnDef, row: ResourceRow, subKey?: "ko" | "en"): ReactNode => {
  if (column.type === "translated") {
    return (row[`${column.name}_${subKey}`] as string) ?? "";
  }
  if (column.render) return column.render(row);
  const v = row[column.name];
  return v === null || v === undefined ? "" : String(v);
};

export const InlineResourceSection: FC<InlineResourceSectionProps> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, ({ app, resource, filter, label, columns, hideCreatedAt, orderField, dialogChildren }) => {
    const client = useBackendAdminClient();
    const listQuery = useListPaginatedQuery<ResourceRow>(client, app, resource, { [filter.key]: filter.value, page_size: "100" });
    const removeMutation = useRemovePreparedMutation(client, app, resource);
    const updateMutation = useUpdatePreparedMutation<ResourceRow & { id: string }>(client, app, resource);
    const [dialog, setDialog] = useState<{ open: boolean; item?: ResourceRow }>({ open: false });
    const [reordering, setReordering] = useState(false);

    const items = useMemo(() => {
      const raw = listQuery.data.results ?? [];
      if (!orderField) return raw;
      return [...raw].sort((a, b) => Number(a[orderField] ?? 0) - Number(b[orderField] ?? 0));
    }, [listQuery.data.results, orderField]);

    const handleDelete = (item: ResourceRow) => {
      const itemLabel = firstTranslatedName(columns, item);
      if (!window.confirm(`'${itemLabel}' ${label}을(를) 삭제하시겠습니까?`)) return;
      removeMutation.mutate(item.id, {
        onSuccess: () => addSnackbar(`${label}을(를) 삭제했습니다.`, "success"),
        onError: addErrorSnackbar,
      });
    };

    const handleReorder = async (idx: number, direction: "up" | "down") => {
      if (!orderField) return;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= items.length) return;
      const item = items[idx];
      const target = items[targetIdx];
      const itemOrder = Number(item[orderField] ?? 0);
      const targetOrder = Number(target[orderField] ?? 0);
      const tempOrder = Math.max(...items.map((i) => Number(i[orderField] ?? 0))) + 100;

      setReordering(true);
      try {
        await updateMutation.mutateAsync({ ...item, [orderField]: tempOrder } as unknown as ResourceRow & { id: string });
        await updateMutation.mutateAsync({ ...target, [orderField]: itemOrder } as unknown as ResourceRow & { id: string });
        await updateMutation.mutateAsync({ ...item, [orderField]: targetOrder } as unknown as ResourceRow & { id: string });
      } catch (e) {
        addErrorSnackbar(e as Error);
      } finally {
        setReordering(false);
      }
    };

    const tableColumnCount = columns.reduce((n, c) => n + (c.type === "translated" ? 2 : 1), 0) + (hideCreatedAt ? 0 : 1) + 1;
    const actionsWidth = orderField ? 180 : 100;

    return (
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {label} ({items.length})
          </Typography>
          <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => setDialog({ open: true })}>
            {label} 추가
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.flatMap((c) => {
                if (c.type === "translated") {
                  return [
                    <TableCell key={`${c.name}_ko`} align={c.align ?? "center"} sx={{ width: c.width }}>
                      {c.label} (한국어)
                    </TableCell>,
                    <TableCell key={`${c.name}_en`} align={c.align ?? "center"} sx={{ width: c.width }}>
                      {c.label} (영어)
                    </TableCell>,
                  ];
                }
                return [
                  <TableCell key={c.name} align={c.align ?? "center"} sx={{ width: c.width }}>
                    {c.label}
                  </TableCell>,
                ];
              })}
              {!hideCreatedAt && (
                <TableCell align="center" sx={{ width: 180, whiteSpace: "nowrap" }}>
                  생성일
                </TableCell>
              )}
              <TableCell align="center" sx={{ width: actionsWidth }}>
                작업
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableColumnCount} align="center" sx={{ color: "text.secondary" }}>
                  {label}이(가) 없습니다.
                </TableCell>
              </TableRow>
            )}
            {items.map((item, idx) => (
              <TableRow key={item.id} hover>
                {columns.flatMap((c) => {
                  if (c.type === "translated") {
                    return [
                      <TableCell key={`${c.name}_ko`} align={c.align ?? "center"}>
                        {renderCellValue(c, item, "ko")}
                      </TableCell>,
                      <TableCell key={`${c.name}_en`} align={c.align ?? "center"}>
                        {renderCellValue(c, item, "en")}
                      </TableCell>,
                    ];
                  }
                  return [
                    <TableCell key={c.name} align={c.align ?? "center"}>
                      {renderCellValue(c, item)}
                    </TableCell>,
                  ];
                })}
                {!hideCreatedAt && (
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {item.created_at ? new Date(item.created_at).toLocaleString() : "—"}
                  </TableCell>
                )}
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {orderField && (
                    <>
                      <IconButton size="small" onClick={() => handleReorder(idx, "up")} disabled={reordering || idx === 0} aria-label="위로">
                        <ArrowUpward fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleReorder(idx, "down")}
                        disabled={reordering || idx === items.length - 1}
                        aria-label="아래로"
                      >
                        <ArrowDownward fontSize="small" />
                      </IconButton>
                    </>
                  )}
                  <IconButton size="small" onClick={() => setDialog({ open: true, item })} aria-label="수정">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(item)} disabled={removeMutation.isPending} aria-label="삭제">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ResourceDialog
          open={dialog.open}
          onClose={() => setDialog({ open: false })}
          app={app}
          resource={resource}
          label={label}
          filter={filter}
          columns={columns}
          item={dialog.item}
          existingCount={items.length}
          dialogChildren={dialogChildren}
        />
      </Stack>
    );
  })
);

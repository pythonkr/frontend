import { useBackendAdminClient, useExportOrdersMutation } from "@frontend/common/hooks/useAdminAPI";
import { timestampedFilename, triggerBlobDownload } from "@frontend/common/utils";
import { FileDownload } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useState } from "react";

import { ChoicePicker } from "@apps/pyconkr-admin/components/elements/choice_picker";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

type Scope = "event" | "categorygroup" | "category" | "product";

const SCOPES: { value: Scope; label: string; paramKey: string; source: { app: string; resource: string } }[] = [
  { value: "event", label: "이벤트별", paramKey: "event_id", source: { app: "event", resource: "event" } },
  { value: "categorygroup", label: "카테고리 그룹별", paramKey: "category_group_id", source: { app: "shop", resource: "categorygroup" } },
  { value: "category", label: "카테고리별", paramKey: "category_id", source: { app: "shop", resource: "category" } },
  { value: "product", label: "상품별", paramKey: "product_id", source: { app: "shop", resource: "product" } },
];

const ExportDialogBody: FC<{ onClose: () => void }> = ErrorBoundary.with({ fallback: ErrorFallback }, ({ onClose }) => {
  const client = useBackendAdminClient();
  const exportMutation = useExportOrdersMutation(client);

  const [scope, setScope] = useState<Scope>("event");
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [includeRefunded, setIncludeRefunded] = useState(false);

  const { paramKey, source } = SCOPES.find((s) => s.value === scope)!;

  const changeScope = (next: Scope) => {
    setScope(next);
    setSelectedIds([]);
  };

  const handleExport = () => {
    const params: Record<string, string> = { [paramKey]: selectedIds.join(",") };
    if (includeRefunded) params.include_refunded = "true";
    exportMutation.mutate(params, {
      onSuccess: (blob) => {
        triggerBlobDownload(blob, timestampedFilename("order_export", "xlsx"));
        addSnackbar("주문 내보내기를 완료했습니다.", "success");
        onClose();
      },
      onError: addErrorSnackbar,
    });
  };

  return (
    <>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="order-export-scope">범위</InputLabel>
            <Select labelId="order-export-scope" label="범위" value={scope} onChange={(e) => changeScope(e.target.value as Scope)}>
              {SCOPES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* key={scope} 로 범위 변경 시 ChoicePicker 를 remount — source(selectables) 와 내부 필터 상태를 새로 시작. */}
          <Suspense fallback={<CircularProgress size={20} />}>
            <ChoicePicker key={scope} multiple label="대상" source={source} value={selectedIds} onChange={setSelectedIds} />
          </Suspense>

          <FormControlLabel
            control={<Checkbox size="small" checked={includeRefunded} onChange={(e) => setIncludeRefunded(e.target.checked)} />}
            label="환불 포함"
            slotProps={{ typography: { variant: "body2" } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          취소
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={handleExport}
          disabled={selectedIds.length === 0 || exportMutation.isPending}
        >
          {exportMutation.isPending ? "내보내는 중…" : `내보내기${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
        </Button>
      </DialogActions>
    </>
  );
});

export const OrderExportDialog: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>범위별 주문 내보내기</DialogTitle>
    <ExportDialogBody onClose={onClose} />
  </Dialog>
);

import { useBackendAdminClient, useCreateMutation, usePreviewUserMergeMutation } from "@frontend/common/hooks/useAdminAPI";
import { UserMergeHistoryDetailSchema, UserMergeRequestSchema } from "@frontend/common/schemas/backendAdminAPI";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ChoicePicker } from "@apps/pyconkr-admin/components/elements/choice_picker";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

import { MergeDirection, MergedObjectsTable } from "./components";

const USER_SOURCE = { app: "user", resource: "userext" };

const InnerAdminUserMergePage: FC = () => {
  const navigate = useNavigate();
  const client = useBackendAdminClient();

  const [source, setSource] = useState<string | number | null>(null);
  const [target, setTarget] = useState<string | number | null>(null);
  const [preview, setPreview] = useState<UserMergeHistoryDetailSchema | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const previewMutation = usePreviewUserMergeMutation(client);
  const createMutation = useCreateMutation<UserMergeRequestSchema>(client, "user", "usermergehistory");

  const sameAccount = source !== null && target !== null && String(source) === String(target);
  const canSubmit = source !== null && target !== null && !sameAccount;
  const pending = previewMutation.isPending || createMutation.isPending;

  const changeSource = (v: string | number | null | undefined) => {
    setSource(v ?? null);
    setPreview(null);
  };
  const changeTarget = (v: string | number | null | undefined) => {
    setTarget(v ?? null);
    setPreview(null);
  };

  const request = () => ({ source: Number(source), target: Number(target) });

  const handlePreview = () => {
    if (!canSubmit) return;
    setPreview(null);
    previewMutation.mutate(request(), {
      onSuccess: setPreview,
      onError: addErrorSnackbar,
    });
  };

  const handleExecute = () => {
    if (!canSubmit || !preview) return;
    createMutation.mutate(request(), {
      onSuccess: (data) => {
        addSnackbar("계정 병합이 완료되었습니다.", "success");
        setConfirmOpen(false);
        navigate(`/user/usermergehistory/${(data as unknown as UserMergeHistoryDetailSchema).id}`);
      },
      onError: (error) => {
        addErrorSnackbar(error);
        setConfirmOpen(false);
      },
    });
  };

  return (
    <Box sx={{ flexGrow: 1, width: "100%" }}>
      <Typography variant="h5">계정 병합</Typography>
      <Divider sx={{ my: 1, borderColor: "black" }} />

      <Stack spacing={2} sx={{ maxWidth: 900 }}>
        <Alert severity="warning">
          원본(source) 계정의 모든 데이터가 대상(target) 계정으로 이전되고, 원본 계정은 비활성화됩니다.
          <br />
          실행 전 반드시 미리보기로 이전 항목을 확인해 주세요.
        </Alert>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <ChoicePicker label="원본 계정 (비활성화될 계정)" source={USER_SOURCE} value={source} onChange={changeSource} required />
          </Box>
          <Box sx={{ flex: 1 }}>
            <ChoicePicker label="대상 계정 (유지될 계정)" source={USER_SOURCE} value={target} onChange={changeTarget} required />
          </Box>
        </Stack>

        {sameAccount && <Alert severity="error">원본과 대상이 동일한 계정입니다. 서로 다른 계정을 선택해 주세요.</Alert>}

        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="outlined" onClick={handlePreview} disabled={!canSubmit || pending} loading={previewMutation.isPending}>
            미리보기
          </Button>
          <Button variant="contained" color="error" onClick={() => setConfirmOpen(true)} disabled={!canSubmit || pending || !preview}>
            병합 실행
          </Button>
          {canSubmit && !preview && (
            <Typography variant="caption" color="text.secondary">
              먼저 미리보기로 이전 내역을 확인해야 병합을 실행할 수 있습니다.
            </Typography>
          )}
        </Stack>

        {preview && (
          <Stack spacing={1.5}>
            <Divider />
            <Typography variant="h6" fontWeight="bold">
              미리보기 결과
            </Typography>
            <MergeDirection source={preview.source} target={preview.target} />
            <Typography variant="subtitle2">이전될 데이터 ({preview.merged_objects.length}건)</Typography>
            <MergedObjectsTable objects={preview.merged_objects} />
          </Stack>
        )}
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>계정 병합 확인</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            원본 계정이 비활성화되고, 원본 계정의 모든 데이터가 대상 계정으로 이전됩니다.
            <br />이 작업은 병합 이력에서 되돌릴 수 있지만, 신중히 진행해 주세요.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit" disabled={createMutation.isPending}>
            취소
          </Button>
          <Button onClick={handleExecute} color="error" variant="contained" loading={createMutation.isPending}>
            병합 실행
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export const AdminUserMergePage: FC = () => (
  <BackendAdminSignInGuard>
    <ErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={<CircularProgress />}>
        <InnerAdminUserMergePage />
      </Suspense>
    </ErrorBoundary>
  </BackendAdminSignInGuard>
);

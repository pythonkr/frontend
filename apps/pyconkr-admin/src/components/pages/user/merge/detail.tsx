import { useBackendAdminClient, useRetrieveQuery, useRevertUserMergeMutation } from "@frontend/common/hooks/useAdminAPI";
import { UserMergeHistoryDetailSchema } from "@frontend/common/schemas/backendAdminAPI";
import {
  Button,
  ButtonProps,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, ReactNode, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { AdminEditor } from "@apps/pyconkr-admin/components/layouts/admin_editor";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

import { MergeDirection, MergedObjectsTable } from "./components";

const HIDDEN_FIELDS = ["source", "target", "merged_objects", "reverted_at", "updated_at", "updated_by", "deleted_at", "deleted_by", "str_repr"];

const InnerAdminUserMergeDetail: FC<{ id: string }> = ({ id }) => {
  const client = useBackendAdminClient();
  const { data } = useRetrieveQuery<UserMergeHistoryDetailSchema>(client, "user", "usermergehistory", id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const revertMutation = useRevertUserMergeMutation(client, id);

  if (!data) return <Navigate to="/user/usermergehistory" replace />;

  const reverted = !!data.reverted_at;

  const handleRevert = () => {
    revertMutation.mutate(undefined, {
      onSuccess: () => {
        addSnackbar("병합을 되돌렸습니다.", "success");
        setConfirmOpen(false);
      },
      onError: (error) => {
        addErrorSnackbar(error);
        setConfirmOpen(false);
      },
    });
  };

  const extraActions: ButtonProps[] = [
    {
      children: reverted ? "되돌린 병합" : "병합 되돌리기",
      color: "error",
      variant: "contained",
      disabled: reverted || revertMutation.isPending,
      onClick: () => setConfirmOpen(true),
    },
  ];

  const extraReadOnlyData: Record<string, ReactNode> = {
    상태: reverted ? <Chip size="small" label="되돌림" /> : <Chip size="small" color="success" label="병합됨" />,
    ...(reverted && data.reverted_at ? { "되돌린 일시": new Date(data.reverted_at).toLocaleString() } : {}),
  };

  return (
    <>
      <AdminEditor
        app="user"
        resource="usermergehistory"
        id={id}
        notModifiable
        notDeletable
        hidingFields={HIDDEN_FIELDS}
        extraActions={extraActions}
        extraReadOnlyData={extraReadOnlyData}
      >
        <Stack spacing={2} sx={{ my: 2 }}>
          <MergeDirection source={data.source} target={data.target} />
          <Divider />
          <Typography variant="h6" fontWeight="bold">
            이전된 데이터 ({data.merged_objects.length}건)
          </Typography>
          <MergedObjectsTable objects={data.merged_objects} />
        </Stack>
      </AdminEditor>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>병합 되돌리기 확인</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            대상 계정으로 이전되었던 데이터가 원본 계정으로 되돌아가고, 원본 계정이 다시 활성화됩니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit" disabled={revertMutation.isPending}>
            취소
          </Button>
          <Button onClick={handleRevert} color="error" variant="contained" loading={revertMutation.isPending}>
            되돌리기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const AdminUserMergeDetail: FC = () => {
  const { id } = useParams<{ id?: string }>();
  if (!id) return <Navigate to="/user/usermergehistory" replace />;

  return (
    <BackendAdminSignInGuard>
      <ErrorBoundary fallback={ErrorFallback}>
        <Suspense fallback={<CircularProgress />}>
          <InnerAdminUserMergeDetail id={id} />
        </Suspense>
      </ErrorBoundary>
    </BackendAdminSignInGuard>
  );
};

import { useBackendAdminClient, useModificationAuditPreviewQuery } from "@frontend/common/hooks/useAdminAPI";
import { Box, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";

import { ModificationAuditProperties } from "./components";
import { ApproveSubmitConfirmDialog, RejectSubmitConfirmDialog } from "./dialogs";
import { SubModificationAuditPage } from "./sub_pages";

type EditorStateType = { actionStatus?: "approve" | "reject" };

const InnerAdminModificationAuditEditor: FC = () => {
  const [editorState, setEditorState] = useState<EditorStateType>({});
  const { id } = useParams<{ id?: string }>();

  const backendAdminClient = useBackendAdminClient();
  const { data } = useModificationAuditPreviewQuery<Record<string, string>>(backendAdminClient, id || "");

  if (!data) return <Navigate to="/participant_portal_api/modificationaudit" replace />;

  const { modification_audit } = data;
  const { status, instance } = modification_audit;
  const { app, model } = instance;
  const btnDisabled = status !== "requested";

  const closeSubmitConfirmDialog = () => setEditorState((ps) => ({ ...ps, actionStatus: undefined }));
  const openApproveSubmitConfirmDialog = () => setEditorState((ps) => ({ ...ps, actionStatus: "approve" }));
  const openRejectSubmitConfirmDialog = () => setEditorState((ps) => ({ ...ps, actionStatus: "reject" }));

  return (
    <>
      <ApproveSubmitConfirmDialog
        open={editorState.actionStatus === "approve"}
        onClose={closeSubmitConfirmDialog}
        modificationAuditId={modification_audit.id}
      />
      <RejectSubmitConfirmDialog
        open={editorState.actionStatus === "reject"}
        onClose={closeSubmitConfirmDialog}
        modificationAuditId={modification_audit.id}
      />
      <Box sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }}>
        <Typography variant="h5" fontWeight="bold">
          {app.toUpperCase()} &gt; {model.toUpperCase()} &gt; 수정 심사
        </Typography>
        <Divider sx={{ my: 1, borderColor: "black" }} />
        <Stack sx={{ width: "100%", minHeight: "100%" }} spacing={2}>
          <Typography variant="h6" fontWeight="bold" children="심사 속성" />
          <ModificationAuditProperties audit={modification_audit} />
          <SubModificationAuditPage {...data} />
          <Stack alignItems="flex-end" spacing={1}>
            {btnDisabled && <Typography variant="body2" children={`현재 심사 상태가 ${status}입니다. 승인 또는 반려가 불가능합니다.`} />}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button disabled={btnDisabled} variant="contained" color="error" onClick={openRejectSubmitConfirmDialog} children="반려" />
              <Button disabled={btnDisabled} variant="contained" onClick={openApproveSubmitConfirmDialog} children="승인" />
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export const AdminModificationAuditEditor: FC = () => {
  return (
    <BackendAdminSignInGuard>
      <ErrorBoundary fallback={ErrorFallback}>
        <Suspense fallback={<CircularProgress />}>
          <InnerAdminModificationAuditEditor />
        </Suspense>
      </ErrorBoundary>
    </BackendAdminSignInGuard>
  );
};
